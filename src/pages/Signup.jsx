// frontend/src/pages/Signup.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Upload } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: null
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({ loading: false, available: null, message: '' });
  const [emailStatus, setEmailStatus] = useState({ loading: false, available: null, message: '' });
  const { signup, verifyOtp, checkUsernameAvailability, checkEmailAvailability } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.username.trim()) {
        setUsernameStatus(prev => ({ ...prev, loading: true }));
        const available = await checkUsernameAvailability(formData.username);
        setUsernameStatus({
          loading: false,
          available,
          message: available ? 'Username is available' : 'Username is already taken'
        });
      } else {
        setUsernameStatus({ loading: false, available: null, message: '' });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.email.trim() && formData.email.includes('@')) {
        setEmailStatus(prev => ({ ...prev, loading: true }));
        const available = await checkEmailAvailability(formData.email);
        setEmailStatus({
          loading: false,
          available,
          message: available ? '' : 'Email is not available'
        });
        
        if (!available) {
          toast.error('This email is not available (already registered)', { id: 'email-taken' });
        }
      } else {
        setEmailStatus({ loading: false, available: null, message: '' });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email]);

  const handleChange = (e) => {
    if (e.target.name === 'avatar') {
      const file = e.target.files[0];
      if (file) {
        setFormData({ ...formData, avatar: file });
        setAvatarPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!formData.avatar) {
      toast.error('Avatar is required');
      return;
    }

    setLoading(true);
    
    const data = new FormData();
    data.append('fullname', formData.fullname);
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('avatar', formData.avatar);

    const { success, error, isVerified } = await signup(data);
    
    if (success) {
      if (isVerified) {
        toast.success('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast.success('OTP sent to your email!');
        setShowOtpInput(true);
      }
    } else {
      toast.error(error);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    const { success, error } = await verifyOtp(formData.email, otp);
    
    if (success) {
      toast.success('Email verified successfully! Please login.');
      navigate('/login');
    } else {
      toast.error(error);
    }
    setOtpLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-white">{showOtpInput ? 'Verify Email' : 'Create Account'}</h2>
      
      {!showOtpInput ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24 mb-2">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 border-2 border-gray-600 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Upload className="w-4 h-4 text-white" />
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                  required
                />
              </label>
            </div>
            <p className="text-sm text-gray-400">Upload your avatar</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Full Name</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full p-2.5 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full p-2.5 rounded bg-gray-700 text-white border ${
                usernameStatus.available === true ? 'border-green-500' : 
                usernameStatus.available === false ? 'border-red-500' : 'border-gray-600'
              } focus:outline-none`}
              placeholder="johndoe"
              required
            />
            {usernameStatus.message && (
              <p className={`text-xs mt-1 ${usernameStatus.available ? 'text-green-400' : 'text-red-400'}`}>
                {usernameStatus.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2.5 rounded bg-gray-700 text-white border ${
                emailStatus.available === false ? 'border-red-500' : 'border-gray-600'
              } focus:outline-none`}
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2.5 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              required
              minLength="6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2.5 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              required
              minLength="6"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            } text-white mt-6`}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-gray-300 text-sm">An OTP has been sent to {formData.email}. Please enter it below to verify your account.</p>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2.5 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none text-center text-2xl tracking-widest"
              placeholder="123456"
              required
              maxLength="6"
            />
          </div>
          <button
            type="submit"
            disabled={otpLoading}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              otpLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            } text-white mt-6`}
          >
            {otpLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button
            type="button"
            onClick={() => setShowOtpInput(false)}
            className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Back to Signup
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-red-400 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Signup;
