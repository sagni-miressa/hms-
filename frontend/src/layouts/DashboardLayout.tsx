import { Outlet, Link } from 'react-router-dom';
import { useAuthStore, Role } from '@/stores/authStore';

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/dashboard" className="flex items-center text-xl font-bold text-primary-600">
                Dashboard
              </Link>
              <div className="ml-10 flex items-center space-x-4">
                <Link to="/jobs" className="text-gray-700 hover:text-primary-600">
                  Jobs
                </Link>
                <Link to="/applications" className="text-gray-700 hover:text-primary-600">
                  Applications
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.email}</span>
              <span className="badge badge-info">{user?.roles[0]}</span>
              <button onClick={logout} className="btn-ghost">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

