import express from 'express'

import supabase from '../config/supabaseClient.js'

import {
  getDistance
} from 'geolib'

import { getISTDate, getISTDateTime, getStorageTime } from '../utils/dateHelper.js'
import { getShiftDetails } from '../utils/timeCalculator.js'
import { protect, adminOnly } from '../middlewares/authMiddleware.js'
import { markAttendance } from '../controllers/attendanceController.js'
import { verifyFaceImage } from '../controllers/faceController.js'

const router = express.Router()

// Temporarily disabled for demo
router.use(protect)

// =========================
// GET ATTENDANCE HISTORY
// =========================

router.get('/', async (req, res) => {

  try {

    const {
      data,
      error
    } = await supabase
      .from('attendance')
      .select('*')
      .order('created_at', {
        ascending: false
      })

    if (error) {

      return res.status(500).json({

        success: false,

        error:
          error.message

      })

    }

    const attendance = (data || []).map(record => ({
      ...record,
      employee_name: record.employees?.full_name || record.eid
    }))

    return res.status(200).json({

      success: true,

      attendance

    })

  } catch (err) {

    return res.status(500).json({

      success: false,

      error:
        err.message

    })

  }

})

// =========================
// CHECK IN
// =========================

router.post('/check-in', async (req, res) => {

  try {

    const {

      eid,

      latitude,
      longitude,

      image,

      shift

    } = req.body

    console.log(
      'CHECK IN BODY:',
      { ...req.body, image: req.body.image ? 'Base64Image' : undefined }
    )

    // =========================
    // VALIDATION
    // =========================

    if (!eid) {
      return res.status(400).json({ success: false, error: 'Employee ID missing' })
    }

    if (!image) {
      return res.status(400).json({ success: false, error: 'Face image required for verification' })
    }

    if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
      return res.status(400).json({ success: false, error: 'GPS coordinates are required for check-in' })
    }

    const parsedLat = Number(latitude)
    const parsedLon = Number(longitude)
    if (isNaN(parsedLat) || isNaN(parsedLon)) {
      return res.status(400).json({ success: false, error: 'Invalid GPS coordinates provided' })
    }

    let matchPercentage = 0;
    // =========================
    // SERVER-SIDE FACE VERIFICATION
    // =========================
    try {
      const faceResult = await verifyFaceImage(eid, image);
      matchPercentage = faceResult.matchPercentage;
    } catch (faceErr) {
      return res.status(403).json({
        success: false,
        error: faceErr.message || 'Face verification failed'
      });
    }

    // =========================
    // GET CLINIC SETTINGS
    // =========================

    const {

      data: clinicData,

      error: clinicError

    } = await supabase
      .from('clinic_settings')
      .select('*')

    if (

      clinicError ||

      !clinicData ||

      clinicData.length === 0

    ) {

      return res.status(500).json({

        success: false,

        error:
          'Clinic settings not found'

      })

    }

    const clinic =
      clinicData[0]

    // =========================
    // DISTANCE CHECK
    // =========================

    const distance = getDistance(
      { latitude: parsedLat, longitude: parsedLon },
      {
        latitude: Number(clinic.clinic_latitude),
        longitude: Number(clinic.clinic_longitude)
      }
    )

    console.log(
      'DISTANCE:',
      distance
    )

    // =========================
    // OUTSIDE RADIUS
    // =========================

    if (

      distance >
      clinic.allowed_radius

    ) {

      return res.status(403).json({

        success: false,

        error:
          'Outside clinic radius'

      })

    }

    // =========================
    // TODAY
    // =========================

    const today = getISTDate()

    // =========================
    // GET EMPLOYEE DETAILS (to get UUID)
    // =========================

    const {
      data: employeeData,
      error: employeeError
    } = await supabase
      .from('employees')
      .select('id, full_name, role')
      .eq('eid', eid)
      .single()

    if (employeeError || !employeeData) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      })
    }

    // =========================
    // LATE MINUTES & SHIFT
    // =========================

    const shiftInfo = getShiftDetails(employeeData)
    if (!shiftInfo && !shift) {
      return res.status(400).json({
        success: false,
        error: 'You are attempting to check in outside of allowed shift hours.'
      })
    }

    const employeeShift = shift || shiftInfo?.shift || 'Morning'
    const lateMinutes = shiftInfo?.lateMinutes || 0

    // =========================
    // CHECK EXISTING
    // =========================

    const {

      data: existingAttendance,

      error: existingError

    } = await supabase
      .from('attendance')
      .select('*')
      .eq('eid', eid)
      .eq('date', today)
      .eq('shift', employeeShift)

    if (existingError) {

      return res.status(500).json({

        success: false,

        error:
          existingError.message

      })

    }

    if (

      existingAttendance &&

      existingAttendance.length > 0

    ) {

      return res.status(400).json({

        success: false,

        error:
          'Already checked in today'

      })

    }

    // =========================
    // CURRENT TIME
    // =========================

    const currentTime = getStorageTime()

    // =========================
    // INSERT ATTENDANCE
    // =========================

    const {

      data,

      error

    } = await supabase
      .from('attendance')
      .insert([{
        eid,
        date: today,
        check_in: currentTime,
        shift: shift || employeeShift,
        late_minutes: lateMinutes,
        status: 'Present',
        working_hours: 0
      }])
      .select('id, eid, date, shift, status')

    console.log(
      'CHECK IN DATA:',
      data
    )

    console.log(
      'CHECK IN ERROR:',
      error
    )

    if (error) {

      return res.status(500).json({

        success: false,

        error:
          error.message

      })

    }

    return res.status(201).json({

      success: true,

      message:
        'Attendance marked successfully',

      attendance:
        data[0],

      matchPercentage

    })

  } catch (err) {

    console.log(
      'CHECK IN ERROR:',
      err
    )

    return res.status(500).json({

      success: false,

      error:
        err.message

    })

  }

})

