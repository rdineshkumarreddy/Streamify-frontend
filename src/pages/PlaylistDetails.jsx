// src/pages/PlaylistDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPlaylist, deletePlaylist, removeVideoFromPlaylist } from '../api/playlist.api';
import VideoCard from '../components/VideoCard';
import Button from '../components/Button';
import { formatViews } from '../utils/formatViews';

const PlaylistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true);
        const data = await getPlaylist(id);
        setPlaylist(data?.data);
      } catch (err) {
        setError('Failed to load playlist. Please try again later.');
        console.error('Error fetching playlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id]);

  const handleDeletePlaylist = async () => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        await deletePlaylist(id);
        navigate('/playlists');
      } catch (err) {
        console.error('Error deleting playlist:', err);
        alert('Failed to delete playlist. Please try again.');
      }
    }
  };

  const handleRemoveVideo = async (videoId) => {
    if (window.confirm('Remove this video from the playlist?')) {
      try {
        await removeVideoFromPlaylist(id, videoId);
        setPlaylist(prev => ({
          ...prev,
          videos: prev.videos.filter(video => video._id !== videoId),
        }));
      } catch (err) {
        console.error('Error removing video:', err);
        alert('Failed to remove video. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-youtube-red"></div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error || 'Playlist not found'}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{playlist.name}</h1>
          <p className="text-youtube-text-secondary">
            {playlist.videos?.length || 0} videos • {formatViews(playlist.views)} views
          </p>
          {playlist.description && (
            <p className="mt-2 text-white">{playlist.description}</p>
          )}
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={() => navigate(`/playlist/${id}/edit`)}>
            Edit
          </Button>
          <Button variant="danger" onClick={handleDeletePlaylist}>
            Delete
          </Button>
        </div>
      </div>

      {playlist.videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-youtube-text-secondary mb-4">This playlist is empty</p>
          <Button onClick={() => navigate('/')}>Browse videos</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {playlist.videos.map((video) => (
            <div
              key={video._id}
              className="flex flex-col md:flex-row bg-youtube-dark-2 rounded-lg overflow-hidden"
            >
              <Link
                to={`/watch/${video._id}`}
                className="flex-shrink-0 md:w-1/3 lg:w-1/4"
              >
                <div className="relative aspect-video">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {video.duration}
                  </span>
                </div>
              </Link>
              <div className="p-4 flex-1">
                <div className="flex h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white">
                      <Link to={`/watch/${video._id}`} className="hover:underline">
                        {video.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-youtube-text-secondary mt-1">
                      <Link
                        to={`/channel/${video.channel.username}`}
                        className="hover:text-white"
                      >
                        {video.channel.name}
                      </Link>
                      <span className="mx-2">•</span>
                      {formatViews(video.views)} views
                    </p>
                    <p className="text-sm text-youtube-text-secondary mt-2 line-clamp-2">
                      {video.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveVideo(video._id)}
                    className="text-youtube-text-secondary hover:text-white ml-4"
                    title="Remove from playlist"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistDetails;