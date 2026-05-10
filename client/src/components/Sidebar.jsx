import React from 'react'

import {
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom'

import {
  FaMapMarkerAlt,
  FaChartPie,
  FaMoneyBillWave,
  FaHistory,
  FaClipboardList,
  FaUsers,
  FaSignOutAlt
} from 'react-icons/fa'

import { useAuth } from '../context/AuthContext'

const Sidebar = () => {

  const location =
    useLocation()

  const navigate =
    useNavigate()

  const { logout } = useAuth()

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {

    await logout()

    navigate('/')

  }

  const menuItems = [

    {
      name: 'Dashboard',
      path: '/admin',
      icon: <FaChartPie />
    },

    {
      name: 'Employees',
      path: '/employees',
      icon: <FaUsers />
    },

    {
      name: 'Payroll',
      path: '/payroll',
      icon: <FaMoneyBillWave />
    },

    {
      name: 'Payroll History',
      path: '/payroll-history',
      icon: <FaHistory />
    },

    {
      name: 'Attendance Log',
      path: '/attendance-history',
      icon: <FaClipboardList />
    },

    {
      name: 'System Settings',
      path: '/settings',
      icon: <FaMapMarkerAlt />
    }

  ]

  return (

    <div
      className="
      w-72
      min-h-screen
      bg-white
      text-[#2c3e50]
      p-6
      card-shadow
      flex
      flex-col
      justify-between
      border-r
      border-gray-100
      "
    >

      <div>

        <div className="mb-12">
            <h1 className="text-3xl font-bold text-[#2a73e8]">
                Clinic Admin
            </h1>
            <p className="text-gray-400 text-sm font-medium mt-1">Management Suite</p>
        </div>

        <div className="space-y-3">

          {
            menuItems.map((item) => (

              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex
                  items-center
                  gap-4
                  p-4
                  rounded-2xl
                  text-lg
                  font-semibold
                  transition-smooth

                  ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:bg-gray-50'
                  }
                `}
              >

                <span className={`text-xl ${location.pathname === item.path ? 'text-blue-600' : 'text-gray-400'}`}>
                    {item.icon}
                </span>

                {item.name}

              </Link>

            ))
          }

        </div>

      </div>

      {/* LOGOUT */}

      <button
        onClick={handleLogout}
        className="
        flex
        items-center
        gap-4
        text-gray-400
        hover:text-red-500
        hover:bg-red-50
        p-4
        rounded-2xl
        text-lg
        font-bold
        transition-smooth
        mt-auto
        "
      >

        <FaSignOutAlt />

        Logout

      </button>

    </div>

  )

}

export default Sidebar