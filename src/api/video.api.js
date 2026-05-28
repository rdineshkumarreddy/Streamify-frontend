import { axiosInstance as api } from './axiosInstance';

export const getVideos = async (params = {}) => {
  const response = await api.get('/videos', { params });
  return response.data;
};

export const getVideoById = async (id) => {
  const response = await api.get(`/videos/${id}`);
  return response.data;
};

export const uploadVideo = async (formData, config = {}) => {
  const response = await api.post('/videos', formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateVideo = async (id, videoData) => {
  const response = await api.patch(`/videos/${id}`, videoData);
  return response.data;
};

export const deleteVideo = async (id) => {
  const response = await api.delete(`/videos/${id}`);
  return response.data;
};

export const likeVideo = async (id) => {
  const response = await api.post(`/videos/${id}/like`);
  return response.data;
};

export const dislikeVideo = async (id) => {
  const response = await api.post(`/videos/${id}/dislike`);
  return response.data;
};

export const addComment = async (videoId, content) => {
  const response = await api.post(`/videos/${videoId}/comments`, { content });
  return response.data;
};

export const deleteComment = async (videoId, commentId) => {
  const response = await api.delete(`/videos/${videoId}/comments/${commentId}`);
  return response.data;
};
