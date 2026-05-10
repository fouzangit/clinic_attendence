import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaCheckCircle } from 'react-icons/fa';

const EmployeeAttendance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.eid) fetchMyAttendance();
  }, [user]);

  const fetchMyAttendance = async () => {
    try {
      const res = await axios.get(`\/api/attendance/employee/${user.eid}`);
      if (res.data.success) {
        setHistory(res.data.attendance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/employee-dashboard')}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors mb-10 text-xl font-bold"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        <h1 className="text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">My Attendance</h1>
        <p className="text-2xl text-slate-500 mb-12">Review your past shifts and working hours.</p>

        {loading ? (
          <div className="text-center p-20 text-2xl font-medium text-slate-400 animate-pulse">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center shadow-xl border-2 border-dashed border-slate-200">
            <FaCalendarAlt className="text-7xl text-slate-200 mx-auto mb-6" />
            <p className="text-2xl text-slate-400 font-medium">No attendance records found yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((record) => (
              <div key={record.id} className="bg-white rounded-[35px] p-8 shadow-lg border border-slate-100 hover:shadow-2xl transition-all flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6">
                  <div className="bg-blue-100 p-5 rounded-3xl text-blue-600">
                    <FaClock className="text-3xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                    <p className="text-lg text-slate-500 font-medium">Shift: <span className="text-slate-700 capitalize">{record.shift || 'Default'}</span></p>
                  </div>
                </div>

                <div className="flex gap-12 text-center">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">In</p>
                    <p className="text-2xl font-bold text-slate-700">{record.check_in || '--:--'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Out</p>
                    <p className="text-2xl font-bold text-slate-700">{record.check_out || '--:--'}</p>
                  </div>
                  <div className="bg-slate-50 px-6 py-2 rounded-2xl">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Hours</p>
                    <p className="text-2xl font-bold text-blue-600">{record.working_hours || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-full font-bold">
                  <FaCheckCircle />
                  {record.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendance;
