import React from 'react';
import { Link } from 'react-router-dom';

const ChannelCard = ({ channel }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/c/${channel.username}`} className="block">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <img
              src={channel.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name || channel.username)}`}
              alt={channel.name || channel.username}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {channel.name || channel.username}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{channel.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {channel.subscribers?.toLocaleString() || 0} subscribers
              </p>
            </div>
          </div>
          {channel.isSubscribed !== undefined && (
            <button
              className={`mt-3 w-full py-1 px-3 rounded-full text-sm font-medium ${
                channel.isSubscribed
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ChannelCard;
