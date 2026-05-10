import express from 'express'
import multer from 'multer'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// All upload routes require auth
router.use(protect)

// =========================
// MULTER — Memory Storage Only
// Image is converted to base64 and stored directly
// in the Supabase `employees.face_image` column.
// No external storage bucket needed — always works.
// =========================

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
})

// =========================
// POST /api/upload
// Converts image buffer → base64 data URL
// Returns the base64 string as imageUrl
// This gets stored directly in employees.face_image column
// =========================

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      })
    }

    // Convert buffer to base64 data URL
    const base64 = req.file.buffer.toString('base64')
    const mimeType = req.file.mimetype
    const imageUrl = `data:${mimeType};base64,${base64}`

    console.log(`[UPLOAD] Image converted to base64 (${Math.round(imageUrl.length / 1024)}KB)`)

    return res.status(200).json({
      success: true,
      imageUrl
    })

  } catch (err) {
    console.error('[UPLOAD ERROR]', err)
    return res.status(500).json({
      success: false,
      error: err.message
    })
  }
})

export default router
