import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import { VideoProvider } from '@contexts/VideoContext';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';
import { Login } from '@pages/Login';
import { Register } from '@pages/Register';
import { StatusPopup } from '@components/common/StatusPopup';
import { ErrorBoundary } from '@components/common/ErrorBoundary';
import { useVideo } from '@contexts/VideoContext';
import '@styles/global.css';
import './App.css';
import { useAuth } from '@hooks/useAuth';
import { LoadingScreen } from '@components/common/LoadingScreen';

import { ArtistHubLayout } from './modules/ArtistHub/layout/ArtistHubLayout';
import { HubDashboard } from './modules/ArtistHub/pages/HubDashboard';
import { Agenda } from './modules/ArtistHub/pages/Agenda';
import { Checklists } from './modules/ArtistHub/pages/Checklists';
import { TrackList } from './modules/ArtistHub/pages/TrackList';
import { MediaLibrary } from './modules/ArtistHub/pages/MediaLibrary';
import { Artists } from './modules/ArtistHub/pages/Artists';
import { Financial } from './modules/ArtistHub/pages/Financial';
import { MusicOrganizer } from './modules/ArtistHub/pages/MusicOrganizer/MusicOrganizer';
import { TrackDashboard } from './modules/ArtistHub/pages/TrackDashboard';
import { SharedTrackView } from './modules/ArtistHub/pages/SharedTrackView';
import { ArtistDashboard } from './modules/ArtistHub/pages/ArtistDashboard';

const AppContent = () => {
  const { isGenerating, generationStatus, notification } = useVideo();
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusPopup
        isVisible={isGenerating || generationStatus === 'success' || !!notification}
        status={generationStatus}
        notification={notification}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public Shared Route */}
        <Route path="/shared/:token" element={<SharedTrackView />} />


        {/* Trackfy Routes */}
        <Route
          path="/artist-hub"
          element={
            <ProtectedRoute>
              <ArtistHubLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HubDashboard />} />
          <Route path="artists" element={<Artists />} />
          <Route path="artists/:id/dashboard" element={<ArtistDashboard />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="checklists" element={<Checklists />} />
          <Route path="tracks" element={<TrackList />} />
          <Route path="tracks/:id" element={<TrackDashboard />} />
          <Route path="files" element={<MediaLibrary />} />
          <Route path="financial" element={<Financial />} />
          <Route path="organizer" element={<MusicOrganizer />} />
        </Route>

        <Route path="/" element={<Navigate to="/artist-hub" replace />} />
      </Routes>
    </>
  );
};

import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import { FooterPlayer } from './components/AudioPlayer/FooterPlayer';

// ... (imports remain the same, just adding new ones)

function App() {
  console.log('App.tsx: Rendering App component');
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <VideoProvider>
            <AudioPlayerProvider>
              <AppContent />
              <FooterPlayer />
            </AudioPlayerProvider>
          </VideoProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
