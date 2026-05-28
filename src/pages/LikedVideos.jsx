import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import VideoCard from '../components/VideoCard';
import { ThumbsUp } from 'lucide-react';

const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get('/api/v1/likes/videos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Transform the response data - backend returns likes with populated video
        const likedVideos = response.data.data
          .filter(like => like.video) // Filter out any likes where video was deleted
          .map(like => ({
            ...like.video,
            owner: like.video.owner // Ensure owner is properly mapped
          }));
        
        setVideos(likedVideos);
      } catch (error) {
        console.error('Error fetching liked videos:', error);
        toast.error('Failed to load liked videos');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedVideos();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8 animate-pulse text-gray-500">
          <ThumbsUp className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Liked Videos</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-video bg-youtube-dark-2 rounded-xl mb-3"></div>
              <div className="h-5 bg-youtube-dark-2 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-youtube-dark-2 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white">
      <div className="flex items-center gap-3 mb-8">
        <ThumbsUp className="w-8 h-8 text-red-500" />
        <h1 className="text-3xl font-bold tracking-tight">Liked Videos</h1>
      </div>
      
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-youtube-dark-2 rounded-3xl border border-white/5 shadow-inner">
          <ThumbsUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No liked videos yet</h2>
          <p className="text-gray-500">Like videos to see them here</p>
        </div>
      )}
    </div>
  );
};

export default LikedVideos;
