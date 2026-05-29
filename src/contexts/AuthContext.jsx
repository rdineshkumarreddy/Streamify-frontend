// frontend/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance as axios } from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and fetch user data
      const verifyToken = async () => {
        try {
          const { data } = await axios.get('/users/current-user');
          setUser(data.data); // data.data because ApiResponse wrapper has .data property for payload
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
        } finally {
          setLoading(false);
        }
      };
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      // Detect if input is email or username
      const isEmail = email.includes('@');
      const loginData = isEmail 
        ? { email, password } 
        : { username: email, password };
      
      const { data } = await axios.post('/users/login', loginData);
      localStorage.setItem('token', data.data.accessToken);
      setUser(data.data.user);
      navigate('/');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (userData) => {
    try {
      // userData can be JSON or FormData. If FormData, axios sets header automatically.
      const { data } = await axios.post('/users/register', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Registration usually returns user but might not return token automatically depending on backend 
      // Backend RegisterUser returns: createdUser (no token).
      // So checking backend: Step 173 RegisterUser returns data: createdUser.
      // So we usually need to login after signup, or just redirect to login.
      // But let's see. The user might expect auto-login.
      // The backend DOES NOT generate token in RegisterUser.
      // So we should navigate to login page or auto-login.
      // For now, let's just return success so component can navigate to login.
      // Or we can chain a login call here.
      // Let's keep it simple: return success.
      return { 
        success: true, 
        isVerified: data.data?.user?.isVerified || data.data?.isVerified,
        otp: data.data?.otp
      };
    } catch (error) {
       return { success: false, error: error.response?.data?.message || 'Signup failed' };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      await axios.post('/users/verify-otp', { email, otp });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Verification failed' };
    }
  };

  const checkUsernameAvailability = async (username) => {
    try {
      const { data } = await axios.get(`/users/check-username?username=${username}`);
      return data.data.available;
    } catch (error) {
      return false;
    }
  };

  const checkEmailAvailability = async (email) => {
    try {
      const { data } = await axios.get(`/users/check-email?email=${email}`);
      return data.data.available;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, verifyOtp, checkUsernameAvailability, checkEmailAvailability }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};