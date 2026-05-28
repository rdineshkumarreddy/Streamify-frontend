import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { axiosInstance as axios } from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import VideoCard from '../components/VideoCard';
import { toast } from 'react-hot-toast';

const Channel = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchChannelData = async () => {
    try {
      setLoading(true);
      
      // Fetch channel profile
      const channelRes = await axios.get(`/users/c/${username}`);
      const channelData = channelRes.data.data;
      setChannel(channelData);
      setIsSubscribed(channelData.isSubscribed);

      // Fetch channel videos
      const videosRes = await axios.get(`/videos?userId=${channelData._id}`);
      setVideos(videosRes.data.data?.videos || []);
      
    } catch (error) {
      console.error('Error fetching channel data:', error);
      toast.error('Failed to load channel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannelData();
  }, [username, user?._id]);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }

    try {
      setIsLoading(true);
      // Fix: Backend route is /api/v1/subscriptions/toggle/:channelId
      await axios.post(`/subscriptions/toggle/${channel._id}`);
      
      const newIsSubscribed = !isSubscribed;
      setIsSubscribed(newIsSubscribed);
      setChannel(prev => ({
          ...prev,
          subscribersCount: newIsSubscribed 
            ? (prev.subscribersCount || 0) + 1 
            : Math.max(0, (prev.subscribersCount || 0) - 1)
      }));
      toast.success(newIsSubscribed ? 'Subscribed' : 'Unsubscribed');
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="text-gray-400 font-medium">Loading channel profile...</p>
        </div>
    );
  }

  if (!channel) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Channel not found</h2>
            <p className="text-gray-400">The channel you are looking for doesn't exist.</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      {/* Channel Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12 bg-youtube-dark-2 p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-youtube-gray/20 shadow-xl">
            <img
              src={channel.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.username)}&background=random`}
              alt={channel.username}
              className="w-full h-full object-cover"
            />
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-4xl font-extrabold mb-1">{channel.fullname}</h1>
          <p className="text-youtube-text-secondary text-lg mb-4">@{channel.username}</p>
          <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
            <div className="text-center md:text-left">
                <span className="block text-2xl font-bold">{channel.subscribersCount?.toLocaleString() || 0}</span>
                <span className="text-xs text-youtube-text-secondary uppercase tracking-widest font-semibold">Subscribers</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center md:text-left">
                <span className="block text-2xl font-bold">{videos.length}</span>
                <span className="text-xs text-youtube-text-secondary uppercase tracking-widest font-semibold">Videos</span>
            </div>
          </div>
          <p className="max-w-2xl text-gray-300 leading-relaxed mb-6">{channel.bio || 'No bio available.'}</p>
          
          {user?._id !== channel._id && (
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className={`px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 ${
                  isSubscribed 
                    ? 'bg-youtube-gray/20 text-white hover:bg-youtube-gray/40' 
                    : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Processing...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
          )}
        </div>
      </div>

      {/* Channel Videos */}
      <div>
        <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold">Videos</h2>
            <div className="h-0.5 flex-1 bg-white/5"></div>
        </div>
        
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-youtube-dark-2 rounded-3xl border border-white/5">
            <p className="text-youtube-text-secondary text-lg font-medium">This channel hasn't uploaded any videos yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Channel;
