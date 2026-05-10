import supabase from '../config/supabaseClient.js'

import { getISTDate, getISTDateTime, getStorageTime } from '../utils/dateHelper.js';
import {
  getShiftDetails
} from '../utils/timeCalculator.js'

export const markAttendance =
  async (req, res) => {

    try {

      const {
        eid
      } = req.body

      // =========================
      // FIND EMPLOYEE
      // =========================

      const {
        data: employees,
        error: employeeError
      } = await supabase
        .from('employees')
        .select('*')
        .eq('eid', eid)

      if (
        employeeError ||
        !employees.length
      ) {

        return res.status(404).json({
          success: false,
          error: 'Employee not found'
        })

      }

      const employee =
        employees[0]

      // =========================
      // GET SHIFT DETAILS
      // =========================

      const shiftDetails =
        getShiftDetails(employee)

      if (!shiftDetails) {

        return res.status(400).json({
          success: false,
          error: 'No valid shift currently'
        })

      }

      const {
        shift,
        lateMinutes
      } = shiftDetails

      // =========================
      // TODAY DATE
      // =========================

      const today = getISTDate()

      // =========================
      // CHECK EXISTING RECORD
      // =========================

      const {
        data: existing
      } = await supabase
        .from('attendance')
        .select('*')
        .eq('eid', eid)
        .eq('date', today)
        .eq('shift', shift)

      // =========================
      // CHECK-IN
      // =========================

      if (!existing.length) {

        const {
          data,
          error
        } = await supabase
          .from('attendance')
          .insert([{
            eid,
            date: getISTDate(),
            shift,
            check_in:     getISTDateTime(),
            late_minutes: lateMinutes,
            status: 'Present',
            working_hours: 0
          }])
          .select('id, eid, date, shift, status')

        if (error) {

          return res.status(500).json({
            success: false,
            error: error.message
          })

        }

        return res.status(200).json({
          success: true,
          message:
            `${shift} check-in marked`,
          attendance: data[0]
        })

      }

      // =========================
      // CHECK-OUT
      // =========================

      const attendance =
        existing[0]

      if (attendance.check_out) {

        return res.status(400).json({
          success: false,
          error:
            'Already checked out'
        })

      }

      const checkInString = attendance.check_in.endsWith('Z') ? attendance.check_in : `${attendance.check_in}Z`;
      const checkIn = new Date(checkInString)

      const checkOutISO = getStorageTime()

      const diffMs =
        new Date(checkOutISO) - checkIn

      const workingHours =
        Number(
          (
            diffMs /
            (1000 * 60 * 60)
          ).toFixed(2)
        )

      const {
        data,
        error
      } = await supabase
        .from('attendance')
        .update({
          check_out: checkOut,
          working_hours:
            workingHours
        })
        .eq('id', attendance.id)
        .select('id, eid, date, shift, status, working_hours')

      if (error) {

        return res.status(500).json({
          success: false,
          error: error.message
        })

      }

      return res.status(200).json({
        success: true,
        message:
          `${shift} check-out marked`,
        attendance: data[0]
      })

    } catch (err) {

      console.error(err)

      return res.status(500).json({
        success: false,
        error: err.message
      })

    }

  }