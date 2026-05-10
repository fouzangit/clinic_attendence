import supabase from '../config/supabaseClient.js'

// =========================
// GET EMPLOYEES
// =========================

export const getEmployees =
  async (req, res) => {

    try {

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

        return res.status(500).json({
          success: false,
          error: error.message
        })

      }

      return res.status(200).json({
        success: true,
        employees: data
      })

    } catch (err) {

      console.error(err)

      return res.status(500).json({
        success: false,
        error: err.message
      })

    }

  }

// =========================
// CREATE EMPLOYEE
// =========================

export const createEmployee =
  async (req, res) => {

    try {

      const {
        full_name,
        role,
        hourly_rate,
        morning_shift,
        evening_shift
      } = req.body

      if (!full_name || !role) {
        return res.status(400).json({
          success: false,
          error: 'Full name and role are required'
        })
      }

      const face_image = req.file
        ? `/uploads/${req.file.filename}`
        : null

      const prefix =
        role === 'doctor'
          ? 'D'
          : 'A'

      let eid;
      let isUnique = false;

      while (!isUnique) {
        const random = Math.floor(100 + Math.random() * 900);
        eid = `${prefix}${random}`;
        const { data } = await supabase.from('employees').select('id').eq('eid', eid);
        if (!data || data.length === 0) {
          isUnique = true;
        }
      }

      const {
        data,
        error
      } = await supabase
        .from('employees')
        .insert([
          {
            full_name,
            role,
            hourly_rate,
            morning_shift:
              morning_shift === 'true',

            evening_shift:
              evening_shift === 'true',

            face_image,
            eid
          }
        ])
        .select()

      if (error) {

        return res.status(500).json({
          success: false,
          error: error.message
        })

      }

      return res.status(201).json({
        success: true,
        message:
          'Employee created successfully',
        employee: data[0]
      })

    } catch (err) {

      console.error(err)

      return res.status(500).json({
        success: false,
        error: err.message
      })

    }

  }