// src/components/Sidebar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, History, Clock, ThumbsUp, Bookmark, Settings, LogOut, MessageSquare, Bell, Video, Radio } from 'lucide-react';
import { axiosInstance as axios } from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [subscriptions, setSubscriptions] = useState([]);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveTab('home');
    else if (path.startsWith('/feed/trending')) setActiveTab('trending');
    else if (path.startsWith('/feed/history')) setActiveTab('history');
    else if (path.startsWith('/feed/liked')) setActiveTab('liked');
    else if (path.startsWith('/playlist')) setActiveTab('playlists');
    else if (path.startsWith('/tweets')) setActiveTab('tweets');
    else if (path.startsWith('/notifications')) setActiveTab('notifications');
  }, [location]);

  useEffect(() => {
      const fetchSubscriptions = async () => {
          if (!user) return;
          try {
              const response = await axios.get(`/subscriptions/user/${user._id}`);
              setSubscriptions(response.data.data || []);
          } catch (error) {
              console.error('Error fetching subscriptions:', error);
          }
      };

      fetchSubscriptions();
  }, [user]);

  const sidebarItems = [
    { icon: Home, label: 'Home', path: '/', tab: 'home' },
    { icon: Radio, label: 'Live', path: '/live', tab: 'live' },
    { icon: Compass, label: 'Explore', path: '/feed/trending', tab: 'trending' },
    { icon: Bell, label: 'Notifications', path: '/notifications', tab: 'notifications' },
    { icon: MessageSquare, label: 'Tweets', path: '/tweets', tab: 'tweets' },
    { icon: History, label: 'History', path: '/feed/history', tab: 'history' },
    { icon: Clock, label: 'Watch Later', path: '/playlist/watch-later', tab: 'watch-later' },
    { icon: ThumbsUp, label: 'Liked Videos', path: '/feed/liked', tab: 'liked' },
    { icon: Bookmark, label: 'Playlists', path: '/playlists', tab: 'playlists' },
  ];

  return (
    <>
      {/* Overlay for mobile (hidden on lg) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-youtube-dark-2 z-50 transform transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'
        } lg:relative lg:translate-x-0 ${!isOpen ? 'lg:w-0 lg:overflow-hidden' : 'lg:w-64'}`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 pl-6 border-b border-white/5 mb-2">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-xl font-bold text-white tracking-tighter group-hover:text-red-500 transition-colors">Streamify</span>
              <div className="bg-red-600 rounded-lg p-1 group-hover:scale-110 transition-transform">
                 <Video className="w-4 h-4 text-white fill-current" />
              </div>
            </Link>
          </div>
          
          <nav className="flex-1 overflow-y-auto scrollbar-none">
            <div className="space-y-1 px-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === item.tab
                      ? 'bg-youtube-gray/30 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-4 ${activeTab === item.tab ? 'text-red-500' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-white/5 my-4 mx-4"></div>

            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 px-2">
                Subscriptions
              </h3>
              
              <div className="space-y-1">
                  {subscriptions.length > 0 ? (
                    subscriptions.map((sub) => (
                      <Link
                        key={sub._id}
                        to={`/c/${sub.channel?.username}`}
                        className="flex items-center px-2 py-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-white/10 transition-colors group"
                      >
                        <img 
                            src={sub.channel?.avatar || `https://ui-avatars.com/api/?name=${sub.channel?.username}&background=random`} 
                            alt={sub.channel?.username}
                            className="w-6 h-6 rounded-full mr-4 object-cover"
                        />
                        <span className="truncate group-hover:text-white transition-colors">{sub.channel?.username}</span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 px-2 italic">No subscriptions yet</p>
                  )}
              </div>
            </div>
          </nav>

          <div className="p-4 border-t border-white/5">
            <button
              onClick={logout}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;