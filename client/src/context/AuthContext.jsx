import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import axios from 'axios';

const AuthContext = createContext();

// INITIALIZE AXIOS HEADER IMMEDIATELY
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    checkSession();

    // Axios interceptor for global 401 handling
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          console.warn('Session expired or unauthorized. Logging out.');
          await logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const checkSession = async () => {
    setLoading(true);

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');

    if (storedRole === 'employee' && storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setRole('employee');
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      setLoading(false);
      return;
    }

    // Check Supabase after employee local login so admin sessions do not override employees.
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      setRole('admin');
      axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
      setLoading(false);
      return;
    }

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  };

  const loginAdmin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      localStorage.setItem('token', data.session.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', 'admin');
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.session.access_token}`;
      setUser(data.user);
      setRole('admin');
      return { success: true };
    }

    try {
      const res = await axios.post('\/api/auth/login', { email, password });
      if (res.data.success) {
        const { token, admin } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(admin));
        localStorage.setItem('role', 'admin');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(admin);
        setRole('admin');
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }

    return { success: false, error: error.message };
  };

  const loginEmployee = async (eid, password) => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();

      const res = await axios.post('\/api/auth/employee-login', {
        eid: eid.trim(),
        password: password.trim()
      });

      if (res.data.success) {
        const { token, employee } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(employee));
        localStorage.setItem('role', 'employee');
        localStorage.setItem('employee_id', employee.eid);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(employee);
        setRole('employee');
        return { success: true };
      }

      return {
        success: false,
        error: res.data.error || 'Invalid employee credentials'
      };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, loginAdmin, loginEmployee, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
