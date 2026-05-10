import express from 'express'

import cors from 'cors'

import dotenv from 'dotenv'

import path from 'path'

import { fileURLToPath } from 'url'

// =========================
// ROUTES
// =========================

import employeeRoutes
from './routes/employeeRoutes.js'

import attendanceRoutes
from './routes/attendanceRoutes.js'

import payrollRoutes
from './routes/payrollRoutes.js'

import faceRoutes
from './routes/faceRoutes.js'

import uploadRoutes
from './routes/uploadRoutes.js'

import authRoutes
from './routes/authRoutes.js'

dotenv.config()

const app = express()

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const serverRoot = path.resolve(__dirname, '..')
const projectRoot = path.resolve(serverRoot, '..')
const clientDistPath = path.join(projectRoot, 'client', 'dist')
const uploadsPath = path.join(serverRoot, 'uploads')

// =========================
// MIDDLEWARE
// =========================

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5050',
  'http://127.0.0.1:5050',
  ... (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()) : [])
]

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Large JSON support
app.use(express.json({
  limit: '10mb'
}))

app.use(express.urlencoded({
  extended: true
}))

// =========================
// STATIC FOLDER
// =========================
app.use(
  '/uploads',
  express.static(uploadsPath)
)

// =========================
// API ROUTES
// =========================

app.use(
  '/api/employees',
  employeeRoutes
)

app.use(

  '/api/attendance',

  attendanceRoutes

)

app.use(

  '/api/payroll',

  payrollRoutes

)

app.use(

  '/api/face',

  faceRoutes

)

app.use(

  '/api/upload',

  uploadRoutes

)

app.use(

  '/api/auth',

  authRoutes

)

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    message: 'Dental Clinic API Running'
  })
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDistPath))

  app.get(/^(?!\/api|\/uploads).*/, (req, res) =>
    res.sendFile(path.join(clientDistPath, 'index.html'))
  )
} else {
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Dental Clinic API Running'
    })
  })
}

// =========================
// ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// =========================
// EXPORT
// =========================

export default app
