import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { SongCard } from './SongCard';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  image?: string;
  duration?: number;
  youtubeVideoId: string;
  popularity?: number;
  previewUrl?: string;
}

interface SearchComponentProps {
  apiBaseUrl?: string;
}

export function SearchComponent({ apiBaseUrl = 'http://localhost:3001/api' }: SearchComponentProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [youtubeResults, setYoutubeResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'youtube'>('all');

  const searchMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setYoutubeResults([]);

    try {
      // Search YouTube for music videos
      const youtubeRes = await fetch(
        `${apiBaseUrl}/youtube/search?q=${encodeURIComponent(query)}&maxResults=20`
      );

      if (!youtubeRes.ok) {
        throw new Error('YouTube search failed');
      }

      const youtubeData = await youtubeRes.json();
      
      // Get videos from YouTube response
      const videos = youtubeData.videos || [];
      
      // Convert YouTube videos to song format
      const songs: Song[] = videos.map((video: any) => ({
        id: video.id || video.youtubeVideoId,
        title: video.title,
        artist: video.artist,
        image: video.image,
        youtubeVideoId: video.youtubeVideoId,
        embedUrl: video.embedUrl,
        album: '',
        duration: 0,
        previewUrl: '', // YouTube videos don't have preview URLs
        popularity: 0
      }));

      if (songs.length === 0) {
        setError('No videos found. Try a different search.');
      } else {
        setResults(songs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search YouTube');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          🎵 Find Your Music
        </h1>
        <p className="text-slate-400 mb-6">Search for songs, artists, and more</p>

        <form onSubmit={searchMusic} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search song, artist, or album..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex gap-3 items-start"
          >
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <span className="text-red-300">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              {results.length} Results Found
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {results.map((song, index) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SongCard song={song} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && !error && query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-slate-400 text-lg">
            No results found for "{query}". Try a different search term.
          </p>
        </motion.div>
      )}

      {/* Welcome State */}
      {!query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-7xl mb-4">🎶</div>
          <p className="text-slate-400 text-lg">
            Search for your favorite songs and artists to get started!
          </p>
        </motion.div>
      )}
    </div>
  );
}