// =========================
// MANUAL MARK (ADMIN)
// =========================

router.post('/mark', markAttendance)

// =========================
// CHECK OUT
// =========================

router.post('/check-out', async (req, res) => {

  try {

    const {

      eid,

      latitude,
      longitude,

      image

    } = req.body

    console.log(
      'CHECK OUT BODY:',
      { ...req.body, image: req.body.image ? 'Base64Image' : undefined }
    )

    // =========================
    // VALIDATION
    // =========================

    if (!eid) {
      return res.status(400).json({ success: false, error: 'Employee ID missing' })
    }

    if (!image) {
      return res.status(400).json({ success: false, error: 'Face image required for verification' })
    }

    let matchPercentage = 0;
    // =========================
    // SERVER-SIDE FACE VERIFICATION
    // =========================
    try {
      const faceResult = await verifyFaceImage(eid, image);
      matchPercentage = faceResult.matchPercentage;
    } catch (faceErr) {
      return res.status(403).json({
        success: false,
        error: faceErr.message || 'Face verification failed'
      });
    }

    // =========================
    // TODAY
    // =========================

    const today = getISTDate()

    // =========================
    // GET TODAY ATTENDANCE
    // =========================

    const {
      data: attendanceRecords,
      error: fetchError
    } = await supabase
      .from('attendance')
      .select('*')
      .eq('eid', eid)
      .is('check_out', null)
      .order('check_in', { ascending: false })
      .limit(1)

    if (fetchError) {
      return res.status(500).json({
        success: false,
        error: fetchError.message
      })
    }

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active check-in found for today. Please check in first.'
      })
    }

    const attendance = attendanceRecords[0]

    // =========================
    // TIME CALCULATION
    // =========================

    const checkInString = attendance.check_in.endsWith('Z') ? attendance.check_in : `${attendance.check_in}Z`;
    const checkInTime = new Date(checkInString)

    const checkOutTimeISO = getStorageTime()

    const diffMs =
      new Date(checkOutTimeISO) - checkInTime

    const workingHours =
      Number(
        (
          diffMs /
          (1000 * 60 * 60)
        ).toFixed(2)
      )

    console.log({
      checkIn:
        checkInTime,
      checkOut:
        checkOutTimeISO,
      workingHours
    })

    // =========================
    // UPDATE
    // =========================

    const {
      data,
      error
    } = await supabase
      .from('attendance')
      .update({
        check_out:
          checkOutTimeISO,

        working_hours:
          workingHours
      })
      .eq(
        'id',
        attendance.id
      )
      .select('id, eid, date, shift, status, working_hours')

    if (error) {

      return res.status(500).json({

        success: false,

        error:
          error.message

      })

    }

    return res.status(200).json({

      success: true,

      message:
        'Checked out successfully',

      attendance:
        data[0],

      matchPercentage

    })

  } catch (err) {

    console.log(
      'CHECK OUT ERROR:',
      err
    )

    return res.status(500).json({

      success: false,

      error:
        err.message

    })

  }

})

// =========================
// CLINIC SETTINGS
// =========================

router.get('/settings', adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clinic_settings')
      .select('*')
      .single()

    if (error) throw error

    res.status(200).json({
      success: true,
      settings: data
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    })
  }
})

router.post('/settings', adminOnly, async (req, res) => {
  try {
    const { clinic_latitude, clinic_longitude, allowed_radius } = req.body

    const { data: existing } = await supabase.from('clinic_settings').select('id').single()

    let result;
    if (existing) {
      result = await supabase
        .from('clinic_settings')
        .update({
          clinic_latitude: Number(clinic_latitude),
          clinic_longitude: Number(clinic_longitude),
          allowed_radius: Number(allowed_radius)
        })
        .eq('id', existing.id)
        .select()
    } else {
      result = await supabase
        .from('clinic_settings')
        .insert([{
          clinic_latitude: Number(clinic_latitude),
          clinic_longitude: Number(clinic_longitude),
          allowed_radius: Number(allowed_radius)
        }])
        .select()
    }

    if (result.error) throw result.error

    res.status(200).json({
      success: true,
      settings: result.data[0]
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    })
  }
})

export default router
