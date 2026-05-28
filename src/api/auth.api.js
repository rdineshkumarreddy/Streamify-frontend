// src/api/auth.api.js
import { axiosInstance as api } from './axiosInstance';

export const register = async (userData) => {
  try {
    console.log('Registering user with data:', userData);
    const response = await api.post('/users/register', userData, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });
    
    console.log('Registration successful:', response.data);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from server');
    }
    
    return {
      user: response.data.data,
      accessToken: response.headers['set-cookie']?.[0]?.split(';')[0]?.split('=')[1] || null
    };
  } catch (error) {
    console.error('Registration error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Create a more descriptive error message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error?.message || 
                        'Failed to register. Please try again.';
    
    // Create a new error with the server's message
    const registrationError = new Error(errorMessage);
    registrationError.response = error.response;
    
    throw registrationError;
  }
};

export const login = async (email, password) => {
  try {
    console.log('Logging in user:', email);
    const response = await api.post(
      '/users/login', 
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      }
    );
    
    console.log('Login successful:', response.data);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from server');
    }
    
    // Extract the access token from the response
    const accessToken = response.data.data.accessToken || 
                       response.headers['set-cookie']?.[0]?.split(';')[0]?.split('=')[1];
    
    if (!accessToken) {
      throw new Error('No access token received');
    }
    
    return {
      user: response.data.data.user || response.data.data,
      accessToken
    };
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Create a more descriptive error message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error?.message || 
                        'Invalid email or password';
    
    // Create a new error with the server's message
    const loginError = new Error(errorMessage);
    loginError.response = error.response;
    
    throw loginError;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/current-user');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/users/logout');
  } catch (error) {
    console.error('Logout error:', error);
    // Even if logout fails, we still want to clear the token and state
  } finally {
    // Clear tokens from storage
    localStorage.removeItem('accessToken');
    // Clear any cookies by setting an expired cookie
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};

// ... rest of the file remains the same