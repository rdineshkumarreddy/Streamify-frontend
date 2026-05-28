import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Heart, Send, Radio, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const WatchLive = () => {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchStreamDetails();
    fetchChatMessages();

    // Call API to join stream
    const token = localStorage.getItem('token');
    if (token) {
      axios.patch(`/api/v1/livestreams/${streamId}/viewers`, { action: 'join' }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => console.error("Failed to join viewer count", err));
    }

    // Poll for updates
    const streamInterval = setInterval(fetchStreamDetails, 5000);
    const chatInterval = setInterval(fetchChatMessages, 3000);

    return () => {
      clearInterval(streamInterval);
      clearInterval(chatInterval);
      
      // Call API to leave stream
      if (token) {
        axios.patch(`/api/v1/livestreams/${streamId}/viewers`, { action: 'leave' }, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => console.error("Failed to leave viewer count", err));
      }
    };
  }, [streamId]);

  useEffect(() => {
    // Auto-scroll chat to bottom
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const fetchStreamDetails = async () => {
    try {
      const { data } = await axios.get(`/api/v1/livestreams/${streamId}`);
      setStream(data.data);
      
      if (!data.data.isLive) {
        toast.error('This stream has ended');
        setTimeout(() => navigate('/live'), 2000);
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
      toast.error('Failed to load stream');
      navigate('/live');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const { data } = await axios.get(`/api/v1/livestreams/${streamId}/chat`);
      setChatMessages(data.data);
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `/api/v1/livestreams/${streamId}/chat`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChatMessages(prev => [...prev, data.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleLike = async () => {
    if (!user || hasLiked) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/v1/livestreams/${streamId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHasLiked(true);
      setStream(prev => ({ ...prev, likes: prev.likes + 1 }));
      toast.success('Liked!');
    } catch (error) {
      console.error('Error liking stream:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-youtube-dark-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
      </div>
    );
  }

  if (!stream) {
    return null;
  }

  return (
    <div className="min-h-screen bg-youtube-dark-1 text-white">
      <div className="max-w-[1800px] mx-auto p-4">
        <button
          onClick={() => navigate('/live')}
          className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Live Streams
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Video Player - 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-youtube-dark-2 rounded-xl overflow-hidden border border-white/10">
              <div className="aspect-video bg-gradient-to-br from-red-900/20 to-purple-900/20 relative flex items-center justify-center">
                <div className="text-center">
                  <Radio className="w-20 h-20 text-red-500 mx-auto mb-4 animate-pulse" />
                  <p className="text-xl font-semibold">Live Stream in Progress</p>
                  <p className="text-gray-400 mt-2">
                    Video streaming requires WebRTC implementation
                  </p>
                </div>

                <div className="absolute top-4 left-4 bg-red-600 px-3 py-1.5 rounded-md flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="font-semibold">LIVE</span>
                </div>

                <div className="absolute top-4 right-4 bg-black/70 px-3 py-1.5 rounded-md flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">{stream.viewerCount}</span>
                </div>
              </div>
            </div>

            {/* Stream Info */}
            <div className="bg-youtube-dark-2 rounded-xl p-6 border border-white/10">
              <h1 className="text-2xl font-bold mb-4">{stream.title}</h1>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={stream.streamer.avatar || `https://ui-avatars.com/api/?name=${stream.streamer.username}&background=random`}
                    alt={stream.streamer.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{stream.streamer.fullname}</p>
                    <p className="text-sm text-gray-400">@{stream.streamer.username}</p>
                  </div>
                </div>

                <button
                  onClick={handleLike}
                  disabled={!user || hasLiked}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    hasLiked
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
                  <span>{stream.likes}</span>
                </button>
              </div>

              {stream.description && (
                <div className="mb-4">
                  <p className="text-gray-300">{stream.description}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="bg-gray-700 px-3 py-1 rounded-full">{stream.category}</span>
                <span>Started {new Date(stream.startedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Live Chat - 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-youtube-dark-2 rounded-xl border border-white/10 h-[calc(100vh-8rem)] flex flex-col">
              <div className="p-4 border-b border-white/10">
                <h2 className="font-semibold flex items-center gap-2">
                  <Radio className="w-5 h-5 text-red-500" />
                  Live Chat
                </h2>
              </div>

              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <p>No messages yet</p>
                    <p className="text-sm mt-1">Be the first to say something!</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg._id} className="group">
                      <div className="flex items-start gap-2">
                        <img
                          src={msg.user.avatar || `https://ui-avatars.com/api/?name=${msg.user.username}&background=random`}
                          alt={msg.user.username}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-sm">
                              {msg.user.username}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 break-words">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {user ? (
                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Say something..."
                      className="flex-1 bg-youtube-dark-3 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      maxLength={500}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed p-2 rounded-lg transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 border-t border-white/10 text-center text-gray-400">
                  <p className="text-sm">Sign in to chat</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchLive;
