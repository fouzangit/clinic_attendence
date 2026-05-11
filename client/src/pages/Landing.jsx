import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserShield, FaUserTie, FaClinicMedical, FaStethoscope } from 'react-icons/fa';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fe] flex flex-col items-center justify-center p-6 text-[#2c3e50] overflow-hidden">
      {/* BACKGROUND DECOR */}
      <div className="pill-header absolute top-0 left-0 w-full h-[55%] -z-10 shadow-2xl rounded-b-[100px]"></div>
      
      <div className="max-w-7xl w-full text-center space-y-16 py-12">
        <div className="animate-in fade-in slide-in-from-top duration-1000">
          <div className="bg-blue-900/40 backdrop-blur-xl border-2 border-blue-400/30 p-6 md:p-12 rounded-[40px] md:rounded-[60px] shadow-2xl inline-block max-w-5xl mx-auto">

            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-2xl p-6 rounded-[35px] shadow-2xl border border-white/30">
                <FaStethoscope className="text-6xl text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-9xl font-black text-white tracking-tighter drop-shadow-2xl">

              Clinic<span className="opacity-70 font-light italic">Core</span>
            </h1>
            <p className="text-xl md:text-3xl text-blue-50 font-medium max-w-3xl mx-auto opacity-95 leading-relaxed mt-6">

              State-of-the-art <span className="text-white font-black underline decoration-blue-300 underline-offset-8">Face-Recognition</span> system for modern dental clinics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12 px-4 max-w-5xl mx-auto">
          
          {/* ADMIN PORTAL */}
          <Link 
            to="/login"
            className="group bg-white p-8 md:p-12 rounded-[40px] md:rounded-[60px] shadow-2xl hover:translate-y-[-15px] transition-all duration-500 border-b-8 border-indigo-600 flex flex-col items-center text-center space-y-8"
          >

            <div className="bg-indigo-50 p-10 rounded-[40px] text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
              <FaUserShield className="text-6xl" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black mb-3 text-indigo-900 uppercase tracking-tight">Admin Portal</h2>

              <p className="text-gray-500 font-bold text-lg leading-snug">Full management dashboard for employees, payroll, and logs.</p>
            </div>
            <span className="bg-indigo-600 text-white w-full py-6 rounded-[30px] font-black text-2xl shadow-xl group-hover:bg-indigo-700 transition-all scale-100 group-hover:scale-105">Admin Login</span>
          </Link>

          {/* EMPLOYEE PORTAL */}
          <Link 
            to="/employee-login"
            className="group bg-white p-12 rounded-[60px] shadow-2xl hover:translate-y-[-15px] transition-all duration-500 border-b-8 border-blue-500 flex flex-col items-center text-center space-y-8"
          >
            <div className="bg-blue-50 p-10 rounded-[40px] text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
              <FaUserTie className="text-6xl" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black mb-3 text-blue-900 uppercase tracking-tight">Staff Portal</h2>

              <p className="text-gray-500 font-bold text-lg leading-snug">Personal dashboard for staff to view history and payroll.</p>
            </div>
            <span className="bg-blue-500 text-white w-full py-6 rounded-[30px] font-black text-2xl shadow-xl group-hover:bg-blue-600 transition-all scale-100 group-hover:scale-105">Staff Login</span>
          </Link>

        </div>

        <footer className="pt-12 text-blue-800/40 font-black tracking-[0.3em] uppercase text-xs">
          © 2026 ClinicCore Management System | Highly Secured
        </footer>
      </div>
    </div>
  );
};

export default Landing;
