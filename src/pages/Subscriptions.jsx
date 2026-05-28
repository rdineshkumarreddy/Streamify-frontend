import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ChannelCard from '../components/ChannelCard';
import { getSubscribedChannels } from '../api/user.api';
import { useAuth } from '../contexts/AuthContext';

const Subscriptions = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubscribedChannelsData = async () => {
      if (!user?._id) return;
      
      try {
        setLoading(true);
        const response = await getSubscribedChannels(user._id);
        
        // Backend returns array of subscription objects with populated channel
        const subscribedChannels = (response.data || []).map(sub => ({
           ...sub.channel,
           _id: sub.channel._id,
           subscribers: sub.channel.subscribersCount || 0,
           isSubscribed: true
        }));
        
        setChannels(subscribedChannels);
      } catch (error) {
        console.error('Error fetching subscribed channels:', error);
        toast.error('Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribedChannelsData();
  }, [user?._id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Subscriptions</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Subscriptions</h1>
      
      {channels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {channels.map((channel) => (
            <ChannelCard key={channel._id} channel={channel} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">You haven't subscribed to any channels yet</p>
          <p className="text-gray-400 mt-2">Subscribe to your favorite channels to see them here</p>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
