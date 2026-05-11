import supabase from '../config/supabaseClient.js';
import { getISTDate } from '../utils/dateHelper.js';

// =========================
// GET DASHBOARD ANALYTICS
// =========================
export const getDashboardStats = async (req, res) => {
  try {
    const today = getISTDate();

    // 1. Total Employees
    const { count: totalEmployees } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });

    // 2. Active Now (Present Today)
    const { count: activeToday } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today);

    // 3. Late Today
    const { count: lateToday } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .gt('late_minutes', 0);

    // 4. Pending Leaves
    const { count: pendingLeaves } = await supabase
      .from('leaves')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pending');

    // 5. Recent Activity (Last 5 attendances)
    const { data: recentActivity } = await supabase
      .from('attendance')
      .select('*, employees(full_name)')
      .order('created_at', { ascending: false })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        activeToday,
        lateToday,
        pendingLeaves
      },
      recentActivity
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// =========================
// GET CLINIC SETTINGS
// =========================
export const getClinics = async (req, res) => {
  try {
    const { data, error } = await supabase.from('clinics').select('*');
    if (error) throw error;
    return res.status(200).json({ success: true, clinics: data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// =========================
// CREATE LEAVE REQUEST
// =========================
export const requestLeave = async (req, res) => {
  try {
    const { employee_id, type, start_date, end_date, reason } = req.body;
    const { data, error } = await supabase
      .from('leaves')
      .insert([{ employee_id, type, start_date, end_date, reason }])
      .select();

    if (error) throw error;
    return res.status(201).json({ success: true, leave: data[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
