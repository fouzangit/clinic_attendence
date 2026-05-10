import supabase from '../config/supabaseClient.js';

export const registerUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    
    // Using Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      res.status(400);
      throw error;
    }

    res.status(201).json({ message: 'User registered successfully', data });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401);
      throw error;
    }

    res.json({ message: 'Login successful', data });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};
