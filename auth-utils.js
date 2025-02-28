import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth-context';

// Protected Route component that redirects unauthenticated users to login
export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!currentUser) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

// Guest Route component that redirects authenticated users to dashboard
export const GuestRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  // Redirect to dashboard or the page they were trying to access before login
  if (currentUser) {
    const redirectTo = location.state?.from || '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

// Hook to check authentication status and redirect if needed
export const useAuthRedirect = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // You can add additional session validation logic here
    // For example, checking token expiration, session timeouts, etc.
  }, [currentUser]);

  return { currentUser, loading, location };
};

// Function to get user data from Firestore
export const getUserData = async (userId, db) => {
  if (!userId) return null;
  
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      console.log('No user data found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};
