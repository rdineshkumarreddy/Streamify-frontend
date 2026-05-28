import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import { axiosInstance as axios } from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { createTweet } from '../api/tweet.api';
  // Helper for safe date formatting
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  const Watch = () => {
    // ... (rest of component)

    // Usage replacements:
    // Line 282 and 356:
    // <span className="text-gray-500">{formatDate(video.createdAt)}</span>
    
    // Line 438:
    // {formatDate(comment.createdAt)}
    
    // Line 501:
    // <span>{formatDate(relatedVideo.createdAt)}</span>

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showTweetModal, setShowTweetModal] = useState(false);
  const [tweetContent, setTweetContent] = useState('');
  const viewCounted = useRef(null);

  // Increment views ONLY when ID changes
  useEffect(() => {
    const incrementViews = async () => {
      if (!id || viewCounted.current === id) return;
      try {
        const response = await axios.patch(`/videos/views/${id}`);
        viewCounted.current = id; // Store ID to prevent re-counting even if effect re-runs
        
        // Update local state with the new view count from response
        if (response.data.data?.views) {
          setVideo(prev => prev ? ({
            ...prev,
            views: response.data.data.views
          }) : prev);
        }
      } catch (err) {
        console.error('Error incrementing views:', err);
      }
    };

    if (id) {
      incrementViews();
    }
  }, [id]);

  // Fetch video data and related videos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch video details
        const videoResponse = await axios.get(`/videos/${id}`);
        
        setVideo(videoResponse.data.data);
        
        // Fetch comments
        try {
          const commentsResponse = await axios.get(`/comments/${id}`);
          setComments(commentsResponse.data.data.docs || commentsResponse.data.data || []); 
        } catch (err) {
          console.warn("Failed to fetch comments", err);
        }

        // Fetch related videos
        const relatedResponse = await axios.get('/videos', {
          params: { limit: 10, page: 1 }
        });
        
        const videoList = relatedResponse.data.data?.videos || [];
        setRelatedVideos(videoList.filter(v => v._id !== id));
        
        // Check if user is subscribed
        const channelId = videoResponse.data.data?.owner?._id;
        if (user && channelId) {
          try {
            const subResponse = await axios.get(`/subscriptions/c/${channelId}`);
            setIsSubscribed(subResponse.data.data?.isSubscribed);
          } catch (err) {
            console.warn('Subscription check failed', err);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError(err.response?.data?.message || 'Failed to load video.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, user?._id]); // Use user._id instead of user object to avoid unnecessary re-runs

  // Handle like/unlike
  const handleLike = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/watch/${id}` } });
      return;
    }
    
    try {
      // Toggle like endpoint: POST /api/v1/likes/video/:videoId
      await axios.post(`/likes/video/${id}`);
      
      // Update UI
      // Since it's a toggle, we flip the state
      setVideo(prev => ({
        ...prev,
        isLiked: !prev.isLiked,
        likesCount: prev.isLiked ? (prev.likesCount - 1) : (prev.likesCount + 1)
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
      toast.error('Failed to update like. Please try again.');
    }
  };

  // Handle subscribe/unsubscribe
  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/watch/${id}` } });
      return;
    }
    
    if (!video?.owner?._id) return;
    
    try {
      // Toggle subscription endpoint: /api/v1/subscriptions/toggle/:channelId
      const response = await axios.post(`/subscriptions/toggle/${video.owner._id}`);
      
      // Update UI
      // Assuming response.data.data includes { isSubscribed: boolean } or similar
      // But typically toggle returns "Subscription added" or "removed".
      // Let's rely on prev state to toggle, but ideally backend should return new state.
      // Based on controller (which I haven't seen but is standard), let's manually toggle.
      const newIsSubscribed = !isSubscribed;
      setIsSubscribed(newIsSubscribed);
      
      setVideo(prev => ({
        ...prev,
        owner: {
          ...prev.owner,
          subscribersCount: newIsSubscribed 
            ? (prev.owner.subscribersCount || 0) + 1 
            : (prev.owner.subscribersCount || 0) - 1
        }
      }));
      
      toast.success(newIsSubscribed ? 'Subscribed' : 'Unsubscribed');
    } catch (err) {
      console.error('Error toggling subscription:', err);
      toast.error('Failed to update subscription. Please try again.');
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    if (!user) {
      navigate('/login', { state: { from: `/watch/${id}` } });
      return;
    }
    
    try {
      // Endpoint: POST /api/v1/comments/:videoId
      const response = await axios.post(
        `/comments/${id}`,
        { content: commentText }
      );
      
      const newComment = {
        ...response.data.data,
        owner: user // Manually attach current user as owner
      };
      
      // Update comments in state
      setComments(prev => [newComment, ...prev]);
      
      setCommentText('');
      toast.success('Comment added successfully');
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('Failed to add comment. Please try again.');
    }
  };

  // Handle tweet submission
  const handleTweetSubmit = async () => {
      if (!tweetContent.trim()) return;
      if (!user) {
          navigate('/login', { state: { from: `/watch/${id}` } });
          return;
      }
      
      try {
          await createTweet(tweetContent, id);
          toast.success('Tweet posted successfully!');
          setShowTweetModal(false);
          setTweetContent('');
      } catch (err) {
          console.error('Error posting tweet:', err);
          toast.error('Failed to post tweet. Please try again.');
      }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error || !video) {
    console.error('Watch Page Error State:', error);
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-6">{typeof error === 'object' ? JSON.stringify(error) : (error || 'Video not found')}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering Watch Page:', { videoId: video?._id, owner: video?.owner, comments: comments.length });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Video Player Section */}
      <div className="bg-black w-full flex justify-center">
        <div className="w-full max-w-7xl">
           <VideoPlayer src={video?.videoFile} poster={video?.thumbnail} />
        </div>
      </div>

      {/* Video Info and Comments Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Video Info and Comments */}
          <div className="lg:col-span-2">
            {/* Video Title and Stats */}
            <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
            <div className="flex flex-wrap items-center justify-between text-gray-400 text-sm mb-6 pb-6 border-b border-gray-800">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-white font-bold">{video.views?.toLocaleString() || 0} views</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-500">{formatDate(video.createdAt)}</span>
              </div>
              
              <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-1 ${video.isLiked ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span>{video.likesCount?.toLocaleString() || 0}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>{comments.length.toLocaleString()}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
                
                <button 
                  onClick={() => setShowTweetModal(true)}
                  className="flex items-center space-x-1 text-gray-400 hover:text-white"
                >
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                   </svg>
                   <span>Tweet</span>
                </button>
              </div>
            </div>

            {/* Channel Info and Subscribe Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-6 border-b border-gray-800">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-xl font-semibold overflow-hidden">
                  {video.owner?.avatar ? (
                    <Link to={`/c/${video.owner?.username || ''}`}>
                        <img 
                          src={video.owner.avatar} 
                          alt={video.owner?.username || 'Channel Avatar'} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(video.owner?.username || 'U')}&background=374151&color=fff`;
                          }}
                        />
                    </Link>
                  ) : (
                    <Link to={`/c/${video.owner?.username || ''}`} className="flex items-center justify-center w-full h-full text-white no-underline">
                        <span>{video.owner?.username?.charAt(0).toUpperCase() || 'U'}</span>
                    </Link>
                  )}
                </div>
                <div>
                  <Link to={`/c/${video.owner?.username || ''}`} className="hover:text-blue-400 transition-colors">
                      <h3 className="font-medium">{video.owner?.username || 'Unknown User'}</h3>
                  </Link>
                  <p className="text-sm text-gray-400">
                    {video.owner?.subscribersCount?.toLocaleString() || 0} subscribers
                  </p>
                </div>
              </div>
              
              {!user || user._id !== video.owner?._id ? (
                  <button 
                    onClick={handleSubscribe}
                    className={`px-6 py-2 rounded-full font-medium ${isSubscribed ? 'bg-gray-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
              ) : null}
            </div>

            {/* Video Description */}
            <div className="mb-8 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2 text-sm mb-2">
                <span className="text-white font-bold">{video.views?.toLocaleString() || 0} views</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">Published {formatDate(video.createdAt)}</span>
              </div>
              <p className="whitespace-pre-line text-gray-300">
                {video.description || 'No description available.'}
              </p>
            </div>

            {/* Comments Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Comments • {comments.length}</h2>
              </div>

              {/* Add Comment */}
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username} 
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-transparent border-b border-gray-700 focus:border-blue-500 focus:outline-none text-white py-2"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => setCommentText('')}
                        className="px-4 py-1 text-gray-400 hover:text-white mr-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className={`px-4 py-1 rounded-full ${commentText.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment._id} className="flex space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                        {comment.owner?.avatar ? (
                          <img 
                            src={comment.owner.avatar} 
                            alt={comment.owner.username} 
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold">
                            {comment.owner?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">
                              {comment.owner?.username || 'Unknown User'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{comment.content}</p>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 ml-2 text-xs text-gray-400">
                          <button className="flex items-center space-x-1 hover:text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            <span>{comment.likes || 0}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-white">
                            <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            <span>{comment.dislikes || 0}</span>
                          </button>
                          <button className="hover:text-white">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Related Videos */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Related Videos</h2>
            <div className="space-y-4">
              {relatedVideos.length > 0 ? (
                relatedVideos.map(relatedVideo => (
                  <div 
                    key={relatedVideo._id}
                    onClick={() => navigate(`/watch/${relatedVideo._id}`)}
                    className="flex space-x-2 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 w-40 h-24 bg-gray-700 rounded overflow-hidden relative">
                      <img 
                        src={relatedVideo.thumbnail} 
                        alt={relatedVideo.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                        {relatedVideo.duration || '0:00'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white line-clamp-2">
                        {relatedVideo.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {relatedVideo.owner?.username || 'Unknown User'}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span>{relatedVideo.views?.toLocaleString() || 0} views</span>
                        <span className="mx-1">•</span>
                        <span>{formatDate(relatedVideo.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">
                  No related videos found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tweet Modal */}
      {showTweetModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-white">Tweet this video</h2>
            <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-900 rounded-lg">
               <div className="h-16 w-24 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                  <img src={video?.thumbnail} alt={video?.title} className="h-full w-full object-cover" />
               </div>
               <div className="min-w-0">
                  <h3 className="text-sm font-medium text-white line-clamp-1">{video?.title}</h3>
                  <p className="text-xs text-gray-400">{video?.owner?.username}</p>
               </div>
            </div>
            
            <textarea
              value={tweetContent}
              onChange={(e) => setTweetContent(e.target.value)}
              placeholder="Write your review or thoughts..."
              className="w-full bg-gray-700 text-white rounded-lg p-3 min-h-[100px] border border-gray-600 focus:border-blue-500 focus:outline-none resize-none mb-4"
              autoFocus
            />
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowTweetModal(false);
                  setTweetContent('');
                }}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleTweetSubmit}
                disabled={!tweetContent.trim()}
                className={`px-4 py-2 rounded-full font-medium ${tweetContent.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
              >
                Tweet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watch;