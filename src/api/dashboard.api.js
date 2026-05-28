import { axiosInstance as api } from './axiosInstance';

export const getDashboardStats = async (timeRange = '7days') => {
  const response = await api.get('/dashboard/stats', { params: { range: timeRange } });
  return response.data;
};

export const getVideoAnalytics = async (videoId) => {
  const response = await api.get(`/dashboard/videos/${videoId}/analytics`);
  return response.data;
};

export const getChannelAnalytics = async () => {
  const response = await api.get('/dashboard/channel/analytics');
  return response.data;
};

export const getTopVideos = async (limit = 5) => {
  const response = await api.get('/dashboard/videos/top', { params: { limit } });
  return response.data;
};

export const getAudienceDemographics = async () => {
  const response = await api.get('/dashboard/audience/demographics');
  return response.data;
};

export const getEngagementMetrics = async () => {
  const response = await api.get('/dashboard/engagement');
  return response.data;
};
