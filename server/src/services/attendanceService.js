import supabase from '../config/supabaseClient.js';

class AttendanceService {
  static async getAttendanceRecords() {
    const { data, error } = await supabase.from('attendance').select('*');
    if (error) throw error;
    return data;
  }

  static async markAttendance(userId, date, status) {
    const { data, error } = await supabase
      .from('attendance')
      .insert([{ user_id: userId, date, status }]);
    if (error) throw error;
    return data;
  }
}

export default AttendanceService;
