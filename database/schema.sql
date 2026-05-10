-- ================================================
-- Clinic Management System — Supabase Schema
-- Full schema matching the current application
-- ================================================

-- ================================================
-- 1. EMPLOYEES
-- ================================================
CREATE TABLE IF NOT EXISTS public.employees (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  eid           TEXT UNIQUE NOT NULL,         -- e.g. "116", "D001"
  full_name     TEXT NOT NULL,
  role          TEXT DEFAULT 'assistant' CHECK (role IN ('doctor', 'assistant')),
  hourly_rate   DECIMAL(10, 2) DEFAULT 0.00,
  morning_shift BOOLEAN DEFAULT true,
  evening_shift BOOLEAN DEFAULT false,
  face_image    TEXT,                          -- base64 data URL or legacy /uploads/ path
  password      TEXT,                          -- bcrypt hashed
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 2. ATTENDANCE
-- ================================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id   UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  eid           TEXT NOT NULL,                -- denormalized for easy lookup
  date          DATE NOT NULL,
  shift         TEXT DEFAULT 'morning' CHECK (shift IN ('morning', 'evening')),
  check_in      TIMESTAMPTZ,
  check_out     TIMESTAMPTZ,
  working_hours DECIMAL(6, 2) DEFAULT 0,
  late_minutes  INTEGER DEFAULT 0,
  latitude      DECIMAL(10, 6),
  longitude     DECIMAL(10, 6),
  face_verified BOOLEAN DEFAULT false,
  status        TEXT DEFAULT 'Present',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast daily lookups
CREATE INDEX IF NOT EXISTS idx_attendance_eid_date_shift 
  ON public.attendance(eid, date, shift);

-- ================================================
-- 3. PAYROLL
-- ================================================
CREATE TABLE IF NOT EXISTS public.payroll (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id   UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  eid           TEXT NOT NULL,
  month         TEXT NOT NULL,               -- e.g. "2026-05"
  total_hours   DECIMAL(10, 2) DEFAULT 0,
  late_minutes  INTEGER DEFAULT 0,
  gross_salary  DECIMAL(10, 2) DEFAULT 0,
  deduction     DECIMAL(10, 2) DEFAULT 0,
  final_salary  DECIMAL(10, 2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(eid, month)                         -- one payroll per employee per month
);

-- ================================================
-- 4. CLINIC SETTINGS
-- ================================================
CREATE TABLE IF NOT EXISTS public.clinic_settings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_latitude   DECIMAL(10, 6) NOT NULL DEFAULT 0,
  clinic_longitude  DECIMAL(10, 6) NOT NULL DEFAULT 0,
  allowed_radius    INTEGER NOT NULL DEFAULT 500,  -- meters
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default clinic settings (run once)
INSERT INTO public.clinic_settings (clinic_latitude, clinic_longitude, allowed_radius)
VALUES (0, 0, 500)
ON CONFLICT DO NOTHING;

-- ================================================
-- MIGRATION: Add missing columns to existing tables
-- Safe to run even if columns already exist
-- ================================================

ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS eid TEXT;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS employee_id UUID;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS month TEXT;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS total_hours DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS late_minutes INTEGER DEFAULT 0;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS gross_salary DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS deduction DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS final_salary DECIMAL(10,2) DEFAULT 0;

ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS employee_id UUID;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS eid TEXT;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS shift TEXT DEFAULT 'morning';
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS working_hours DECIMAL(6,2) DEFAULT 0;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS late_minutes INTEGER DEFAULT 0;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,6);
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,6);
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS face_verified BOOLEAN DEFAULT false;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Present';
