import express from 'express'
import bcrypt from 'bcryptjs'
import supabase from '../config/supabaseClient.js'
import { protect, adminOnly } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Temporarily disabled for demo
router.use(protect)

// =========================
// GET ALL EMPLOYEES
// =========================

router.get('/', adminOnly, async (req, res) => {
  try {
    console.log('Fetching employees...');
    const {
      data,
      error
    } = await supabase
      .from('employees')
      .select('*')
      .order('id', {
        ascending: false
      })

    if (error) {
      console.error('Supabase error fetching employees:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      })
    }

    console.log(`Fetched ${data?.length || 0} employees`);
    const safeEmployees = (data || []).map(({ password, ...emp }) => emp)
    return res.status(200).json({
      success: true,
      employees: safeEmployees
    })
  } catch (err) {
    console.error('Catch error fetching employees:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    })
  }
})

// =========================
// GET EMPLOYEE BY EID
// =========================

router.get('/:eid', async (req, res) => {

  try {

    const { eid } =
      req.params

    const {

      data,

      error

    } = await supabase
      .from('employees')
      .select('*')
      .eq('eid', eid)
      .single()

    if (error) {

      return res.status(404).json({

        success: false,

        error:
          'Employee not found'

      })

    }

    const { password: _pw, ...safeEmployee } = data
    return res.status(200).json({
      success: true,
      employee: safeEmployee
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
// CREATE EMPLOYEE
// =========================

router.post('/create', async (req, res) => {

  try {

    const {

      eid,

      full_name,

      role,

      hourly_rate,

      morning_shift,
      evening_shift,
      face_image,
      password
    } = req.body

    console.log(
      'CREATE EMPLOYEE:',
      req.body
    )

    // =========================
    // EID GENERATION (if missing)
    // =========================

    let finalEid = String(eid || '').trim();
    if (!finalEid) {
      const prefix = role === 'doctor' ? 'D' : 'A';
      const random = Math.floor(1000 + Math.random() * 9000);
      finalEid = `${prefix}${random}`;
    }

    const finalName = String(full_name || '').trim()
    const finalPassword = String(password || '').trim()

    // =========================
    // VALIDATION
    // =========================

    if (
      !finalEid ||
      !finalName ||
      !finalPassword
    ) {

      return res.status(400).json({

        success: false,

        error:
          'Employee ID, name, and password required'

      })

    }

    // =========================
    // CHECK EXISTING
    // =========================

    const {
      data: existingEmployee
    } = await supabase
      .from('employees')
      .select('*')
      .eq('eid', finalEid)

    if (

      existingEmployee &&

      existingEmployee.length > 0

    ) {

      return res.status(400).json({

        success: false,

        error:
          'Employee ID already exists'

      })

    }

    // =========================
    // HASH PASSWORD
    // =========================
    const hashedPassword = await bcrypt.hash(finalPassword, 12)

    // =========================
    // INSERT
    // =========================

    const {
      data,
      error
    } = await supabase
      .from('employees')
      .insert([{
          eid: finalEid,
          full_name: finalName,
          role: role || 'assistant',
          hourly_rate: Number(hourly_rate) || 0,
          morning_shift: Boolean(morning_shift),
          evening_shift: Boolean(evening_shift),
          face_image,
          password: hashedPassword
        }])
      .select()

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
        'Employee created',

      employee: data[0]

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
// UPDATE EMPLOYEE
// =========================

router.put('/:id', async (req, res) => {

  try {

    const { id } =
      req.params

    const {

      full_name,

      role,

      hourly_rate,

      morning_shift,

      evening_shift,

      face_image

    } = req.body

    const {

      data,

      error

    } = await supabase
      .from('employees')
      .update({

        full_name,

        role,

        hourly_rate:
          Number(hourly_rate),

        morning_shift,

        evening_shift,

        face_image

      })
      .eq('id', id)
      .select()

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
        'Employee updated',

      employee: data[0]

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
// DELETE EMPLOYEE
// =========================

router.delete('/:id', async (req, res) => {

  try {
    const { id } = req.params
    console.log(`[DELETE] Request to remove employee ID: ${id}`);

    // 1. Get employee details first (to get EID)
    const { data: empData, error: findError } = await supabase
      .from('employees')
      .select('eid, full_name')
      .eq('id', id)
      .single();
    
    if (findError) {
      console.error(`[DELETE] Employee ${id} not found or query failed:`, findError);
      return res.status(404).json({
        success: false,
        error: 'Employee record not found'
      });
    }

    console.log(`[DELETE] Cleaning up records for ${empData.full_name} (${empData.eid})`);

    // 2. Delete payroll records linked by EID
    const { error: payrollError } = await supabase.from('payroll').delete().eq('eid', empData.eid);
    if (payrollError) console.warn('[DELETE] Payroll cleanup warning:', payrollError.message);

    // 3. Delete attendance records linked by EID
    const { error: attError } = await supabase.from('attendance').delete().eq('eid', empData.eid);
    if (attError) console.warn('[DELETE] Attendance cleanup warning:', attError.message);

    // 4. Finally delete the employee
    // Try both as string and number to be safe against different DB schemas
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .or(`id.eq.${id},id.eq.${Number(id) || 0}`) 

    if (deleteError) {
      console.error('[DELETE] Final delete failed:', deleteError);
      return res.status(500).json({
        success: false,
        error: deleteError.message
      })
    }

    console.log(`[DELETE] Success: Employee ${id} and all related data removed.`);
    return res.status(200).json({
      success: true,
      message: 'Employee and all history removed successfully'
    })

  } catch (err) {
    console.error('[DELETE] Unhandled Exception:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    })
  }

})

export default router
