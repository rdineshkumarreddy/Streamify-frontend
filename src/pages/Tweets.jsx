// frontend/src/pages/Tweets.jsx
import React, { useState, useEffect } from 'react';
import { axiosInstance as axios } from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2, Edit2, X, Check } from 'lucide-react';

const Tweets = () => {
  const { user } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [editingTweet, setEditingTweet] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Fetch tweets
  const fetchTweets = async () => {
    try {
      const response = await axios.get('/tweets/feed');
      setTweets(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tweets:', error);
      toast.error('Failed to load tweets');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, [user]);

  // Create tweet
  const handleCreateTweet = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setCreateLoading(true);
    try {
      await axios.post('/tweets', { content });
      setContent('');
      toast.success('Tweet posted successfully');
      fetchTweets();
    } catch (error) {
      console.error('Error creating tweet:', error);
      toast.error('Failed to post tweet');
    } finally {
      setCreateLoading(false);
    }
  };

  // Delete tweet
  const handleDeleteTweet = async (tweetId) => {
    if (!window.confirm('Are you sure you want to delete this tweet?')) return;
    try {
      await axios.delete(`/tweets/${tweetId}`);
      setTweets(tweets.filter(t => t._id !== tweetId));
      toast.success('Tweet deleted');
    } catch (error) {
      console.error('Error deleting tweet:', error);
      toast.error('Failed to delete tweet');
    }
  };

  // Start editing
  const startEditing = (tweet) => {
    setEditingTweet(tweet._id);
    setEditContent(tweet.content);
  };

  // Save edit
  const handleUpdateTweet = async (tweetId) => {
    if (!editContent.trim()) return;
    try {
      await axios.patch(`/tweets/${tweetId}`, { content: editContent });
      setTweets(tweets.map(t => t._id === tweetId ? { ...t, content: editContent } : t));
      setEditingTweet(null);
      toast.success('Tweet updated');
    } catch (error) {
      console.error('Error updating tweet:', error);
      toast.error('Failed to update tweet');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
        <h2 className="text-2xl font-bold mb-4">Please login to view specific tweets</h2>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 text-white">
      <h1 className="text-3xl font-bold mb-8">Tweets</h1>

      {/* Create Tweet Form */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
        <form onSubmit={handleCreateTweet}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-gray-700 text-white rounded-lg p-4 min-h-[100px] border border-gray-600 focus:border-blue-500 focus:outline-none resize-none mb-4"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createLoading || !content.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Tweet
            </button>
          </div>
        </form>
      </div>

      {/* Tweets List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : tweets.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            You haven't posted any tweets yet.
          </div>
        ) : (
          tweets.map((tweet) => (
            <div key={tweet._id} className="bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700/50 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center mr-3 overflow-hidden border border-white/5 shadow-inner">
                       {tweet.owner?.avatar ? (
                           <img src={tweet.owner.avatar} className="w-full h-full object-cover" />
                       ) : (
                           <span className="text-gray-300 font-bold">
                               {tweet.owner?.username ? tweet.owner.username[0].toUpperCase() : 'U'}
                           </span>
                       )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {tweet.owner?.username || 'Unknown User'}
                          {tweet.owner?._id === user?._id && <span className="ml-2 text-[10px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-400/20">You</span>}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {editingTweet === tweet._id ? (
                    <div className="mt-2 pl-12">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-gray-700 p-3 rounded-lg text-white border border-blue-500 focus:outline-none mb-2"
                        rows="3"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateTweet(tweet._id)}
                          className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                        >
                          <Check className="w-3 h-3 mr-1" /> Save
                        </button>
                        <button
                          onClick={() => setEditingTweet(null)}
                          className="flex items-center px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
                        >
                          <X className="w-3 h-3 mr-1" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-200 mt-1 whitespace-pre-wrap pl-12 leading-relaxed">{tweet.content}</p>
                  )}
                </div>

                <div className="flex flex-col ml-4">
                   {editingTweet !== tweet._id && tweet.owner?._id === user?._id && (
                    <>
                      <button
                        onClick={() => startEditing(tweet)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-full transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTweet(tweet._id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Attached Video Card */}
              {tweet.video && (
                <div 
                  className="mt-3 ml-12 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 cursor-pointer hover:border-gray-500 transition-colors"
                  onClick={() => window.location.href = `/watch/${tweet.video._id}`}
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-48 h-28 bg-black flex-shrink-0">
                      <img 
                        src={tweet.video.thumbnail} 
                        alt={tweet.video.title} 
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                        {tweet.video.duration ? `${Math.floor(tweet.video.duration/60)}:${Math.floor(tweet.video.duration%60).toString().padStart(2,'0')}` : '0:00'}
                      </span>
                    </div>
                    <div className="p-3 flex flex-col justify-center min-w-0">
                      <h4 className="text-white font-semibold text-sm line-clamp-2 mb-1">{tweet.video.title}</h4>
                      <div className="flex items-center text-xs text-gray-400 mb-1">
                        <span className="font-medium text-gray-300">{tweet.video.owner?.username}</span>
                        <span className="mx-1">•</span>
                        <span>{tweet.video.views} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tweets;