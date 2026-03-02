import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, MoreHorizontal, Clock } from 'lucide-react';
import { fetchPlaylistById } from '@/services/api';
import { Playlist } from '@/types/music';
import TrackRow from '@/app/components/TrackRow';
import { TrackRowSkeleton } from '@/app/components/LoadingSkeleton';
import { usePlayer } from '@/contexts/PlayerContext';

interface PlaylistViewProps {
  playlistId: string;
  onBack: () => void;
}

const PlaylistView: React.FC<PlaylistViewProps> = ({ playlistId, onBack }) => {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const { playQueue } = usePlayer();

  useEffect(() => {
    const loadPlaylist = async () => {
      setLoading(true);
      const data = await fetchPlaylistById(playlistId);
      setPlaylist(data);
      setLoading(false);
    };

    loadPlaylist();
  }, [playlistId]);

  const handlePlayAll = () => {
    if (playlist) {
      playQueue(playlist.tracks);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black">
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-6 mb-8"
          >
            <div className="w-60 h-60 bg-zinc-800 rounded-lg animate-pulse" />
            <div className="flex flex-col justify-end flex-1">
              <div className="h-8 bg-zinc-800 rounded w-1/4 mb-4 animate-pulse" />
              <div className="h-12 bg-zinc-800 rounded w-3/4 mb-4 animate-pulse" />
              <div className="h-4 bg-zinc-800 rounded w-1/2 animate-pulse" />
            </div>
          </motion.div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <TrackRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black">
        <div className="p-8">
          <p className="text-white">Playlist not found</p>
          <button onClick={onBack} className="text-green-500 mt-4">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-purple-900/20 via-zinc-900 to-black">
      <div className="p-4 md:p-8 pb-20 md:pb-8">
        {/* Playlist Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 md:gap-6 mb-6 md:mb-8 items-end"
        >
          <motion.img
            whileHover={{ scale: 1.02 }}
            src={playlist.coverUrl}
            alt={playlist.name}
            className="w-32 h-32 md:w-60 md:h-60 rounded-lg shadow-2xl object-cover"
          />
          <div className="flex flex-col justify-end pb-2">
            <p className="text-xs md:text-sm font-semibold text-white mb-2">PLAYLIST</p>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-6">{playlist.name}</h1>
            <p className="text-zinc-300 mb-2 md:mb-4 text-sm md:text-base">{playlist.description}</p>
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <span className="text-white font-semibold">{playlist.tracks.length} songs</span>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-6 mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAll}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-xl hover:bg-green-400 transition-colors"
          >
            <Play size={24} fill="black" className="text-black ml-1" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <MoreHorizontal size={32} />
          </motion.button>
        </motion.div>

        {/* Track List Header */}
        <div className="grid grid-cols-[16px_4fr_2fr_1fr] md:grid-cols-[16px_6fr_4fr_3fr_1fr] gap-4 px-4 py-2 border-b border-zinc-800 mb-2">
          <div className="text-zinc-400 text-sm">#</div>
          <div className="text-zinc-400 text-sm">TITLE</div>
          <div className="hidden md:block text-zinc-400 text-sm">ALBUM</div>
          <div className="hidden md:block" />
          <div className="text-zinc-400 text-sm flex justify-end">
            <Clock size={16} />
          </div>
        </div>

        {/* Track List */}
        <div className="space-y-1">
          {playlist.tracks.map((track, index) => (
            <TrackRow key={track.id} track={track} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistView;