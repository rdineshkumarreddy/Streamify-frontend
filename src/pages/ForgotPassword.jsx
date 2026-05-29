import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance as axios } from '../api/axiosInstance';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 for email, 2 for OTP and new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/users/forgot-password', { email });
      if (response.data.success) {
        toast.success(response.data.message || 'OTP sent to your email');
        if (response.data.data?.otp) {
          setForgotOtp(response.data.data.otp);
        }
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/users/reset-password', { email, otp, newPassword });
      if (response.data.success) {
        toast.success('Password reset successfully! You can now login.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-youtube-dark">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-2 text-white text-center">Reset Password</h2>
          <p className="text-gray-400 text-center mb-8">
            {step === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP and your new password'}
          </p>
          
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter your registered email"
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
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {forgotOtp && (
                <div className="bg-blue-600/10 border border-blue-500/20 p-3 rounded-lg text-sm text-blue-400 text-center font-semibold mb-4">
                  Testing OTP: <span className="text-white text-base select-all">{forgotOtp}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter the 6-digit OTP"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter your new password"
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
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Remember your password?{' '}
              <Link to="/login" className="text-red-500 hover:text-red-400 font-medium hover:underline">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
