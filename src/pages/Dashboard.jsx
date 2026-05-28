// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { 
  getDashboardStats, 
  getChannelAnalytics,
  getTopVideos
} from '../api/dashboard.api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatViews } from '../utils/formatViews';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [topVideos, setTopVideos] = useState([]);
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [statsData, analyticsData, topVideosData] = await Promise.all([
          getDashboardStats(timeRange),
          getChannelAnalytics(timeRange),
          getTopVideos(5)
        ]);
        
        setStats(statsData.data);
        setAnalytics(analyticsData.data || analyticsData); // Fallback if analytic is simplified
        setTopVideos(topVideosData.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-youtube-red"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!stats || !analytics) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>No dashboard data available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-youtube-dark-2 text-white border border-youtube-gray rounded px-3 py-1.5 text-sm"
          >
            <option value="24hours">Last 24 hours</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Views"
          value={formatViews(stats.totalViews)}
          change={stats.viewsChange}
        />
        <StatCard
          title="Watch Time"
          value={`${(stats.watchTime / 3600).toFixed(1)} hours`}
          change={stats.watchTimeChange}
        />
        <StatCard
          title="Subscribers"
          value={formatViews(stats.subscribers)}
          change={stats.subscribersChange}
        />
        <StatCard
          title="Videos"
          value={stats.videos}
          change={stats.videosChange}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-youtube-dark-2 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Views</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.viewsData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  tickFormatter={(value) => 
                    value >= 1000 ? `${value / 1000}k` : value
                  }
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937',
                    borderColor: '#374151',
                    color: '#F3F4F6'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="views"
                  name="Views"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-youtube-dark-2 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Engagement</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.engagementData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937',
                    borderColor: '#374151',
                    color: '#F3F4F6'
                  }}
                />
                <Legend />
                <Bar dataKey="likes" name="Likes" fill="#F59E0B" />
                <Bar dataKey="comments" name="Comments" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Videos */}
      <div className="bg-youtube-dark-2 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">Top Videos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-youtube-gray">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-youtube-text-secondary uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-youtube-text-secondary uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-youtube-text-secondary uppercase tracking-wider">
                  Watch Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-youtube-text-secondary uppercase tracking-wider">
                  Likes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-youtube-text-secondary uppercase tracking-wider">
                  Comments
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-youtube-gray">
              {topVideos.map((video) => (
                <tr key={video.id} className="hover:bg-youtube-gray/20">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-16 bg-youtube-gray rounded overflow-hidden">
                        <img
                          className="h-full w-full object-cover"
                          src={video.thumbnail}
                          alt={video.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white line-clamp-2">
                          {video.title}
                        </div>
                        <div className="text-sm text-youtube-text-secondary">
                          {video.views} views
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-youtube-text-secondary">
                    {formatViews(video.views)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-youtube-text-secondary">
                    {Math.floor(video.watchTime / 60)} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-youtube-text-secondary">
                    {formatViews(video.likes)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-youtube-text-secondary">
                    {formatViews(video.comments)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-youtube-dark-2 p-5 rounded-2xl border border-white/5 shadow-xl hover:border-red-600/20 transition-all group">
      <div className="flex flex-col">
        <p className="text-3xl font-black text-white group-hover:text-red-500 transition-colors leading-none tracking-tight">{value}</p>
        <p className="text-[10px] uppercase tracking-widest text-youtube-text-secondary font-bold mt-2 opacity-70">{title}</p>
        {change !== undefined && (
          <div className="mt-4 flex items-center">
             <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}
            >
              {isPositive ? '+' : '-'} {Math.abs(change)}%
            </span>
            <span className="text-[10px] text-gray-600 ml-2 font-medium uppercase tracking-tighter">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;