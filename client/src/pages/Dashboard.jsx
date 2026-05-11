import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  FaUsers, FaUserCheck, FaClock, FaCalendarTimes, 
  FaArrowUp, FaArrowDown, FaClinicMedical, FaShieldAlt 
} from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeToday: 0,
    lateToday: 0,
    pendingLeaves: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/hr/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.data.success) {
          setStats(response.data.stats);
          setRecentActivity(response.data.recentActivity);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const kpis = [
    { label: 'Total Workforce', value: stats.totalEmployees, icon: <FaUsers />, color: 'blue', trend: '+2% from last month' },
    { label: 'Active Today', value: stats.activeToday, icon: <FaUserCheck />, color: 'emerald', trend: 'Normal' },
    { label: 'Late Arrivals', value: stats.lateToday, icon: <FaClock />, color: 'amber', trend: '-5% improvement' },
    { label: 'Leave Requests', value: stats.pendingLeaves, icon: <FaCalendarTimes />, color: 'rose', trend: '3 pending approval' }
  ];

  // Dummy data for charts
  const attendanceData = [
    { day: 'Mon', present: 12, late: 2 },
    { day: 'Tue', present: 15, late: 1 },
    { day: 'Wed', present: 14, late: 3 },
    { day: 'Thu', present: 16, late: 0 },
    { day: 'Fri', present: 13, late: 2 },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] p-8 flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Workforce <span className="text-blue-600">Analytics</span></h1>
          <p className="text-slate-500 font-medium">Real-time biometric monitoring & HR metrics</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 font-bold text-sm shadow-sm hover:bg-slate-50">Generate Report</button>
           <button className="bg-blue-600 px-4 py-2 rounded-xl text-white font-bold text-sm shadow-lg shadow-blue-900/20 hover:bg-blue-700">Export CSV</button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-4 rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600 group-hover:scale-110 transition-transform`}>
                {kpi.icon}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${kpi.color === 'rose' ? 'text-rose-500' : 'text-slate-400'}`}>
                {kpi.label}
              </span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-1">{kpi.value}</h2>
            <p className="text-[10px] font-bold text-slate-400">{kpi.trend}</p>
          </div>
        ))}
      </div>

      {/* ANALYTICS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ATTENDANCE TRENDS */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-black text-slate-900 tracking-tight">Attendance Efficiency</h3>
             <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-[10px] font-black text-slate-400 uppercase">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase">Late</span>
                </div>
             </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="present" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorPresent)" />
                <Area type="monotone" dataKey="late" stroke="#fbbf24" strokeWidth={4} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Live Activity</h3>
          <div className="space-y-6">
            {recentActivity.map((log, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xs border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  {log.employees?.full_name?.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-900">{log.employees?.full_name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.shift} {log.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900">{new Date(log.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  <p className={`text-[10px] font-bold uppercase ${log.late_minutes > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {log.late_minutes > 0 ? `+${log.late_minutes}m` : 'On Time'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-4 bg-slate-50 rounded-2xl text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors">
            View All Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;