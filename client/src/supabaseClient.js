import {
  createClient
} from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://duyafxhahdmsolbroljb.supabase.co'

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1eWFmeGhhaGRtc29sYnJvbGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTQxNTIsImV4cCI6MjA5MzY3MDE1Mn0.cpW8Tv5rBZGG4Ysp7bzfnfa4qiU7_MYI_eD6fLIQJuk'

const supabase =
  createClient(
    supabaseUrl,
    supabaseAnonKey
  )

export default supabase
