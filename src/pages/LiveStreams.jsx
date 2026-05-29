import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Users, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { axiosInstance as axios } from '../api/axiosInstance';

const LiveStreams = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveStreams();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchLiveStreams, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveStreams = async () => {
    try {
      const { data } = await axios.get('/livestreams/active');
      setStreams(data.data.streams);
    } catch (error) {
      console.error('Error fetching live streams:', error);
      toast.error('Failed to load live streams');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (startedAt) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000); // in seconds
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-youtube-dark-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-youtube-dark-1 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Radio className="w-8 h-8 text-red-500" />
            Live Now
          </h1>
          <p className="text-gray-400">
            {streams.length} {streams.length === 1 ? 'stream' : 'streams'} currently live
          </p>
        </div>

        {streams.length === 0 ? (
          <div className="text-center py-20">
            <Radio className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No live streams right now</h2>
            <p className="text-gray-400 mb-6">Check back later or start your own stream!</p>
            <Link
              to="/go-live"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Radio className="w-5 h-5" />
              Go Live
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.map((stream) => (
              <Link
                key={stream._id}
                to={`/live/${stream._id}`}
                className="group bg-youtube-dark-2 rounded-xl overflow-hidden border border-white/10 hover:border-red-500 transition-all"
              >
                <div className="aspect-video bg-gradient-to-br from-red-900/20 to-purple-900/20 relative">
                  {stream.thumbnail ? (
                    <img
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Radio className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  
                  <div className="absolute top-3 left-3 bg-red-600 px-3 py-1 rounded-md flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="font-semibold text-sm">LIVE</span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded text-sm flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {stream.viewerCount}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={stream.streamer.avatar || `https://ui-avatars.com/api/?name=${stream.streamer.username}&background=random`}
                      alt={stream.streamer.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-red-500 transition-colors">
                        {stream.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {stream.streamer.username}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{stream.category}</span>
                        <span>•</span>
                        <span>{formatDuration(stream.startedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStreams;
