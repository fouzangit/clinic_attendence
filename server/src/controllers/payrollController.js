import supabase from '../config/supabaseClient.js'

import {
  calculateSalary
} from '../utils/salaryCalculator.js'

const getMonthRange = (month) => {
  const normalizedMonth = String(month || '').trim()
  let year
  let monthIndex

  const isoMatch = normalizedMonth.match(/^(\d{4})-(\d{2})$/)

  if (isoMatch) {
    year = Number(isoMatch[1])
    monthIndex = Number(isoMatch[2]) - 1
  } else {
    const parsedDate = new Date(`1 ${normalizedMonth}`)

    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error('Invalid payroll month')
    }

    year = parsedDate.getFullYear()
    monthIndex = parsedDate.getMonth()
  }

  const startDate = new Date(Date.UTC(year, monthIndex, 1))
  const endDate = new Date(Date.UTC(year, monthIndex + 1, 1))

  return {
    start: startDate.toISOString().slice(0, 10),
    end: endDate.toISOString().slice(0, 10)
  }
}

export const generatePayroll =
  async (req, res) => {

    try {

      const { eid, month } = req.body

      const monthRange = getMonthRange(month)

      // =========================
      // FIND EMPLOYEE
      // =========================

      const {
        data: employees,
        error: employeeError
      } = await supabase
        .from('employees')
        .select('id, eid, full_name, role, hourly_rate')
        .eq('eid', eid)

      if (
        employeeError ||
        !employees ||
        employees.length === 0
      ) {

        return res.status(404).json({
          success: false,
          error: 'Employee not found'
        })

      }

      const employee =
        employees[0]

      // =========================
      // GET ATTENDANCE RECORDS
      // =========================

      const {
        data: attendanceRecords,
        error: attendanceError
      } = await supabase
        .from('attendance')
        .select('working_hours, late_minutes, status, date')
        .eq('eid', eid)
        .gte('date', monthRange.start)
        .lt('date', monthRange.end)

      if (attendanceError) {

        return res.status(500).json({
          success: false,
          error:
            attendanceError.message
        })

      }

      // =========================
      // CALCULATE SALARY
      // =========================

      const payrollData =
        calculateSalary(
          employee,
          attendanceRecords || []
        )

      // =========================
      // SAVE PAYROLL
      // =========================

      // Only use eid to link payroll to employee.
      // employee_id is skipped to avoid UUID/integer type mismatch
      // (the employees.id may be an integer, not a UUID).
      const payrollRecord = {
        eid,
        month,
        total_hours:   payrollData.totalHours,
        late_minutes:  payrollData.totalLateMinutes,
        gross_salary:  payrollData.grossSalary,
        deduction:     payrollData.deduction,
        final_salary:  payrollData.finalSalary
      }

      const {
        data: existingPayroll
      } = await supabase
        .from('payroll')
        .select('id')
        .eq('eid', eid)
        .eq('month', month)
        .maybeSingle()

      const query = existingPayroll
        ? supabase
          .from('payroll')
          .update(payrollRecord)
          .eq('id', existingPayroll.id)
        : supabase
          .from('payroll')
          .insert([payrollRecord])

      const {
        data,
        error
      } = await query
        .select('id, eid, month, final_salary')

      if (error) {

        return res.status(500).json({
          success: false,
          error: error.message
        })

      }

      return res.status(200).json({

        success: true,

        payroll: {
          ...data[0],
          employee_name: employee.full_name,
          attendance_count: payrollData.attendanceCount,
          calculated_deduction: payrollData.calculatedDeduction
        }

      })

    } catch (err) {

      console.error(err)

      return res.status(500).json({

        success: false,

        error: err.message

      })

    }

  }
