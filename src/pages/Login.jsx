// frontend/src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, checkEmailAvailability, checkUsernameAvailability } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (email.trim()) {
        let exists = false;
        if (email.includes('@')) {
           // It's an email - availabilty: false means it EXISTS (which is what we want for login)
           const available = await checkEmailAvailability(email);
           exists = !available;
        } else {
           // It's a username
           const available = await checkUsernameAvailability(email);
           exists = !available;
        }
        
        if (!exists && email.length > 3) {
           const errorMessage = email.includes('@') ? 'Entered wrong email' : 'Entered wrong username';
           toast.error(errorMessage, { id: 'login-check' });
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const { success, error } = await login(email, password);
    if (!success) {
      toast.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-2 text-white text-center">Welcome Back</h2>
          <p className="text-gray-400 text-center mb-8">Sign in to continue to Streamify</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Email or Username</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Enter your email or username"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                loading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : 'Login'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm">
              <Link to="/forgot-password" className="text-gray-400 hover:text-white transition-colors">
                Forgot password?
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-red-500 hover:text-red-400 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;