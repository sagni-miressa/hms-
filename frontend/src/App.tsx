/**
 * Main App Component
 * Routing and layout
 */

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { getCurrentUser } from '@/services/auth.service';
import { Router } from '@/Router';

function App() {
  const { isAuthenticated, setUser, logout } = useAuthStore();
  
  // Load current user on app init
  const { data, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
    retry: false,
  });
  
  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
  }, [data, setUser]);
  
  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error, logout]);
  
  return <Router />;
}

export default App;

