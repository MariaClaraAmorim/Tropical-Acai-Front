import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  isAdmin: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAdmin }) => {
  const isLoggedIn = !!localStorage.getItem('loggedIn');
  const userType = localStorage.getItem('userType');

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (isAdmin && userType !== 'ADMIN') {
    return <Navigate to="/home" />;
  }

  if (!isAdmin && userType === 'ADMIN') {
    return <Navigate to="/admin" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
