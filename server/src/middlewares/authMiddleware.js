import jwt from 'jsonwebtoken';
import supabase from '../config/supabaseClient.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 1. Try verifying as a custom JWT (Employee or Fake Admin)
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Custom JWT Verified:', decoded.role);
        req.user = decoded;
        return next();
      } catch (jwtErr) {
        // Not a custom JWT, try Supabase
        console.log('Not a custom JWT, checking Supabase...');
      }

      // 2. Verify token with Supabase (Real Admin)
      const { data: { user }, error: supabaseError } = await supabase.auth.getUser(token);

      if (supabaseError || !user) {
        console.error('Supabase Auth Error:', supabaseError?.message || 'User not found');
        return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
      }

      console.log('Supabase User Verified:', user.email);
      req.user = user;
      req.user.role = 'admin'; 
      next();
    } catch (error) {
      console.error('CRITICAL AUTH ERROR:', error);
      res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};

export const adminOnly = (req, res, next) => {
  console.log('AdminOnly check. User role:', req.user?.role);
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.warn('Access denied for role:', req.user?.role);
    res.status(403).json({ success: false, error: 'Access denied: Admins only' });
  }
};

export const employeeOnly = (req, res, next) => {
  if (req.user && req.user.role === 'employee') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Access denied: Employees only' });
  }
};
