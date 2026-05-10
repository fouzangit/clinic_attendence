import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import supabase from '../config/supabaseClient.js'

const router = express.Router()

// =========================
// ADMIN LOGIN
// =========================

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' })
    }

    // ADMIN LOGIN via hardcoded env credentials (Supabase handles real admin auth via client)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    if (email === adminEmail && password === adminPassword) {
      const token = jwt.sign(
        { email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      )
      return res.status(200).json({
        success: true,
        token,
        admin: { email: adminEmail, role: 'admin' }
      })
    }

    return res.status(401).json({ success: false, error: 'Invalid admin credentials' })

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

// =========================
// EMPLOYEE LOGIN
// =========================

router.post('/employee-login', async (req, res) => {
  try {
    const eid = String(req.body.eid || '').trim()
    const password = String(req.body.password || '').trim()

    if (!eid || !password) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID and password are required'
      })
    }

    // Fetch employee by EID only (do NOT filter by plaintext password)
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('eid', eid)
      .single()

    if (error || !data) {
      return res.status(401).json({ success: false, error: 'Invalid employee credentials' })
    }

    // =========================
    // COMPARE PASSWORD (bcrypt or plain fallback for migration)
    // =========================
    let passwordMatch = false

    if (data.password) {
      const isHashed = data.password.startsWith('$2') // bcrypt hash prefix
      if (isHashed) {
        // Compare using bcrypt
        passwordMatch = await bcrypt.compare(password, data.password)
      } else {
        // Legacy plain-text comparison (for existing accounts not yet migrated)
        passwordMatch = (data.password === password)
        if (passwordMatch) {
          // Silently migrate to hashed password on first login
          const hashed = await bcrypt.hash(password, 12)
          await supabase
            .from('employees')
            .update({ password: hashed })
            .eq('eid', eid)
          console.log(`[AUTH] Migrated password to bcrypt for employee: ${eid}`)
        }
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid employee credentials' })
    }

    const token = jwt.sign(
      { eid: data.eid, id: data.id, role: 'employee' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    // Strip password from response
    const { password: _pw, ...safeEmployee } = data

    return res.status(200).json({
      success: true,
      token,
      employee: safeEmployee
    })

  } catch (err) {
    console.error('[EMPLOYEE LOGIN ERROR]', err)
    return res.status(500).json({ success: false, error: err.message })
  }
})

// =========================
// HASH PASSWORD UTILITY (Admin use — for creating new employee passwords)
// =========================
// POST /api/auth/hash-password  { password: "rawPassword" }
// Returns hashed password to store in DB
router.post('/hash-password', async (req, res) => {
  try {
    const { password, adminKey } = req.body
    if (adminKey !== process.env.JWT_SECRET) {
      return res.status(403).json({ success: false, error: 'Forbidden' })
    }
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password required' })
    }
    const hashed = await bcrypt.hash(password, 12)
    return res.status(200).json({ success: true, hashed })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

export default router
