import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Camera, Mic, MicOff, VideoOff, X, Users, Heart, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { axiosInstance as axios } from '../api/axiosInstance';

const GoLive = () => {
  const [stream, setStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [isLive, setIsLive] = useState(false);
  const [isStreamEnded, setIsStreamEnded] = useState(false);
  const [liveStreamId, setLiveStreamId] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [likes, setLikes] = useState(0);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const requestPermissions = async () => {
    setIsLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setStream(mediaStream);
      setPermissionGranted(true);
      

      toast.success('Camera and microphone access granted!');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Camera/microphone access denied. Please allow permissions in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera or microphone found on your device.');
      } else {
        toast.error('Failed to access camera/microphone. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleGoLive = async () => {
    if (!streamTitle.trim()) {
      toast.error('Please enter a stream title');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(
        '/livestreams/create',
        {
          title: streamTitle,
          description: streamDescription,
          category,
        }
      );

      setLiveStreamId(data.data._id);
      setIsLive(true);
      toast.success('You are now live! 🔴');

      // Fetch actual viewer count from backend instead of random simulation
      const viewerInterval = setInterval(async () => {
        try {
          const streamData = await axios.get(`/livestreams/${data.data._id}`);
          if (streamData.data?.data) {
            setViewerCount(streamData.data.data.viewerCount || 0);
            setLikes(streamData.data.data.likes || 0);
          }
        } catch (err) {
          console.error("Failed to fetch stream stats");
        }
      }, 5000);

      // Store interval ID for cleanup
      window.viewerInterval = viewerInterval;

    } catch (error) {
      console.error('Error starting stream:', error);
      toast.error(error.response?.data?.message || 'Failed to start stream');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndStream = async () => {
    if (!liveStreamId) return;

    try {
      await axios.post(
        `/livestreams/${liveStreamId}/end`,
        {}
      );

      // Clear viewer interval
      if (window.viewerInterval) {
        clearInterval(window.viewerInterval);
      }

      // Stop media tracks
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      toast.success('Stream ended successfully');
      setIsLive(false);
      setIsStreamEnded(true);
      // navigate('/dashboard'); // Removed redirect to dashboard
    } catch (error) {
      console.error('Error ending stream:', error);
      toast.error('Failed to end stream');
    }
  };

  const handleCancel = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (window.viewerInterval) {
      clearInterval(window.viewerInterval);
    }
    navigate(-1);
  };

  const categories = [
    'General',
    'Gaming',
    'Music',
    'Education',
    'Entertainment',
    'Sports',
    'Technology',
    'Cooking',
    'Art',
    'Talk Show',
  ];

  if (isStreamEnded) {
    return (
      <div className="min-h-screen bg-youtube-dark-1 text-white p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-youtube-dark-2 p-8 rounded-xl border border-white/10 text-center space-y-6">
           <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto">
             <Radio className="w-10 h-10 text-red-500" />
           </div>
           
           <h2 className="text-3xl font-bold">Stream Ended</h2>
           <p className="text-gray-400">Your live stream has ended successfully.</p>
           
           <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/10">
             <div className="text-center">
               <p className="text-2xl font-bold">{viewerCount}</p>
               <p className="text-sm text-gray-400">Peak Viewers</p>
             </div>
             <div className="text-center">
               <p className="text-2xl font-bold">{likes}</p>
               <p className="text-sm text-gray-400">Total Likes</p>
             </div>
           </div>

           <div className="space-y-3">
             <button 
               onClick={() => navigate('/')}
               className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors"
             >
               Go to Home
             </button>
             <button 
               onClick={() => window.location.reload()}
               className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
             >
               Start New Stream
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-youtube-dark-1 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Radio className={`w-8 h-8 ${isLive ? 'text-red-500 animate-pulse' : 'text-red-500'}`} />
            {isLive ? 'Live Now' : 'Go Live'}
          </h1>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLive && (
          <div className="mb-6 bg-red-600/20 border border-red-500 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="font-semibold">LIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{viewerCount} viewers</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span>{likes} likes</span>
              </div>
            </div>
            <button
              onClick={handleEndStream}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              End Stream
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Preview - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-youtube-dark-2 rounded-xl overflow-hidden border border-white/10">
              <div className="aspect-video bg-black relative">
                {permissionGranted ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!isVideoEnabled && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <VideoOff className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                    {isLive && (
                      <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-md flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="font-semibold text-sm">LIVE</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
                    <Camera className="w-20 h-20 text-gray-600" />
                    <p className="text-gray-400 text-center">
                      Click the button below to enable your camera and microphone
                    </p>
                  </div>
                )}
              </div>

              {/* Controls */}
              {permissionGranted && (
                <div className="p-4 flex items-center justify-center gap-4 bg-youtube-dark-3">
                  <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-full transition-colors ${
                      isVideoEnabled
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isVideoEnabled ? (
                      <Camera className="w-6 h-6" />
                    ) : (
                      <VideoOff className="w-6 h-6" />
                    )}
                  </button>

                  <button
                    onClick={toggleAudio}
                    className={`p-3 rounded-full transition-colors ${
                      isAudioEnabled
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isAudioEnabled ? (
                      <Mic className="w-6 h-6" />
                    ) : (
                      <MicOff className="w-6 h-6" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {!permissionGranted && !isLive && (
              <button
                onClick={requestPermissions}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Requesting permissions...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Enable Camera & Microphone
                  </>
                )}
              </button>
            )}
          </div>

          {/* Stream Details - Takes 1 column */}
          <div className="space-y-4">
            {!isLive && (
              <div className="bg-youtube-dark-2 rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">Stream Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Stream Title *
                    </label>
                    <input
                      type="text"
                      value={streamTitle}
                      onChange={(e) => setStreamTitle(e.target.value)}
                      placeholder="Enter your stream title"
                      className="w-full bg-youtube-dark-3 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                      maxLength={100}
                      disabled={isLive}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {streamTitle.length}/100 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-youtube-dark-3 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      disabled={isLive}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Description
                    </label>
                    <textarea
                      value={streamDescription}
                      onChange={(e) => setStreamDescription(e.target.value)}
                      placeholder="Tell viewers what your stream is about"
                      rows={4}
                      className="w-full bg-youtube-dark-3 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      maxLength={500}
                      disabled={isLive}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {streamDescription.length}/500 characters
                    </p>
                  </div>

                  <button
                    onClick={handleGoLive}
                    disabled={!permissionGranted || !streamTitle.trim() || isLoading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Radio className="w-6 h-6" />
                        Go Live
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    By going live, you agree to follow our Community Guidelines
                  </p>
                </div>
              </div>
            )}

            {/* Stream Info when live */}
            {isLive && (
              <div className="bg-youtube-dark-2 rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">{streamTitle}</h2>
                <div className="space-y-3 text-sm text-gray-400">
                  <p><span className="text-gray-300">Category:</span> {category}</p>
                  {streamDescription && (
                    <p><span className="text-gray-300">Description:</span> {streamDescription}</p>
                  )}
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-gray-300 mb-2">Stream Stats:</p>
                    <ul className="space-y-1">
                      <li>• Peak viewers: {viewerCount}</li>
                      <li>• Total likes: {likes}</li>
                      <li>• Quality: 720p @ 30fps</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-youtube-dark-2 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold mb-3">
                {isLive ? 'Streaming Tips' : 'Tips for a great stream'}
              </h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>✓ Ensure good lighting for better video quality</li>
                <li>✓ Use a stable internet connection</li>
                <li>✓ Test your audio before going live</li>
                <li>✓ Engage with your viewers in real-time</li>
                {isLive && (
                  <>
                    <li>✓ Monitor your viewer count</li>
                    <li>✓ Respond to chat messages</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoLive;
