import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getPlaylist, getWatchLaterPlaylist } from '../api/playlist.api';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../contexts/AuthContext';

const Playlist = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true);
        let data;
        if (playlistId === 'watch-later') {
          data = await getWatchLaterPlaylist();
        } else {
          data = await getPlaylist(playlistId);
        }
        
        const playlistData = data.data;
        setPlaylist(playlistData);
        
        // Check if current user is the owner
        setIsOwner(playlistData.owner === currentUser?._id || playlistData.owner?._id === currentUser?._id);
      } catch (error) {
        console.error('Error fetching playlist:', error);
        toast.error('Failed to load playlist');
      } finally {
        setLoading(false);
      }
    };

    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId, currentUser]);

  const handleVideoClick = (videoId) => {
    navigate(`/watch/${videoId}`, { state: { fromPlaylist: playlistId } });
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading playlist...</div>;
  }

  if (!playlist) {
    return <div className="container mx-auto px-4 py-8">Playlist not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{playlist.description}</p>
        <div className="flex items-center text-sm text-gray-500">
          <span>{playlist.videos?.length || 0} videos</span>
          {isOwner && (
            <button className="ml-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Edit Playlist
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {playlist.videos?.length > 0 ? (
          playlist.videos.map((video) => (
            <div 
              key={video._id} 
              onClick={() => handleVideoClick(video._id)}
              className="cursor-pointer hover:opacity-90 transition-opacity"
            >
              <VideoCard video={video} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">This playlist is empty</p>
            {isOwner && (
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Add Videos
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Playlist;
