import React, { useState, useEffect } from 'react';
import { axiosInstance as axios } from '../api/axiosInstance';
import { Bell, Check, Trash2, Video, MessageCircle, UserPlus, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/notifications');
            setNotifications(response.data.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await axios.patch(`/notifications/mark-as-read/${id}`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            toast.error('Failed to update notification');
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.patch('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to update notifications');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'like': return <Heart className="w-5 h-5 text-red-500 fill-current" />;
            case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500" />;
            case 'subscription': return <UserPlus className="w-5 h-5 text-green-500" />;
            case 'video': return <Video className="w-5 h-5 text-purple-500" />;
            default: return <Bell className="w-5 h-5 text-white" />;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
                <p className="text-gray-400">Loading notifications...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Bell className="w-8 h-8 text-white" />
                    <h1 className="text-3xl font-bold">Notifications</h1>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        <Check className="w-4 h-4" />
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="bg-youtube-dark-2 rounded-2xl p-12 text-center border border-white/5 shadow-xl">
                    <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bell className="w-10 h-10 text-gray-500" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No notifications yet</h2>
                    <p className="text-gray-400">When people interact with your content, you'll see them here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                                !notification.isRead 
                                ? 'bg-white/5 border-white/10 shadow-lg' 
                                : 'bg-transparent border-white/5 opacity-80'
                            }`}
                        >
                            <div className="flex-shrink-0 mt-1">
                                {getIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <img 
                                            src={notification.sender?.avatar || `https://ui-avatars.com/api/?name=${notification.sender?.username}&background=random`} 
                                            alt={notification.sender?.username}
                                            className="w-6 h-6 rounded-full object-cover"
                                        />
                                        <p className="text-sm font-medium">
                                            <span className="text-white hover:text-blue-400 cursor-pointer">{notification.sender?.username}</span>
                                            <span className="text-gray-400 ml-1">
                                                {notification.type === 'like' ? 'liked your video' : 
                                                 notification.type === 'comment' ? 'commented on your video' :
                                                 notification.type === 'subscription' ? 'subscribed to you' :
                                                 notification.type === 'video' ? 'uploaded a new video' : ''}
                                            </span>
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                
                                <p className="text-gray-300 text-sm mb-3">
                                    {notification.content}
                                </p>

                                {notification.video && (
                                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-2 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer max-w-sm">
                                        <img 
                                            src={notification.video.thumbnail} 
                                            alt={notification.video.title}
                                            className="w-20 h-12 object-cover rounded"
                                        />
                                        <p className="text-xs font-medium text-gray-200 line-clamp-2">
                                            {notification.video.title}
                                        </p>
                                    </div>
                                )}

                                {!notification.isRead && (
                                    <button
                                        onClick={() => markAsRead(notification._id)}
                                        className="mt-3 text-xs text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                        Mark as read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
