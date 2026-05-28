import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { formatViews } from '../utils/formatViews';
import { Link } from 'react-router-dom';
import { Trash2, History as HistoryIcon, Clock } from 'lucide-react';
import { getWatchHistory, clearHistory } from '../api/user.api';

const History = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getWatchHistory();
      setVideos(data.data || []);
    } catch (error) {
      console.error('Error fetching watch history:', error);
      toast.error('Failed to load watch history');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your entire watch history? This cannot be undone.')) return;
    
    try {
      await clearHistory();
      setVideos([]);
      toast.success('Watch history cleared');
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear history');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8 animate-pulse text-gray-500">
            <HistoryIcon className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Watch History</h1>
        </div>
        <div className="space-y-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-6 animate-pulse">
              <div className="w-full md:w-80 aspect-video bg-youtube-dark-2 rounded-xl"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-youtube-dark-2 rounded w-3/4"></div>
                <div className="h-4 bg-youtube-dark-2 rounded w-1/2"></div>
                <div className="h-4 bg-youtube-dark-2 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold tracking-tight">Watch History</h1>
        </div>
        {videos.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors px-4 py-2 rounded-full hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
            Clear all history
          </button>
        )}
      </div>
      
      {videos.length > 0 ? (
        <div className="space-y-8">
          {videos.filter(video => video && video._id).map((video) => (
            <div
              key={video._id}
              className="group flex flex-col md:flex-row gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/5"
            >
              <Link
                to={`/watch/${video._id}`}
                className="relative flex-shrink-0 w-full md:w-80 aspect-video overflow-hidden rounded-xl shadow-lg border border-white/5 bg-youtube-dark-2"
              >
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <HistoryIcon className="w-12 h-12 text-gray-700" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                   <Clock className="w-3 h-3" />
                   {Math.floor((video.duration || 0) / 60)}:{((video.duration || 0) % 60).toString().padStart(2, '0')}
                </div>
              </Link>
              
              <div className="flex-1 min-w-0 py-1">
                <Link to={`/watch/${video._id}`}>
                    <h3 className="font-bold text-xl mb-2 line-clamp-2 hover:text-red-500 transition-colors">{video.title || 'Untitled Video'}</h3>
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <Link to={`/c/${video.owner?.username || 'unknown'}`} className="hover:text-white transition-colors font-medium">
                    {video.owner?.username || 'Unknown Creator'}
                  </Link>
                  <span className="opacity-30">•</span>
                  <span>{formatViews(video.views || 0)} views</span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed max-w-2xl">
                  {video.description || 'No description available.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-youtube-dark-2 rounded-3xl border border-white/5 shadow-inner">
          <HistoryIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Keep track of what you watch</h2>
          <p className="text-gray-500">Watch history isn't available when you're signed out or have paused history.</p>
        </div>
      )}
    </div>
  );
};

export default History;
