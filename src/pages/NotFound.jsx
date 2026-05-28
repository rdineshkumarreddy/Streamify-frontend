import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Page Not Found</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
