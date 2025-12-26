import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600">404</h1>
        <p className="mt-4 text-xl text-gray-600">Page not found</p>
        <Link to="/" className="mt-6 inline-block btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  );
};

