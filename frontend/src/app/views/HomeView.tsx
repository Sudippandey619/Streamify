import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Music, Search } from 'lucide-react';
import { SongCard } from '@/app/components/SongCard';
import { getJamendoPopular, fetchTracks } from '@/services/api';

interface SimpleSong {
  id: string;
  title: string;
  artist: string;
  image?: string;
  duration?: number;
  previewUrl?: string;
  youtubeVideoId?: string;
}

const HomeView: React.FC = () => {
  const [trending, setTrending] = useState<SimpleSong[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: any = await getJamendoPopular(12);
        if (!mounted) return;
        // Jamendo endpoint returns array of tracks
        const items = (res || []).map((t: any) => ({
          id: t.id || t.track_id || t.name || JSON.stringify(t),
          title: t.title || t.name || t.track || 'Unknown',
          artist: t.artist_name || t.artist || 'Unknown Artist',
          image: t.image || t.artwork?.url || t.coverUrl || t.thumbnail || '',
          duration: t.duration || 0,
          previewUrl: t.audio?.preview || t.audioUrl || t.streamUrl || undefined,
          youtubeVideoId: t.youtubeVideoId || undefined,
        }));
        setTrending(items.slice(0, 12));
      } catch (err) {
        console.error('Failed to load Jamendo trending:', err);
        try {
          const fallback = await fetchTracks();
          if (!mounted) return;
          const items = (fallback || []).map((t: any) => ({
            id: t.id,
            title: t.title,
            artist: t.artist,
            image: t.coverUrl || t.image || '',
            duration: t.duration || 0,
            previewUrl: t.audioUrl || t.previewUrl || undefined,
            youtubeVideoId: t.youtubeVideoId || undefined,
          }));
          setTrending(items.slice(0, 12));
        } catch (e) {
          console.error('Failed to load trending', e);
        }
      }
    })();
    return () => { mounted = false };
  }, []);
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black">
      <div className="p-4 md:p-8 pb-20 md:pb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-white mb-6 md:mb-8"
        >
          {getGreeting()}
        </motion.h1>

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-white"
        >
          <div className="flex items-start gap-4">
            <Music className="w-12 h-12 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Streamify</h2>
              <p className="mb-4 text-green-100">
                Search and play your favorite songs with beautiful UI and dark mode.
              </p>
              <button
                onClick={() => window.location.hash = '#/music-stream'}
                className="inline-flex items-center gap-2 px-6 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                <Search className="w-5 h-5" />
                Start Searching
              </button>
            </div>
          </div>
        </motion.div>

        {/* Trending Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-xl text-white font-semibold mb-4">Trending</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trending.length === 0 ? (
              <p className="text-slate-400">Loading trending...</p>
            ) : (
              trending.map(s => (
                <SongCard key={s.id} song={s as any} />
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeView;