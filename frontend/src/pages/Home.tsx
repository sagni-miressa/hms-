import { Link } from 'react-router-dom';

export const HomePage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Find Your Dream Job
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Enterprise-grade hiring platform with military-grade security. Built for companies that value talent and security.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <Link to="/jobs" className="btn-primary w-full sm:w-auto">
            Browse Jobs
          </Link>
          <Link to="/register" className="mt-3 sm:mt-0 sm:ml-3 btn-secondary w-full sm:w-auto">
            Sign Up
          </Link>
        </div>
      </div>
      
      <div className="mt-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
          Why Choose Us?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card text-center">
            <h3 className="text-xl font-semibold mb-3">🔒 Secure</h3>
            <p className="text-gray-600">
              Military-grade security with multi-layer access control and comprehensive audit logging.
            </p>
          </div>
          <div className="card text-center">
            <h3 className="text-xl font-semibold mb-3">⚡ Fast</h3>
            <p className="text-gray-600">
              Lightning-fast application process with real-time updates and notifications.
            </p>
          </div>
          <div className="card text-center">
            <h3 className="text-xl font-semibold mb-3">🎯 Efficient</h3>
            <p className="text-gray-600">
              Streamlined hiring workflow from application to offer with intelligent matching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

