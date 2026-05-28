// src/pages/Playlists.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlaylists, deletePlaylist } from '../api/playlist.api';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { formatViews } from '../utils/formatViews';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const data = await getPlaylists();
        setPlaylists(data?.data || []);
      } catch (err) {
        setError('Failed to load playlists. Please try again later.');
        console.error('Error fetching playlists:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const handleDelete = async (playlistId) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        await deletePlaylist(playlistId);
        setPlaylists(playlists.filter(playlist => playlist._id !== playlistId));
      } catch (err) {
        console.error('Error deleting playlist:', err);
        alert('Failed to delete playlist. Please try again.');
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

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Your Playlists</h1>
        <Link to="/playlists/new">
          <Button variant="primary">New Playlist</Button>
        </Link>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-youtube-text-secondary mb-4">You don't have any playlists yet</p>
          <Link to="/playlists/new">
            <Button variant="primary">Create a playlist</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="bg-youtube-dark-2 rounded-lg overflow-hidden hover:bg-youtube-gray/30 transition-colors"
            >
              <Link to={`/playlist/${playlist._id}`} className="block">
                <div className="relative">
                  <div className="aspect-video bg-youtube-gray/30 flex items-center justify-center">
                    <span className="text-4xl">🎬</span>
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {playlist.videos?.length || 0} videos
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-white line-clamp-2">
                    {playlist.name}
                  </h3>
                  <p className="text-sm text-youtube-text-secondary mt-1">
                    {playlist.videos?.length || 0} videos • {formatViews(playlist.views)} views
                  </p>
                </div>
              </Link>
              <div className="px-4 pb-4">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(playlist._id);
                  }}
                  className="w-full"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlists;