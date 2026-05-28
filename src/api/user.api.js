import { axiosInstance as api } from './axiosInstance';

export const getUserByUsername = async (username) => {
  const response = await api.get(`/users/c/${username}`);
  const data = response.data.data;
  // Normalize fields for frontend components
  if (data) {
    data.subscriberCount = data.subscribersCount;
    data.videoCount = data.videoCount || 0;
  }
  return data;
};

export const updateUser = async (userId, userData) => {
  // Backend endpoint is /users/update-account and uses req.user, so userId param is ignored but kept for signature compatibility
  const response = await api.patch(`/users/update-account`, userData);
  return response.data.data;
};

export const subscribe = async (channelId) => {
  const response = await api.post(`/subscriptions/toggle/${channelId}`);
  return response.data.data;
};

export const unsubscribe = async (channelId) => {
  const response = await api.post(`/subscriptions/toggle/${channelId}`);
  return response.data.data;
};

export const getSubscribedChannels = async (userId) => {
  const response = await api.get(`/subscriptions/user/${userId}`);
  return response.data;
};

export const getSubscriptions = async () => {
  // This might be a legacy or generic call, pointing it to the correct subscription route
  const response = await api.get('/subscriptions/channels'); // Adjust if backend has this
  return response.data;
};

export const getWatchHistory = async () => {
  const response = await api.get('/users/history');
  return response.data;
};

export const addToHistory = async (videoId) => {
  const response = await api.post(`/users/history/${videoId}`);
  return response.data;
};

export const removeFromHistory = async (videoId) => {
  const response = await api.delete(`/users/history/${videoId}`);
  return response.data;
};

export const clearHistory = async () => {
  const response = await api.delete('/users/history');
  return response.data;
};
