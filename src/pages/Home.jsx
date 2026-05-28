// frontend/src/pages/Home.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import VideoCard from '../components/VideoCard';
import { axiosInstance as axios } from '../api/axiosInstance';
import { Loader2 } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef();
  const lastVideoElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const categories = ['All', 'Music', 'Gaming', 'News', 'Movies', 'Educational', 'Live'];

  const fetchVideos = async (pageNum, category, isNewCategory = false) => {
    try {
      setLoading(true);
      const response = await axios.get('/videos', {
         params: { 
           category: category === 'All' ? undefined : category,
           page: pageNum,
           limit: 12
         }
      });
      
      const newVideos = response.data.data?.videos || [];
      const total = response.data.data?.totalVideos || 0;
      
      setVideos(prev => {
        const allVideos = isNewCategory ? newVideos : [...prev, ...newVideos];
        setHasMore(allVideos.length < total);
        return allVideos;
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos.');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Reset and fetch when category changes
  useEffect(() => {
    setPage(1);
    setVideos([]);
    setHasMore(true);
    setInitialLoading(true);
    fetchVideos(1, activeCategory, true);
  }, [activeCategory]);

  // Fetch more when page changes (but not on first page which is handled by category effect)
  useEffect(() => {
    if (page > 1) {
      fetchVideos(page, activeCategory);
    }
  }, [page]);

  if (initialLoading && videos.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <div key={cat} className="px-4 py-1.5 rounded-lg bg-youtube-gray/20 w-20 h-8 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2 animate-pulse">
              <div className="aspect-video bg-youtube-gray/20 rounded-xl" />
              <div className="flex gap-3 mt-1">
                <div className="w-9 h-9 rounded-full bg-youtube-gray/20" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-youtube-gray/20 rounded w-3/4" />
                  <div className="h-3 bg-youtube-gray/20 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide sticky top-0 bg-youtube-dark z-20 py-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === category
                ? 'bg-white text-black'
                : 'bg-youtube-gray/20 text-white hover:bg-youtube-gray/40'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {error && videos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            className="px-6 py-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
            onClick={() => fetchVideos(1, activeCategory, true)}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {videos.map((video, index) => {
              if (videos.length === index + 1) {
                return (
                  <div ref={lastVideoElementRef} key={video._id}>
                    <VideoCard video={video} />
                  </div>
                );
              } else {
                return <VideoCard key={video._id} video={video} />;
              }
            })}
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
          )}

          {!hasMore && videos.length > 0 && (
            <div className="text-center py-10 text-gray-500">
              <p>You've reached the end of the feed.</p>
            </div>
          )}

          {videos.length === 0 && !loading && (
            <div className="text-center py-20">
              <p className="text-gray-400">No videos found in this category.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
