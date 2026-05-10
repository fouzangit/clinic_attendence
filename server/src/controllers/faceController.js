import * as faceapi from 'face-api.js'
import canvas from 'canvas'

import path from 'path'
import fs from 'fs'

import supabase from '../config/supabaseClient.js'

const { Canvas, Image, ImageData } = canvas

// Configure face-api for Node.js
faceapi.env.monkeyPatch({
  Canvas,
  Image,
  ImageData
})

// LOAD AI MODELS
const loadModels = async () => {

  try {

    const modelPath = path.join(
      process.cwd(),
      'models'
    )

    await faceapi.nets.tinyFaceDetector.loadFromDisk(
      modelPath
    )

    await faceapi.nets.faceLandmark68Net.loadFromDisk(
      modelPath
    )

    await faceapi.nets.faceRecognitionNet.loadFromDisk(
      modelPath
    )

    console.log('Face models loaded')

  } catch (err) {

    console.error(
      'Model loading error:',
      err
    )
  }
}

// LOAD MODELS (safe async init)
let modelsLoaded = false;
const ensureModels = async () => {
  if (modelsLoaded) return;
  await loadModels();
  modelsLoaded = true;
};
// Eagerly load on import
ensureModels().catch(err => console.error('Face model preload failed:', err));

// VERIFY FACE
export const verifyFaceImage = async (eid, image) => {
  // ENSURE MODELS ARE LOADED
  await ensureModels();

  // VALIDATION
  if (!eid || !image) {
    throw new Error('EID and image required');
  }

  // FIND EMPLOYEE
  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('eid', eid)
    .single();

  if (error || !employee) {
    throw new Error('Employee not found');
  }

  // IMAGE CHECK
  if (!employee.face_image) {
    throw new Error('Employee image missing — please upload a face photo for this employee');
  }

  // =========================
  // LOAD STORED IMAGE
  // Supports two formats:
  //   1. base64 data URL  → data:image/jpeg;base64,...  (new, DB-stored)
  //   2. local file path  → /uploads/filename.jpg       (legacy)
  // =========================
  let storedImage;

  if (employee.face_image.startsWith('data:')) {
    // BASE64 → load directly from data URL
    storedImage = await canvas.loadImage(employee.face_image);
  } else {
    // LEGACY FILE PATH → resolve from disk
    const cleanImagePath = (() => {
      try {
        const imagePath = new URL(employee.face_image).pathname;
        return imagePath.replace(/^\/uploads\//, 'uploads/');
      } catch {
        return employee.face_image.replace(/^\/uploads\//, 'uploads/');
      }
    })();

    const employeeImagePath = path.join(process.cwd(), cleanImagePath);

    if (!fs.existsSync(employeeImagePath)) {
      throw new Error('Stored employee image file not found — please re-upload the face photo');
    }

    storedImage = await canvas.loadImage(employeeImagePath);
  }

  // LOAD CAPTURED IMAGE (always base64 from webcam)
  const capturedImage = await canvas.loadImage(image);

  // DETECT STORED FACE
  const storedDetection = await faceapi
    .detectSingleFace(storedImage, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  // DETECT CAPTURED FACE
  const capturedDetection = await faceapi
    .detectSingleFace(capturedImage, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  // FACE VALIDATION
  if (!storedDetection || !capturedDetection) {
    throw new Error('Face not detected properly');
  }

  // FACE COMPARISON
  const distance = faceapi.euclideanDistance(
    storedDetection.descriptor,
    capturedDetection.descriptor
  );

  console.log('Face distance:', distance);

  // THRESHOLD: Lower is stricter. 0.55 is balanced (0.45 was too strict).
  const isMatch = distance < 0.55;

  const matchPercentage = Math.round(Math.max(0, (1 - distance) * 100));

  if (!isMatch) {
    throw new Error(`Face does not match. Only ${matchPercentage}% similarity.`);
  }

  return { employee, matchPercentage, distance };
};

export const verifyFace = async (req, res) => {
  try {
    await ensureModels();
    const { eid, image } = req.body;
    const result = await verifyFaceImage(eid, image);
    
    return res.status(200).json({
      success: true,
      message: 'Face verified successfully',
      employee: result.employee,
      matchPercentage: result.matchPercentage
    });
  } catch (err) {
    console.error(err);
    const statusCode = 
      err.message === 'Employee not found' || err.message === 'Stored employee image missing' ? 404 : 
      err.message.startsWith('Face does not match') ? 403 : 400;
                       
    return res.status(statusCode).json({
      success: false,
      error: err.message
    });
  }
};
