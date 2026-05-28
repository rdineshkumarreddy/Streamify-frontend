// src/pages/Upload.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadVideo } from '../api/video.api';
import Button from '../components/Button';

const Upload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0]);
    }
  };

  const handleVideoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !videoFile) {
      setError('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }
    formData.append('video', videoFile);

    try {
      setIsUploading(true);
      setError(null);
      
      const video = await uploadVideo(formData);
      navigate(`/watch/${video.id}`);
    } catch (err) {
      console.error('Error uploading video:', err);
      setError('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Upload Video</h1>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Video
          </label>
          <div className="border-2 border-dashed border-youtube-gray rounded-lg p-8 text-center">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
              id="video-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="video-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-youtube-red hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              Select Video
            </label>
            <p className="mt-2 text-sm text-youtube-text-secondary">
              {videoFile ? videoFile.name : 'or drag and drop a file'}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-youtube-dark-2 border border-youtube-gray rounded-md text-white focus:outline-none focus:ring-2 focus:ring-youtube-red focus:border-transparent"
            placeholder="Add a title that describes your video"
            disabled={isUploading}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="w-full px-4 py-2 bg-youtube-dark-2 border border-youtube-gray rounded-md text-white focus:outline-none focus:ring-2 focus:ring-youtube-red focus:border-transparent"
            placeholder="Tell viewers about your video"
            disabled={isUploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Thumbnail
          </label>
          <div className="border-2 border-dashed border-youtube-gray rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
              id="thumbnail-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="thumbnail-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-youtube-gray hover:bg-youtube-light-gray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Select Thumbnail
            </label>
            <p className="mt-2 text-sm text-youtube-text-secondary">
              {thumbnail ? thumbnail.name : 'Upload a custom thumbnail (optional)'}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isUploading || !title || !videoFile}
            isLoading={isUploading}
          >
            Upload
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Upload;