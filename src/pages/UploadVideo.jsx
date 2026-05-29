// frontend/src/pages/UploadVideo.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { axiosInstance as axios } from '../api/axiosInstance';

const FileUploadArea = ({ 
  name, 
  label, 
  required, 
  accept, 
  fileType,
  dragActive,
  onDrag,
  onDrop,
  onChange,
  formData,
  onClear
}) => (
  <div>
    <label className="block text-sm font-medium mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div 
      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${dragActive[name] ? 'border-blue-500 bg-blue-900/10' : 'border-gray-700'} border-dashed rounded-md transition-colors`}
      onDragEnter={(e) => onDrag(name, e)}
      onDragOver={(e) => onDrag(name, e)}
      onDragLeave={(e) => onDrag(name, e)}
      onDrop={(e) => onDrop(name, e)}
    >
      <div className="space-y-1 text-center">
        <div className="flex flex-col items-center text-sm text-gray-400">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex mt-2">
            <label className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-blue-500 hover:text-blue-400">
              <span>Upload a file</span>
              <input
                name={name}
                type="file"
                className="sr-only"
                accept={accept}
                onChange={onChange}
                // Removed required attribute to rely on state validation
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {fileType} up to {name === 'videoFile' ? '500MB' : '10MB'}
          </p>
        </div>
        {formData[name] && (
          <p className="text-sm text-green-500 truncate max-w-xs transition-all">
            {formData[name].name}
            <button
              type="button"
              onClick={(e) => {
                 e.stopPropagation();
                 onClear(name);
              }}
              className="ml-2 text-red-500 hover:text-red-400"
            >
              ×
            </button>
          </p>
        )}
      </div>
    </div>
  </div>
);

const UploadVideo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'All',
    videoFile: null,
    thumbnail: null,
  });
  const [dragActive, setDragActive] = useState({
    video: false,
    thumbnail: false
  });

  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [aiThumbPreview, setAiThumbPreview] = useState(null);
  const [aiGeneratedUrl, setAiGeneratedUrl] = useState(null);

  const generateAIDescription = () => {
    if (!formData.title) {
        toast.error("Please enter a title first!");
        return;
    }
    setIsGeneratingDesc(true);
    
    // Simulate smart AI generation
    const templates = [
        `Welcome back! In this video, we dive deep into "${formData.title}". We'll explore the key concepts, tips, and tricks to help you master it. \n\nDon't forget to like, subscribe, and hit the notification bell for more content like this!`,
        `Check out our latest video on "${formData.title}"! We've put a lot of research into this topic to bring you the best value. \n\nTimestamps:\n0:00 Intro\n1:20 Deep Dive\n5:45 Final Thoughts`,
        `Ever wondered about "${formData.title}"? This video covers everything you need to know to get started and succeed. \n\nSupport us on Patreon and follow our socials in the link below!`
    ];
    
    setTimeout(() => {
        const randomDesc = templates[Math.floor(Math.random() * templates.length)];
        setFormData(prev => ({ ...prev, description: randomDesc }));
        setIsGeneratingDesc(false);
        toast.success("AI Description generated!");
    }, 800);
  };

  const generateAIThumbnail = async () => {
    if (!formData.title) {
        toast.error("Please enter a title first!");
        return;
    }
    setIsGeneratingThumb(true);
    setImageError(false);
    try {
        // Absolute minimum clean-up for maximum reliability
        const cleanTitle = formData.title.replace(/[^a-zA-Z0-9]/g, " ").trim().substring(0, 30);
        const promptText = encodeURIComponent(`${cleanTitle} poster style digital art`);
        
        // Using the robust image.pollinations.ai endpoint with Flux model for better quality
        const seed = Math.floor(Math.random() * 1000000);
        const imageUrl = `https://image.pollinations.ai/prompt/${promptText}?width=1280&height=720&seed=${seed}&nologo=true&model=flux`;
        
        setAiGeneratedUrl(imageUrl);
        setAiThumbPreview(imageUrl);
        setIsImageLoading(true);
        
        setIsGeneratingThumb(false);
        toast.success("AI is starting to paint...");
    } catch (error) {
        console.error("AI Thumbnail error:", error);
        toast.error("AI service is busy. Please try again or upload manually.");
        setIsGeneratingThumb(false);
    }
  };

  const handleDrag = (field, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(prev => ({ ...prev, [field]: true }));
    } else if (e.type === 'dragleave') {
      setDragActive(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleDrop = (field, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [field]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (field === 'videoFile' && !file.type.startsWith('video/')) {
        toast.error('Please upload a valid video file');
        return;
      }
      if (field === 'thumbnail' && !file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
      if (field === 'thumbnail') {
          setAiThumbPreview(URL.createObjectURL(file));
          setAiGeneratedUrl(null); // Manual upload overrides AI
      }
    }
  };

  const handleChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      if (name === 'thumbnail') {
          setAiThumbPreview(URL.createObjectURL(files[0]));
          setAiGeneratedUrl(null); // Manual upload overrides AI
      }
    } else {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleClear = (name) => {
    setFormData(prev => ({ ...prev, [name]: null }));
    if (name === 'thumbnail') {
        setAiThumbPreview(null);
        setAiGeneratedUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.videoFile) {
      toast.error('Please fill in all required fields');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('videoFile', formData.videoFile);
    
    if (formData.thumbnail) {
      data.append('thumbnail', formData.thumbnail);
    } else if (aiGeneratedUrl) {
      // Send the AI URL to the backend if no file was uploaded
      data.append('thumbnailUrl', aiGeneratedUrl);
    }

    try {
      setLoading(true);
      const response = await axios.post('/videos/publishAVideo', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      toast.success('Video uploaded successfully!');
      navigate('/');
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error?.message || 
                         'Failed to upload video. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Upload Video</h1>
            <p className="text-gray-400 mt-2">Share your video with the world</p>
          </div>
          <div className="hidden md:block">
              <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span className="text-sm font-medium text-blue-400">AI Features Enabled</span>
              </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-white/5">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span>Video Details</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                  placeholder="Add a title that describes your video"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">
                    Description <span className="text-red-500">*</span>
                    </label>
                    <button
                        type="button"
                        onClick={generateAIDescription}
                        disabled={isGeneratingDesc || !formData.title}
                        className="text-xs flex items-center gap-1.5 px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full hover:bg-blue-600/40 transition-all font-semibold disabled:opacity-30"
                    >
                        {isGeneratingDesc ? (
                            <span className="animate-pulse">Generating...</span>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                                Magic Rewrite
                            </>
                        )}
                    </button>
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                  placeholder="Tell viewers about your video"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium mb-4">
                  Select Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { id: 'All', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg> },
                    { id: 'Music', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> },
                    { id: 'Gaming', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="15.5" cy="10.5" r=".5"/><circle cx="17.5" cy="12.5" r=".5"/></svg> },
                    { id: 'News', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg> },
                    { id: 'Movies', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 12h4"/><path d="M3 17h4"/><path d="M17 7h4"/><path d="M17 12h4"/><path d="M17 17h4"/></svg> },
                    { id: 'Educational', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
                    { id: 'Live', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4"/><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/></svg> }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 gap-2 ${
                        formData.category === cat.id 
                        ? 'border-blue-500 bg-blue-600/10 text-blue-400 ring-2 ring-blue-500/20' 
                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      {cat.icon}
                      <span className="text-xs font-semibold">{cat.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-white/5">
            <h2 className="text-xl font-semibold mb-6">Upload Video</h2>
            <FileUploadArea 
              name="videoFile"
              label="Video File"
              required={true}
              accept="video/*"
              fileType="MP4, WebM, or MOV"
              dragActive={dragActive}
              onDrag={handleDrag}
              onDrop={handleDrop}
              onChange={handleChange}
              formData={formData}
              onClear={handleClear}
            />
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-white/5">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Thumbnail (Optional)</h2>
                <button
                    type="button"
                    onClick={generateAIThumbnail}
                    disabled={isGeneratingThumb || !formData.title}
                    className="text-xs flex items-center gap-1.5 px-4 py-1.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-full hover:bg-purple-600/40 transition-all font-bold disabled:opacity-30"
                >
                    {isGeneratingThumb ? (
                        <span className="animate-pulse">Imagining...</span>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                            AI Generate
                        </>
                    )}
                </button>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Select or upload a picture that shows what's in your video. A good thumbnail stands out and draws viewers' attention.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUploadArea 
                name="thumbnail"
                label="Manual Upload"
                required={false}
                accept="image/*"
                fileType="JPG, PNG, or GIF"
                dragActive={dragActive}
                onDrag={handleDrag}
                onDrop={handleDrop}
                onChange={handleChange}
                formData={formData}
                onClear={handleClear}
                />
                
                <div className="border-2 border-gray-700 border-dashed rounded-lg flex flex-col items-center justify-center p-4 bg-gray-900/20 relative min-h-[190px] overflow-hidden">
                    {aiThumbPreview ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            {isImageLoading && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm">
                                    <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-2"></div>
                                    <p className="text-[10px] text-purple-400 font-bold animate-pulse">AI IS PAINTING...</p>
                                </div>
                            )}

                            {imageError ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-4">
                                    <div className="bg-red-500/10 p-3 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    </div>
                                    <p className="text-xs text-center text-gray-400">Connection timed out. <br/>AI server is a bit sleepy.</p>
                                    <button 
                                        type="button" 
                                        onClick={generateAIThumbnail}
                                        className="text-[11px] bg-red-600/20 hover:bg-red-600/40 text-red-500 px-4 py-1.5 rounded-full border border-red-500/30 transition-all font-bold"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <img 
                                        src={aiThumbPreview} 
                                        className={`w-full aspect-video rounded-md object-cover brightness-110 shadow-lg transition-all duration-500 ${isImageLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`} 
                                        alt="AI preview"
                                        onLoad={() => {
                                            console.log("AI Image loaded successfully");
                                            setIsImageLoading(false);
                                            setImageError(false);
                                        }}
                                        onError={(e) => {
                                            console.error("AI Image failed to load, trying fallback...");
                                            
                                            // Fallback Logic: If AI fails, use LoremFlickr as it's more reliable than the deprecated source.unsplash.com
                                            if (aiThumbPreview && !aiThumbPreview.includes('loremflickr.com')) {
                                                const searchTerms = formData.title.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 30).trim() || "abstract";
                                                const fallbackUrl = `https://loremflickr.com/1280/720/${encodeURIComponent(searchTerms)}/all`;
                                                
                                                setAiThumbPreview(fallbackUrl);
                                                setAiGeneratedUrl(fallbackUrl);
                                                // Keep isImageLoading true because we are now loading the fallback
                                            } else {
                                                setIsImageLoading(false);
                                                setImageError(true);
                                            }
                                        }}
                                    />
                                    {!isImageLoading && (
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider text-center">AI Preview Ready</p>
                                            <button 
                                                type="button" 
                                                onClick={generateAIThumbnail}
                                                className="text-[10px] bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30 transition-all"
                                            >
                                                Generate Another
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 flex flex-col items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 11V7h4"/><path d="M11 13v4h4"/><path d="M17 13v-4h-4"/></svg>
                             <p className="text-xs font-medium">AI Preview Area</p>
                             <p className="text-[10px] opacity-40">Enter a title to unlock Magic Generate</p>
                        </div>
                    )}
                </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-600 rounded-lg text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[150px]"
              disabled={loading || !formData.title || !formData.description || !formData.videoFile}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadVideo;