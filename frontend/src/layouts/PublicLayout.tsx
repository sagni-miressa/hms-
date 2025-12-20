import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const PublicLayout = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center text-xl font-bold text-primary-600">
                Hiring System
              </Link>
              <div className="ml-10 flex items-center space-x-4">
                <Link to="/jobs" className="text-gray-700 hover:text-primary-600">
                  Jobs
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-700">{user?.email}</span>
                  <Link to="/dashboard" className="btn-primary">
                    Dashboard
                  </Link>
                  <button onClick={logout} className="btn-ghost">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

