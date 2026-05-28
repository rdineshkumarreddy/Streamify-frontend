// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const UploadVideo = lazy(() => import('./pages/UploadVideo'));
const Watch = lazy(() => import('./pages/Watch'));
const Tweets = lazy(() => import('./pages/Tweets'));
const Notifications = lazy(() => import('./pages/Notifications'));
const History = lazy(() => import('./pages/History'));
const LikedVideos = lazy(() => import('./pages/LikedVideos'));
const Playlists = lazy(() => import('./pages/Playlists'));
const Playlist = lazy(() => import('./pages/Playlist'));
const PlaylistDetails = lazy(() => import('./pages/PlaylistDetails'));
const Profile = lazy(() => import('./pages/Profile'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const Channel = lazy(() => import('./pages/Channel'));
const Library = lazy(() => import('./pages/Library'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const GoLive = lazy(() => import('./pages/GoLive'));
const LiveStreams = lazy(() => import('./pages/LiveStreams'));
const WatchLive = lazy(() => import('./pages/WatchLive'));

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-youtube-dark">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
  </div>
);

// Private route component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <Loading />;
  return user ? children : <Navigate to="/login" replace />;
};

// Main app component
const AppContent = () => {
  return (
    <div className="min-h-screen bg-youtube-dark text-white">
      <Suspense fallback={<Loading />}>
        <Toaster position="top-right" 
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/results" element={<SearchResults />} />
            <Route path="/c/:username" element={<Channel />} />
            <Route path="/live" element={<LiveStreams />} />
            <Route path="/live/:streamId" element={<WatchLive />} />
            
            <Route
              path="/upload"
              element={
                <PrivateRoute>
                  <UploadVideo />
                </PrivateRoute>
              }
            />
            <Route
              path="/tweets"
              element={
                <PrivateRoute>
                  <Tweets />
                </PrivateRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <Notifications />
                </PrivateRoute>
              }
            />
            <Route
              path="/feed/history"
              element={
                <PrivateRoute>
                  <History />
                </PrivateRoute>
              }
            />
            <Route
              path="/feed/liked"
              element={
                <PrivateRoute>
                  <LikedVideos />
                </PrivateRoute>
              }
            />
            <Route
              path="/feed/library"
              element={
                <PrivateRoute>
                  <Library />
                </PrivateRoute>
              }
            />
            <Route
              path="/playlists"
              element={
                <PrivateRoute>
                  <Playlists />
                </PrivateRoute>
              }
            />
            <Route
              path="/playlist/:playlistId"
              element={
                <PrivateRoute>
                  <Playlist />
                </PrivateRoute>
              }
            />
            <Route
              path="/playlist/:playlistId/details"
              element={
                <PrivateRoute>
                  <PlaylistDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/go-live"
              element={
                <PrivateRoute>
                  <GoLive />
                </PrivateRoute>
              }
            />
          </Route>
          
          {/* Auth routes without Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
};

// App wrapper with providers
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </BrowserRouter>
);

export default App;