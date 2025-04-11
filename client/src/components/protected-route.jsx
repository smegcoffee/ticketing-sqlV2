import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/authContext';

const ProtectedRoute = ({ element, allowedRoles }) => {
  // Perform authentication and authorization checks here
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" />;
  }

  // if (!allowedRoles.includes(userRole)) {
  //   if(userRole === 1){
  //     return <Navigate to="/dashboard/home" />; // Redirect to a suitable default route
  //   }else if (userRole === 2){
  //     return <Navigate to="/dashboard/home" />; // Redirect to a suitable default route
  //   }
  //   // Handle other cases where the userRole is not allowed
  // }

  return element;
};

export { ProtectedRoute };