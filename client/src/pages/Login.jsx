import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaLock, FaEnvelope, FaShieldAlt } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Client-side validation
    if (!email.trim()) {
      toast.error('Please enter your admin email');
      return;
    }
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }
    if (password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    const result = await loginAdmin(email.trim(), password);
    setLoading(false);

    if (result.success) {
      toast.success('Welcome Back, Admin!');
      navigate('/admin');
    } else {
      toast.error(result.error || 'Invalid credentials');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fe]">
      {/* Background gradient blob */}
      <div className="pill-header absolute top-0 left-0 w-full h-[45%] -z-10 shadow-2xl"></div>

      <div className="w-full max-w-md px-4">
        {/* Logo and Header Wrapped in Blue Glass */}
        <div className="bg-blue-900/40 backdrop-blur-xl border-2 border-blue-400/30 p-12 rounded-[60px] shadow-2xl mb-8 animate-in fade-in zoom-in duration-700">
          <div className="text-center mb-8">
            <div className="inline-flex bg-white/20 backdrop-blur-xl p-6 rounded-[30px] shadow-xl mb-4 border border-white/30">
              <FaShieldAlt className="text-5xl text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Admin Portal</h1>
            <p className="text-blue-100/80 mt-1 font-medium">Clinic Management System</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-gray-50">
            <h2 className="text-2xl font-black text-[#2c3e50] mb-8">Sign In</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg" />
                <input
                  type="email"
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-gray-50 border-none p-4 pl-12 rounded-2xl focus:ring-2 ring-blue-500 outline-none font-semibold text-[#2c3e50]"
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-gray-50 border-none p-4 pl-12 rounded-2xl focus:ring-2 ring-blue-500 outline-none font-semibold text-[#2c3e50]"
                  autoComplete="off"
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </span>
              ) : 'Sign In'}
            </button>

            <div className="text-center pt-2">
              <Link to="/employee-login" className="text-blue-500 font-semibold hover:underline text-sm">
                Staff Login →
              </Link>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;