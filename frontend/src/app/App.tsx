import React, { useState, useEffect } from 'react';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Sidebar from '@/app/components/Sidebar';
import PlayerBar from '@/app/components/PlayerBar';
import MobileNav from '@/app/components/MobileNav';
import HomeView from '@/app/views/HomeView';
import SearchView from '@/app/views/SearchView';
import LibraryView from '@/app/views/LibraryView';
import PlaylistView from '@/app/views/PlaylistView';
import AdminView from '@/app/views/AdminView';
import { MusicStreamingView } from '@/app/views/MusicStreamingView';

type View = 'home' | 'search' | 'library' | 'liked' | 'playlist' | 'admin' | 'music-stream';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Initialize dark mode from user preference or system
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
    if (view !== 'playlist') {
      setSelectedPlaylistId(null);
    }
    // For liked songs, we'll use a specific playlist ID
    if (view === 'liked') {
      setSelectedPlaylistId('playlist-4');
      setCurrentView('playlist');
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'search':
        return <SearchView />;
      case 'music-stream':
        return <MusicStreamingView />;
      case 'library':
        return <LibraryView />;
      case 'admin':
        return <AdminView />;
      case 'playlist':
        if (selectedPlaylistId) {
          return (
            <PlaylistView
              playlistId={selectedPlaylistId}
              onBack={() => setCurrentView('library')}
            />
          );
        }
        return <LibraryView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <ErrorBoundary>
      <PlayerProvider>
        <div className="size-full flex flex-col bg-black">
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar - hidden on mobile, shown on md and up */}
            <div className="hidden md:block">
              <Sidebar currentView={currentView} onNavigate={handleNavigate} />
            </div>
            <ErrorBoundary>
              {renderView()}
            </ErrorBoundary>
          </div>
          <MobileNav currentView={currentView} onNavigate={handleNavigate} />
          <PlayerBar />
        </div>
      </PlayerProvider>
    </ErrorBoundary>
  );
}