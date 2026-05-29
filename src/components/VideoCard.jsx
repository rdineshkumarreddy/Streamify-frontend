import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { formatViews } from '../utils/formatViews';
import { MoreVertical, Trash2, Edit2, Play, Share2, Copy, Facebook, Linkedin, Twitter, MessageCircle, X, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { axiosInstance as axios } from '../api/axiosInstance';
import { toggleWatchLater } from '../api/playlist.api';

const ShareModal = ({ isOpen, onClose, videoId, videoTitle }) => {
  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/watch/${videoId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const socialPlatforms = [
    { name: 'WhatsApp', icon: <MessageCircle className="w-5 h-5 text-green-500" />, url: `https://wa.me/?text=Check out this video: ${encodeURIComponent(videoTitle)} ${shareUrl}` },
    { name: 'X', icon: <Twitter className="w-5 h-5 text-sky-400" />, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(videoTitle)}&url=${shareUrl}` },
    { name: 'Facebook', icon: <Facebook className="w-5 h-5 text-blue-600" />, url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
    { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5 text-blue-700" />, url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#212121] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Share</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {socialPlatforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 min-w-[72px] group"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
                {platform.icon}
              </div>
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{platform.name}</span>
            </a>
          ))}
        </div>

        <div className="relative">
          <input
            readOnly
            value={shareUrl}
            className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 pr-24 text-sm text-gray-300 focus:outline-none"
          />
          <button
            onClick={copyToClipboard}
            className="absolute right-2 top-1.5 bottom-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

const VideoCard = ({ video, onDeleteSuccess }) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  
  if (!video) return null;

  const {
    _id,
    title,
    thumbnail,
    duration,
    views = 0,
    createdAt,
    owner
  } = video;

  const isOwner = user?._id === owner?._id || user?._id === owner;

  const handleWatchLater = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
        toast.error("Please login to use Watch Later");
        return;
    }

    try {
      const response = await toggleWatchLater(_id);
      if (response.data.added) {
        toast.success("Added to Watch Later");
      } else {
        toast.success("Removed from Watch Later");
      }
      setShowMenu(false);
    } catch (error) {
      console.error("Watch Later error:", error);
      toast.error("Failed to update Watch Later");
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      await axios.delete(`/videos/${_id}`);
      toast.success("Video deleted successfully");
      if (onDeleteSuccess) onDeleteSuccess(_id);
      else window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete video");
    }
  };

  const formattedDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeAgo = createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : '';

  return (
    <div className="flex flex-col gap-2 group cursor-pointer relative" onMouseLeave={() => setShowMenu(false)}>
      <Link to={`/watch/${_id}`} className="relative aspect-video rounded-xl overflow-hidden bg-youtube-dark-3 shadow-lg group-hover:shadow-red-600/10 transition-all duration-300">
        <img
          src={thumbnail || 'https://via.placeholder.com/640x360'}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/640x360';
          }}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                <Play className="w-6 h-6 text-white fill-current" />
            </div>
        </div>
        {duration > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-bold backdrop-blur-sm border border-white/10">
            {formattedDuration(duration)}
          </div>
        )}
      </Link>
      
      <div className="flex gap-3 items-start mt-2">
        <Link to={`/c/${owner?.username}`} className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shadow-md">
             <img
              src={owner?.avatar || `https://ui-avatars.com/api/?name=${owner?.username || 'User'}&background=random`}
              alt={owner?.username}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
        
        <div className="flex-1 min-w-0 pr-6">
          <Link to={`/watch/${_id}`} className="text-white font-semibold line-clamp-2 leading-tight group-hover:text-red-500 transition-colors" title={title}>
            {title}
          </Link>
          <Link to={`/c/${owner?.username}`} className="text-youtube-text-secondary text-sm mt-1 hover:text-white transition-colors truncate block">
            {owner?.username || 'Unknown Channel'}
          </Link>
          <div className="text-youtube-text-secondary text-[13px] mt-1 flex items-center gap-1.5 leading-tight">
            <span className="truncate">{formatViews(views)} views</span>
            <span className="flex-shrink-0 opacity-50">•</span>
            <span className="truncate">{timeAgo}</span>
          </div>
        </div>

        <div className="absolute right-0 top-[calc(100%-60px)] md:relative md:top-0">
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                }}
                className={`p-1.5 rounded-full transition-colors ${showMenu ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
            >
                <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-[#282828] border border-white/10 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in duration-200">
                    <button 
                        onClick={handleWatchLater}
                        className="w-full px-4 py-2.5 text-sm text-left text-gray-200 hover:bg-white/5 flex items-center gap-3"
                    >
                        <Clock className="w-4 h-4 text-blue-400" />
                        Save to Watch Later
                    </button>
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsShareOpen(true);
                            setShowMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-sm text-left text-gray-200 hover:bg-white/5 flex items-center gap-3"
                    >
                        <Share2 className="w-4 h-4 text-green-400" />
                        Share Video
                    </button>
                    {isOwner ? (
                        <>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toast("Edit feature coming soon!");
                                }}
                                className="w-full px-4 py-2.5 text-sm text-left text-gray-200 hover:bg-white/5 flex items-center gap-3"
                            >
                                <Edit2 className="w-4 h-4 text-blue-400" />
                                Edit Video
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="w-full px-4 py-2.5 text-sm text-left text-red-400 hover:bg-red-500/10 flex items-center gap-3"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Video
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="w-full px-4 py-2.5 text-sm text-left text-gray-200 hover:bg-white/5 flex items-center gap-3">
                                <Play className="w-4 h-4 text-red-500" />
                                Play Next
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
      </div>
      
      <ShareModal 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        videoId={_id} 
        videoTitle={title} 
      />
    </div>
  );
};

export default VideoCard;
