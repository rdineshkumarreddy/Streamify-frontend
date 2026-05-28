import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getPlaylists } from '../api/playlist.api';
import { getWatchHistory } from '../api/user.api';
import { useAuth } from '../contexts/AuthContext';

const Library = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('playlists');
  const [playlists, setPlaylists] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState({
    playlists: true,
    history: true
  });

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'playlists') {
      fetchPlaylists();
    } else if (activeTab === 'history') {
      fetchWatchHistory();
    }
  }, [activeTab, user]);

  const fetchPlaylists = async () => {
    try {
      setLoading(prev => ({ ...prev, playlists: true }));
      const response = await getPlaylists(user._id);
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast.error('Failed to load playlists');
    } finally {
      setLoading(prev => ({ ...prev, playlists: false }));
    }
  };

  const fetchWatchHistory = async () => {
    try {
      setLoading(prev => ({ ...prev, history: true }));
      const response = await getWatchHistory();
      setHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching watch history:', error);
      toast.error('Failed to load watch history');
    } finally {
      setLoading(prev => ({ ...prev, history: false }));
    }
  };

  const handlePlaylistClick = (playlistId) => {
    navigate(`/playlist/${playlistId}`);
  };

  const handleVideoClick = (videoId) => {
    navigate(`/watch/${videoId}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Library</h1>
      
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('playlists')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'playlists'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Playlists
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Watch History
          </button>
        </nav>
      </div>

      {activeTab === 'playlists' ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Playlists</h2>
          {loading.playlists ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : playlists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {playlists.map((playlist) => (
                <div
                  key={playlist._id}
                  onClick={() => handlePlaylistClick(playlist._id)}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="relative">
                    <img
                      src={playlist.videos?.[0]?.thumbnail || 'https://via.placeholder.com/320x180?text=Empty+Playlist'}
                      alt={playlist.name}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {playlist.videos?.length || 0} videos
                    </div>
                  </div>
                  <h3 className="font-medium mt-2">{playlist.name}</h3>
                  <p className="text-sm text-gray-400">
                    {playlist.videos?.length || 0} videos
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">You don't have any playlists yet</p>
              <button
                onClick={() => navigate('/playlists')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Playlist
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Watch History</h2>
          {loading.history ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex gap-4 animate-pulse">
                  <div className="w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-4">
              {history.map((video) => (
                <div
                  key={video._id}
                  onClick={() => handleVideoClick(video._id)}
                  className="flex gap-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-40 h-24 object-cover rounded"
                    />
                    <span className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                      {Math.floor((video.duration || 0) / 60)}:{((video.duration || 0) % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{video.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {video.owner?.username} • {video.views} views
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Watched recently
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Your watch history is empty</p>
              <p className="text-gray-400 text-sm mt-2">
                Videos you watch will appear here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Library;
