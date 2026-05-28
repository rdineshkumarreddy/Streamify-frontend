import { axiosInstance as api } from './axiosInstance';

export const getTweets = async (params = {}) => {
  const response = await api.get('/tweets', { params });
  return response.data;
};

export const getTweet = async (id) => {
  const response = await api.get(`/tweets/${id}`);
  return response.data;
};

export const createTweet = async (content, videoId = null) => {
  const payload = { content };
  if (videoId) payload.videoId = videoId;
  const response = await api.post('/tweets', payload);
  return response.data;
};

export const deleteTweet = async (id) => {
  const response = await api.delete(`/tweets/${id}`);
  return response.data;
};

export const toggleTweetLike = async (id) => {
  const response = await api.post(`/likes/tweet/${id}`);
  return response.data;
};

export const addTweetComment = async (tweetId, content) => {
  const response = await api.post(`/comments/tweet/${tweetId}`, { content });
  return response.data;
};

export const deleteTweetComment = async (commentId) => {
  const response = await api.delete(`/comments/c/${commentId}`);
  return response.data;
};
