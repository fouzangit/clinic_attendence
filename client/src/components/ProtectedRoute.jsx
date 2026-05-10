import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-4xl font-bold animate-pulse text-blue-600">
          Loading Security...
        </div>
      </div>
    );
  }

  // No user logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role permission
  if (allowedRole && role !== allowedRole) {
    // If an employee tries to access admin, send them to dashboard
    if (role === 'employee') {
      return <Navigate to="/employee-dashboard" replace />;
    }
    // If admin tries to access employee-only (unlikely), send them to dashboard
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
