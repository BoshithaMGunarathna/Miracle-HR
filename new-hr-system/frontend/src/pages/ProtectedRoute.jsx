import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Role not authorized, redirect to home page
    // add alert message according to the role
    if (user.role === "admin") {
      alert("You are not authorized to view this page. Redirecting to Admin Dashboard.");
      <Navigate to="/profile/:emp_id" replace />;
    } else if (user.role === "employee") {
      alert("You are not authorized to view this page. Redirecting to Employee Dashboard.");
      <Navigate to="/profile/:emp_id"/>;
    }
    else if (user.role === "hr") {
      alert("You are not authorized to view this page. Redirecting to HR Dashboard.");

    }
    return <Navigate to="/" replace />;
  }

  // Authorized, render component
  return children;
};