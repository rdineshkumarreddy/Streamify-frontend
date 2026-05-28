import { axiosInstance as api } from './axiosInstance';

export const getPlaylists = async () => {
  const response = await api.get('/playlists');
  return response.data;
};

export const getPlaylist = async (id) => {
  const response = await api.get(`/playlists/${id}`);
  return response.data;
};

export const getWatchLaterPlaylist = async () => {
  const response = await api.get('/playlists/watch-later');
  return response.data;
};

export const toggleWatchLater = async (videoId) => {
  const response = await api.post(`/playlists/watch-later/toggle/${videoId}`);
  return response.data;
};

export const createPlaylist = async (playlistData) => {
  const response = await api.post('/playlists', playlistData);
  return response.data;
};

export const updatePlaylist = async (id, playlistData) => {
  const response = await api.patch(`/playlists/${id}`, playlistData);
  return response.data;
};

export const deletePlaylist = async (id) => {
  const response = await api.delete(`/playlists/${id}`);
  return response.data;
};

export const addVideoToPlaylist = async (playlistId, videoId) => {
  const response = await api.post(`/playlists/${playlistId}/videos`, { videoId });
  return response.data;
};

export const removeVideoFromPlaylist = async (playlistId, videoId) => {
  const response = await api.delete(`/playlists/${playlistId}/videos/${videoId}`);
  return response.data;
};

export const reorderPlaylistVideos = async (playlistId, videoIds) => {
  const response = await api.patch(`/playlists/${playlistId}/reorder`, { videoIds });
  return response.data;
};
