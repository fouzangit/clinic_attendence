import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaLock, FaIdCard, FaUserTie } from 'react-icons/fa';

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const { loginEmployee } = useAuth();

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Client-side validation
    if (!employeeId.trim()) {
      toast.error('Please enter your Employee ID');
      return;
    }
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    const result = await loginEmployee(employeeId.trim(), password.trim());
    setLoading(false);

    if (result.success) {
      toast.success('Welcome back! Loading your dashboard...');
      navigate('/employee-dashboard');
    } else {
      toast.error(result.error || 'Invalid credentials. Please check your Employee ID and password.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fe]">
      {/* Background gradient blob */}
      <div className="absolute top-0 left-0 w-full h-[45%] -z-10 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}>
      </div>

      <div className="w-full max-w-md px-4">
        {/* Logo and Header Wrapped in Blue Glass */}
        <div className="bg-blue-900/40 backdrop-blur-xl border-2 border-blue-400/30 p-12 rounded-[60px] shadow-2xl mb-8 animate-in fade-in zoom-in duration-700">
          <div className="text-center mb-8">
            <div className="inline-flex bg-white/20 backdrop-blur-xl p-6 rounded-[30px] shadow-xl mb-4 border border-white/30">
              <FaUserTie className="text-5xl text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Staff Portal</h1>
            <p className="text-blue-100/80 mt-1 font-medium">Clinic 116 Attendance & Payroll</p>

          </div>

          {/* Card */}
          <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-gray-50">
            <h2 className="text-2xl font-black text-[#2c3e50] mb-2">Employee Sign In</h2>
            <p className="text-gray-400 text-sm mb-8">Enter your credentials provided by your administrator.</p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Employee ID</label>
              <div className="relative">
                <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg" />
                <input
                  type="text"
                  placeholder="e.g. 116"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-gray-50 border-none p-4 pl-12 rounded-2xl focus:ring-2 ring-emerald-500 outline-none font-semibold text-[#2c3e50] uppercase tracking-widest"
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
                  className="w-full bg-gray-50 border-none p-4 pl-12 rounded-2xl focus:ring-2 ring-emerald-500 outline-none font-semibold text-[#2c3e50]"
                  autoComplete="off"
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </span>
              ) : 'Sign In to Dashboard'}
            </button>

            <div className="flex items-center justify-between pt-2">
              <p className="text-gray-400 text-sm">Forgot password? Contact admin.</p>
              <Link to="/login" className="text-emerald-600 font-semibold hover:underline text-sm">
                Admin Login →
              </Link>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;
