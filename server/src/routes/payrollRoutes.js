import express from 'express'
import supabase from '../config/supabaseClient.js'
import { protect, adminOnly } from '../middlewares/authMiddleware.js'
import {
  generatePayroll
} from '../controllers/payrollController.js'

const router = express.Router()

// All payroll routes require authentication
router.use(protect)

// =========================
// GENERATE PAYROLL
// =========================

router.post(
  '/generate',
  generatePayroll
)

// =========================
// GET PAYROLL HISTORY
// =========================

router.get('/', async (req, res) => {

  try {

    const {
      data,
      error
    } = await supabase
      .from('payroll')
      .select('*')
      .order('month', {
        ascending: false
      })

    if (error) {

      return res.status(500).json({
        success: false,
        error: error.message
      })

    }

    const employeeIds = [
      ...new Set(
        (data || [])
          .map((payroll) => payroll.eid)
          .filter(Boolean)
      )
    ]

    let employeesByEid = {}

    if (employeeIds.length > 0) {
      const {
        data: employees,
        error: employeeError
      } = await supabase
        .from('employees')
        .select('eid, full_name, role')
        .in('eid', employeeIds)

      if (employeeError) {
        return res.status(500).json({
          success: false,
          error: employeeError.message
        })
      }

      employeesByEid = (employees || []).reduce((acc, employee) => {
        acc[employee.eid] = employee
        return acc
      }, {})
    }

    const payrolls = (data || []).map((payroll) => ({
      ...payroll,
      employee_name:
        employeesByEid[payroll.eid]?.full_name ||
        payroll.eid ||
        'Unknown employee',
      employee_role:
        employeesByEid[payroll.eid]?.role || 'N/A'
    }))

    return res.status(200).json({
      success: true,
      payrolls
    })

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message
    })

  }

})

export default router
