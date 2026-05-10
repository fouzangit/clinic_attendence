-- Sample Seed Data for Supabase

-- Insert some dummy users (Assuming auth.users would handle auth_id usually, setting it NULL here for local testing)
INSERT INTO public.users (email, first_name, last_name, role, hourly_rate)
VALUES 
  ('admin@clinic.com', 'System', 'Admin', 'admin', 50.00),
  ('doctor.smith@clinic.com', 'John', 'Smith', 'doctor', 150.00),
  ('nurse.jane@clinic.com', 'Jane', 'Doe', 'nurse', 45.00),
  ('staff.bob@clinic.com', 'Bob', 'Jones', 'staff', 25.00);

-- Insert dummy attendance
INSERT INTO public.attendance (user_id, date, check_in_time, check_out_time, status)
SELECT 
  id as user_id, 
  CURRENT_DATE as date, 
  NOW() - INTERVAL '8 hours' as check_in_time, 
  NOW() as check_out_time, 
  'present' as status
FROM public.users
WHERE email = 'doctor.smith@clinic.com';

-- Insert dummy payroll
INSERT INTO public.payroll (user_id, month, year, total_hours, amount, status)
SELECT 
  id as user_id,
  EXTRACT(MONTH FROM CURRENT_DATE) as month,
  EXTRACT(YEAR FROM CURRENT_DATE) as year,
  160.00 as total_hours,
  160.00 * hourly_rate as amount,
  'pending' as status
FROM public.users;
