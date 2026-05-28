import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { toast } from 'react-hot-toast';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Mock data - replace with actual API call
        // const data = await searchVideos(query);
        
        const mockResults = [
          {
            _id: '1',
            title: `Search Result for: ${query}`,
            description: `This is a sample search result for "${query}"`,
            thumbnail: 'https://via.placeholder.com/320x180',
            views: 1000,
            duration: '10:30',
            createdAt: new Date(),
            user: {
              _id: '1',
              username: 'channel1',
              avatar: 'https://ui-avatars.com/api/?name=Channel+1'
            }
          },
          {
            _id: '2',
            title: `Another Result: ${query}`,
            description: `Another sample result for "${query}"`,
            thumbnail: 'https://via.placeholder.com/320x180',
            views: 500,
            duration: '5:45',
            createdAt: new Date(Date.now() - 86400000),
            user: {
              _id: '2',
              username: 'channel2',
              avatar: 'https://ui-avatars.com/api/?name=Channel+2'
            }
          }
        ];
        
        setResults(mockResults);
      } catch (error) {
        console.error('Error fetching search results:', error);
        toast.error('Failed to load search results');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Searching...</div>;
  }

  if (!query) {
    return <div className="container mx-auto px-4 py-8">Enter a search query</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Results for: {query}</h1>
      
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No results found for "{query}"</p>
          <p className="text-gray-400 mt-2">Try different keywords or check back later for new content.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
