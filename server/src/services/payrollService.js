import supabase from '../config/supabaseClient.js';

class PayrollService {
  static async getPayrollRecords() {
    const { data, error } = await supabase.from('payroll').select('*');
    if (error) throw error;
    return data;
  }

  static async generatePayroll(userId, month, year, amount) {
    const { data, error } = await supabase
      .from('payroll')
      .insert([{ user_id: userId, month, year, amount }]);
    if (error) throw error;
    return data;
  }
}

export default PayrollService;
