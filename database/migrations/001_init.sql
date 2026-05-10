-- Migration 001: Initial Setup

-- Create enums
CREATE TYPE public.user_role AS ENUM ('admin', 'doctor', 'nurse', 'staff');

-- Create Users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role public.user_role DEFAULT 'staff',
  hourly_rate DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'half_day')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Payroll table
CREATE TABLE public.payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  total_hours DECIMAL(6, 2) DEFAULT 0.00,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
