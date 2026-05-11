import React, {
  useEffect,
  useRef,
  useState
} from 'react'

import axios from 'axios'
import toast from 'react-hot-toast'

const FaceScanner = ({
  eid,
  employeeImage,
  onSuccess,
  onCapture
}) => {

  const videoRef = useRef()

  const [loading, setLoading] = useState(false)
  const [cameraError, setCameraError] = useState('')

  // =========================
  // START CAMERA
  // =========================

  useEffect(() => {
    startVideo()
  }, [])

  const startVideo = async () => {
    try {
      setCameraError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error(err)
      setCameraError(
        'Camera access is blocked. Allow camera permission.'
      )
      toast.error('Camera permission denied')
    }
  }

  const verifyCapturedImage = async (capturedImage) => {
    console.log('Sending face verification request...');
    const response = await axios.post('/api/face/verify', {
      eid,
      image: capturedImage
    })

    if (response.data.success) {
      console.log('Face verification success');
      toast.success('Face verified successfully')
      if (typeof onSuccess === 'function') onSuccess()
    } else {
      console.warn('Face verification failed:', response.data.error);
      toast.error('Face does not match')
    }
  }

  // =========================
  // VERIFY FACE (BACKEND)
  // =========================

  const verifyFace = async () => {
    try {
      if (!eid && !onCapture) {
        toast.error('Employee ID missing')
        return
      }

      if (!videoRef.current?.videoWidth) {
        toast.error('Camera is not ready. Try reset camera.')
        return
      }

      // CAPTURE FRAME
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoRef.current, 0, 0)
      const capturedImage = canvas.toDataURL('image/jpeg')

      if (onCapture) {
        onCapture(capturedImage)
        return
      }

      setLoading(true)
      await verifyCapturedImage(capturedImage)

    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Face verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl shadow-2xl bg-black aspect-video">
        <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover mirror"
        />
        {cameraError && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white text-center p-6 md:p-8">
                <div className="text-xl md:text-3xl font-bold mb-4">Camera unavailable</div>
                <p className="text-base md:text-xl max-w-xl">{cameraError}</p>
            </div>
        )}

        {loading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white"></div>
            </div>
        )}
        <div className="absolute inset-0 border-[20px] border-white/10 pointer-events-none rounded-3xl"></div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-6 md:mt-10 w-full max-w-2xl">
        <button
          onClick={startVideo}
          className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-4 md:py-5 rounded-xl md:rounded-2xl text-lg md:text-2xl font-bold transition-all shadow-lg"
        >
          Reset Camera
        </button>

        <button
          onClick={verifyFace}
          disabled={loading}
          className="flex-1 md:flex-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-2xl text-lg md:text-2xl font-bold disabled:opacity-50 transition-all shadow-lg"
        >
          {loading ? 'Analyzing...' : (onCapture ? 'Capture Image' : 'Verify Identity')}
        </button>
      </div>

    </div>
  )
}

export default FaceScanner
