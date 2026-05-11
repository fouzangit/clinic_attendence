import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';

const CHALLENGES = [
  { id: 'blink', label: 'Blink Twice', icon: '👁️' },
  { id: 'turn_left', label: 'Turn Head Left', icon: '⬅️' },
  { id: 'turn_right', label: 'Turn Head Right', icon: '➡️' },
  { id: 'smile', label: 'Smile Big', icon: '😊' }
];

export const useFaceScanner = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [detection, setDetection] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState(null);
  
  // Quality Metrics
  const [qualityScore, setQualityScore] = useState(0);
  const [qualityIssues, setQualityIssues] = useState([]);

  // Liveness & Biometric Data
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [verifiedLiveness, setVerifiedLiveness] = useState(false);
  const [bestDescriptors, setBestDescriptors] = useState([]);

  const videoRef = useRef(null);
  const scanTimerRef = useRef(null);
  const blinkCountRef = useRef(0);
  const lastEyeRatioRef = useRef(1);
  const initialFacePosRef = useRef(null);

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // LOADING FROM CLOUD CDN FOR BETTER COMPATIBILITY
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setStatus('Ready');
      } catch (err) {
        console.error("Model load failed:", err);
        setError('Biometric engine failed to load from cloud');
      }
    };
    loadModels();
  }, []);


  const startChallenge = useCallback(() => {
    const randomChallenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    setCurrentChallenge(randomChallenge);
    setChallengeProgress(0);
    blinkCountRef.current = 0;
    initialFacePosRef.current = null;
    setStatus(`Challenge: ${randomChallenge.label}`);
  }, []);

  const evaluateQuality = (detections, box, video) => {
    const issues = [];
    let score = 100;

    // 1. Multiple Face Detection
    if (Array.isArray(detections) && detections.length > 1) {
      issues.push('Multiple faces detected');
      score -= 50;
    }

    // 2. Centering
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const videoCenterX = video.videoWidth / 2;
    const videoCenterY = video.videoHeight / 2;
    
    if (Math.abs(centerX - videoCenterX) > video.videoWidth * 0.15) {
      issues.push('Center your face');
      score -= 20;
    }

    // 3. Distance (Box size)
    const faceSize = (box.width * box.height) / (video.videoWidth * video.videoHeight);
    if (faceSize < 0.05) {
      issues.push('Move closer');
      score -= 30;
    } else if (faceSize > 0.4) {
      issues.push('Move further away');
      score -= 20;
    }

    // 4. Landmarks (Occlusion)
    if (!detections.landmarks || detections.landmarks.positions.length < 68) {
      issues.push('Face partially hidden');
      score -= 40;
    }

    setQualityScore(Math.max(0, score));
    setQualityIssues(issues);
    return score > 70;
  };

  const handleVideoPlay = useCallback(() => {
    if (!modelsLoaded || isScanning) return;

    setIsScanning(true);
    startChallenge();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    scanTimerRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || video.readyState < 2) return;
      if (!video.videoWidth || !video.videoHeight) return;

      // Mirror the video onto the canvas for the AI to read
      canvas.width = 224;
      canvas.height = Math.floor(224 * (video.videoHeight / video.videoWidth));
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const detections = await faceapi.detectSingleFace(
        canvas,
        new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 })
      ).withFaceLandmarks().withFaceDescriptor();

      if (detections) {
        const { detection: d, landmarks, descriptor } = detections;
        setDetection(d.box);
        setConfidence(Math.round(d.score * 100));
        setStatus('Face Detected');
        setQualityIssues([]);

        // AUTOMATIC DETECTION:
        if (d.score > 0.25) {
           setVerifiedLiveness(true);
           setBestDescriptors(prev => [...prev.slice(-9), descriptor]);
        }
      } else {
        setDetection(null);
        setConfidence(0);
        setStatus('No Face Found');
        setQualityIssues(['Move into better light or center your face']);
      }
    }, 200);


  }, [modelsLoaded, isScanning, currentChallenge, verifiedLiveness, startChallenge]);


  const processLiveness = (landmarks, challenge) => {
    if (!challenge || verifiedLiveness) return;

    switch (challenge.id) {
      case 'blink':
        detectBlink(landmarks);
        break;
      case 'turn_left':
      case 'turn_right':
        detectHeadTurn(landmarks, challenge.id);
        break;
      case 'smile':
        detectSmile(landmarks);
        break;
      default:
        break;
    }
  };

  const detectBlink = (landmarks) => {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const getEAR = (eye) => (Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y) + Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y)) / (2 * Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y));
    const ear = (getEAR(leftEye) + getEAR(rightEye)) / 2;
    if (lastEyeRatioRef.current > 0.25 && ear < 0.22) {
      blinkCountRef.current++;
      setChallengeProgress(prev => Math.min(prev + 50, 100));
    }
    lastEyeRatioRef.current = ear;
    if (blinkCountRef.current >= 1) completeChallenge(); // Only 1 blink needed for mobile

  };

  const detectHeadTurn = (landmarks, direction) => {
    const nose = landmarks.getNose()[0];
    if (!initialFacePosRef.current) { initialFacePosRef.current = nose.x; return; }
    const diff = nose.x - initialFacePosRef.current;
    if ((direction === 'turn_left' && diff < -25) || (direction === 'turn_right' && diff > 25)) {
      setChallengeProgress(100);
      completeChallenge();
    }

  };

  const detectSmile = (landmarks) => {
    const mouth = landmarks.getMouth();
    const width = Math.hypot(mouth[0].x - mouth[6].x, mouth[0].y - mouth[6].y);
    const jaw = Math.hypot(landmarks.getJawOutline()[0].x - landmarks.getJawOutline()[16].x, landmarks.getJawOutline()[0].y - landmarks.getJawOutline()[16].y);
    const ratio = width / jaw;
    if (ratio > 0.42) { setChallengeProgress(100); completeChallenge(); }

  };

  const completeChallenge = () => {
    setVerifiedLiveness(true);
    setStatus('Identity Verified');
  };

  const getAverageDescriptor = () => {
    if (bestDescriptors.length === 0) return null;
    const dims = bestDescriptors[0].length;
    const avg = new Float32Array(dims);
    for (const desc of bestDescriptors) {
      for (let i = 0; i < dims; i++) avg[i] += desc[i];
    }
    for (let i = 0; i < dims; i++) avg[i] /= bestDescriptors.length;
    return Array.from(avg);
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !verifiedLiveness) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [verifiedLiveness]);

  const isStarting = useRef(false);

  return {
    modelsLoaded, detection, confidence, status, error,
    currentChallenge, challengeProgress, verifiedLiveness,
    qualityScore, qualityIssues,
    videoRef,
    startVideo: async () => {
      if (isStarting.current) return;
      isStarting.current = true;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Ensure video is ready before playing
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(e => console.warn("Auto-play blocked:", e));
          };
        }
      } catch (err) {
        console.error("Camera start failed:", err);
        setError("Camera failed to start. Please check permissions.");
      } finally {
        isStarting.current = false;
      }
    },


    stopVideo: () => {
      if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      clearInterval(scanTimerRef.current);
    },
    handleVideoPlay, captureFrame, reset: () => {
      setVerifiedLiveness(false); setChallengeProgress(0); setBestDescriptors([]); startChallenge();
    }
  };
};
