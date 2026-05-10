import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'

import EmployeeLogin from './pages/EmployeeLogin'
import EmployeeDashboard from './pages/EmployeeDashboard'
import EmployeeCheckIn from './pages/EmployeeCheckIn'
import EmployeeCheckOut from './pages/EmployeeCheckOut'

import Dashboard from './pages/Dashboard'
import PayrollPage from './pages/PayrollPage'
import PayrollHistory from './pages/PayrollHistory'
import AttendanceHistory from './pages/AttendanceHistory'
import Employees from './pages/Employees'
import Login from './pages/Login'
import CheckIn from './pages/CheckIn'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './pages/NotFound'
import Landing from './pages/Landing'
import Settings from './pages/Settings'
import EmployeeAttendance from './pages/EmployeeAttendance'
import { Toaster } from 'react-hot-toast'

function App() {

  return (
    <AuthProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter>
        <Routes>

          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRole="admin">
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRole="admin">
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <ProtectedRoute allowedRole="admin">
                <PayrollPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll-history"
            element={
              <ProtectedRoute allowedRole="admin">
                <PayrollHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance-history"
            element={
              <ProtectedRoute allowedRole="admin">
                <AttendanceHistory />
              </ProtectedRoute>
            }
          />

          {/* EMPLOYEE ROUTES */}
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute allowedRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-check-in"
            element={
              <ProtectedRoute allowedRole="employee">
                <EmployeeCheckIn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-check-out"
            element={
              <ProtectedRoute allowedRole="employee">
                <EmployeeCheckOut />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee-attendance"
            element={
              <ProtectedRoute allowedRole="employee">
                <EmployeeAttendance />
              </ProtectedRoute>
            }
          />

          {/* FALLBACKS */}
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App