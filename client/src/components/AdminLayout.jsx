import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaChartPie, FaUsers, FaCalendarAlt, FaMoneyBillWave, 
  FaCog, FaSignOutAlt, FaBars, FaTimes 
} from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin', icon: <FaChartPie />, label: 'Dashboard' },
    { path: '/employees', icon: <FaUsers />, label: 'Manage Staff' },
    { path: '/attendance-history', icon: <FaCalendarAlt />, label: 'Attendance' },
    { path: '/payroll', icon: <FaMoneyBillWave />, label: 'Payroll' },
    { path: '/settings', icon: <FaCog />, label: 'Settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 transform ${isOpen ? 'w-64' : 'w-20'} lg:relative lg:translate-x-0`}>
        <div className="h-full flex flex-col p-4">
          {/* LOGO */}
          <div className={`flex items-center gap-3 mb-10 px-2 ${!isOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <FaChartPie className="text-xl" />
            </div>
            {isOpen && <span className="font-black text-slate-900 tracking-tighter text-xl uppercase">Clinic<span className="text-blue-600">Pro</span></span>}
          </div>

          {/* NAV LINKS */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                    isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                  } ${!isOpen && 'justify-center'}`}
                >
                  <span className={`text-xl ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}`}>
                    {item.icon}
                  </span>
                  {isOpen && <span className="font-bold text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* LOGOUT */}
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all ${!isOpen && 'justify-center'}`}
          >
            <FaSignOutAlt className="text-xl" />
            {isOpen && <span className="font-bold text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* MOBILE HEADER */}
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-40">
           <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 text-2xl">
             <FaBars />
           </button>
           <span className="font-black text-slate-900 tracking-tighter uppercase">Clinic<span className="text-blue-600">Pro</span></span>
           <div className="w-10" />
        </header>

        <div className="p-4 md:p-8">
           {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
