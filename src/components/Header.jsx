import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, Bell, Video, LogOut, Settings, HelpCircle, Radio } from 'lucide-react';
import { axiosInstance as axios } from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
     const fetchUnreadCount = async () => {
         if (!user) return;
         try {
             const response = await axios.get('/notifications');
             const unread = (response.data.data || []).filter(n => !n.isRead).length;
             setUnreadCount(unread);
         } catch (error) {
             console.error('Error fetching count:', error);
         }
     };

     fetchUnreadCount();
     const interval = setInterval(fetchUnreadCount, 30000);
     return () => clearInterval(interval);
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/results?search_query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className="bg-youtube-dark-2 sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-youtube-gray/20">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/10 rounded-full transition-colors hidden lg:block"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/10 rounded-full transition-colors lg:hidden"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
        
        <Link to="/" className="flex items-center gap-1 group">
          <div className="bg-red-600 rounded-lg p-1 group-hover:scale-110 transition-transform">
            <Video className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="text-xl font-bold text-white tracking-tighter hidden sm:block">Streamify</span>
        </Link>
      </div>
      <div className="hidden md:flex flex-1 max-w-[600px] items-center justify-center">
        <form onSubmit={handleSearch} className="flex w-full max-w-[500px]">
          <div className="flex w-full items-center bg-[#121212] border border-[#303030] rounded-l-full overflow-hidden focus-within:border-blue-500">
            <div className={`pl-4 ${!searchQuery && 'hidden'}`}>
               <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent text-white px-4 py-2 outline-none placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-[#222222] border border-l-0 border-[#303030] px-5 py-2 rounded-r-full hover:bg-[#303030] transition-colors"
          >
            <Search className="w-5 h-5 text-gray-400" />
          </button>
        </form>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/upload" className="hidden md:flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-full transition-colors">
            <Video className="w-6 h-6 text-white" />
        </Link>
        
        <Link to="/go-live" className="hidden md:flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-full transition-colors">
            <Radio className="w-6 h-6 text-red-500" />
        </Link>
        
        <Link to="/notifications" className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
          <Bell className="w-6 h-6 text-white" />
          {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-600 text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
              </span>
          )}
        </Link>

        {user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full overflow-hidden border border-transparent focus:border-blue-500"
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                alt="User"
                className="w-full h-full object-cover"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#282828] rounded-xl shadow-2xl py-2 border border-white/10 z-50">
                <div className="px-4 py-3 border-b border-white/10 mb-2">
                  <div className="flex items-center gap-3">
                    <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                        alt="User"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <p className="font-medium text-white">{user.username}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <Link to={`/c/${user.username}`} className="mt-3 block text-blue-400 text-sm hover:underline">
                    View your channel
                  </Link>
                </div>

                <div className="py-2">
                  <Link to="/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-gray-200 text-sm">
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                  <Link to="/help" className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-gray-200 text-sm">
                    <HelpCircle className="w-5 h-5" />
                    Help & Feedback
                  </Link>
                   <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-gray-200 text-sm text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-1.5 border border-white/20 rounded-full hover:bg-blue-500/10 hover:border-blue-500 text-blue-400 font-medium transition-colors"
          >
            <User className="w-5 h-5" />
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
