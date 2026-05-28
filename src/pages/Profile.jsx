// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserByUsername, subscribe, unsubscribe } from '../api/user.api';
import VideoCard from '../components/VideoCard';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { formatViews } from '../utils/formatViews';

import toast from 'react-hot-toast';

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user } = useAuth();

  // Determine if it's the user's own profile based on username params OR loaded profile ID
  const isOwnProfile = 
    (user?.username?.toLowerCase() === username?.toLowerCase()) || 
    (profile && user?._id === profile?._id);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Ensure username is properly encoded or handled
        const data = await getUserByUsername(username);
        setProfile(data);
        setIsSubscribed(data.isSubscribed);
      } catch (err) {
        setError('Failed to load profile. Please try again later.');
        console.error('Error fetching profile:', err);
        // Only toast if it's not a 404/not found, to minimalize noise
        if (err.response?.status !== 404) {
             toast.error(err.response?.data?.message || "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  const handleSubscribe = async () => {
    if (!user) {
        toast.error("Please login to subscribe");
        return;
    }

    // if (isOwnProfile) {
    //     toast.error("You cannot subscribe to your own channel");
    //     return;
    // }

    try {
      if (isSubscribed) {
        await unsubscribe(profile._id);
        setIsSubscribed(false);
        setProfile(prev => ({
          ...prev,
          subscriberCount: Math.max(0, prev.subscriberCount - 1)
        }));
        toast.success("Unsubscribed successfully");
      } else {
        await subscribe(profile._id);
        setIsSubscribed(true);
        setProfile(prev => ({
          ...prev,
          subscriberCount: prev.subscriberCount + 1
        }));
        toast.success("Subscribed successfully");
      }
    } catch (err) {
      console.error('Error toggling subscription:', err);
      toast.error(err.response?.data?.message || "Failed to update subscription");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-youtube-red"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error || 'Profile not found'}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-youtube-dark-2 rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <img
            src={profile.avatar}
            alt={profile.username}
            className="w-32 h-32 rounded-full object-cover"
          />
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
            <p className="text-youtube-text-secondary">@{profile.username}</p>
            <p className="mt-2 text-white">{profile.bio}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-youtube-text-secondary">
              <span>{formatViews(profile.subscriberCount)} subscribers</span>
              <span>{formatViews(profile.videoCount)} videos</span>
            </div>
              <div className="mt-4">
                <Button
                  variant={isSubscribed ? 'outline' : 'primary'}
                  onClick={handleSubscribe}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
              </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Videos</h2>
        {profile.videos && profile.videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {profile.videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-youtube-text-secondary">No videos yet</p>
          </div>
        )}
      </div>

      {profile.playlists && profile.playlists.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Playlists</h2>
            <Link to="/playlists" className="text-blue-400 text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.playlists.slice(0, 3).map((playlist) => (
              <Link
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                className="block bg-youtube-dark-2 rounded-lg overflow-hidden hover:bg-youtube-gray/30 transition-colors"
              >
                <div className="relative">
                  <div className="aspect-video bg-youtube-gray/30 flex items-center justify-center">
                    <span className="text-4xl">🎬</span>
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {playlist.videoCount} videos
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-white line-clamp-2">
                    {playlist.name}
                  </h3>
                  <p className="text-sm text-youtube-text-secondary mt-1">
                    {playlist.videoCount} videos • {playlist.views} views
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;