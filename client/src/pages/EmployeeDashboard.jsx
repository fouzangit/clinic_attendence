import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const EmployeeDashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/employee-login')
  }


  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-700 to-green-300 p-4 md:p-10">

      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-white">Employee Portal</h1>
            <p className="text-white text-lg md:text-2xl mt-2 md:mt-4">
              Welcome, {user?.full_name || user?.eid || 'Employee'}
            </p>
          </div>


          <button
            onClick={handleLogout}
            className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-lg md:text-xl transition-all shadow-lg"
          >
            Logout
          </button>

        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* CHECK IN */}
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl hover:scale-105 transition-transform">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-emerald-800">Check In</h2>

            <p className="text-xl text-gray-600 mb-8">
              Mark attendance using GPS location verification.
            </p>
            <button
              onClick={() => navigate('/employee-check-in')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-bold text-2xl shadow-md"
            >
              Start Check In
            </button>
          </div>
               
          {/* CHECK OUT */}
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl hover:scale-105 transition-transform">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-blue-800">Check Out</h2>

            <p className="text-xl text-gray-600 mb-8">
              Complete your shift and finalize today's working hours.
            </p>
            <button
              onClick={() => navigate('/employee-check-out')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-bold text-2xl shadow-md"
            >
              Start Check Out
            </button>
          </div>

          {/* MY ATTENDANCE */}
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl hover:scale-105 transition-transform border-b-8 border-indigo-500">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-indigo-800">My Attendance</h2>

            <p className="text-xl text-gray-600 mb-8">
              View your historical attendance records and work hours.
            </p>
            <button
              onClick={() => navigate('/employee-attendance')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold text-2xl shadow-md"
            >
              View History
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}

export default EmployeeDashboard