// frontend/src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-red-500">
          Streamify
        </Link>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/upload"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Upload Video
              </Link>
              <button
                onClick={logout}
                className="text-gray-300 hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;