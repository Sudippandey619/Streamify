import React from 'react';
import { Play, Pause, MoreHorizontal, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Track } from '@/types/music';
import { usePlayer } from '@/contexts/PlayerContext';

interface TrackRowProps {
  track: Track;
  index: number;
  showAlbum?: boolean;
}

const TrackRow: React.FC<TrackRowProps> = ({ track, index, showAlbum = true }) => {
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayer();
  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlayClick = () => {
    if (isCurrentTrack) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      whileHover={{ backgroundColor: 'rgba(63, 63, 70, 0.4)' }}
      className="grid grid-cols-[16px_4fr_2fr_1fr] md:grid-cols-[16px_6fr_4fr_3fr_1fr] gap-4 px-4 py-2 rounded group items-center"
    >
      {/* Index / Play Button */}
      <div className="flex items-center justify-center">
        {isCurrentTrack && isPlaying ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePlayClick}
            className="text-green-500"
          >
            <Pause size={16} fill="currentColor" />
          </motion.button>
        ) : (
          <>
            <span className="text-zinc-400 text-sm group-hover:hidden">{index + 1}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlayClick}
              className="hidden group-hover:block text-white"
            >
              <Play size={16} fill="currentColor" />
            </motion.button>
          </>
        )}
      </div>

      {/* Title & Artist */}
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-10 h-10 rounded object-cover"
        />
        <div className="min-w-0">
          <p className={`truncate ${isCurrentTrack ? 'text-green-500' : 'text-white'}`}>
            {track.title}
          </p>
          <p className="text-zinc-400 text-sm truncate">{track.artist}</p>
        </div>
      </div>

      {/* Album - Hidden on mobile */}
      {showAlbum && (
        <div className="hidden md:block">
          <p className="text-zinc-400 text-sm truncate">{track.album}</p>
        </div>
      )}

      {/* Actions - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart size={16} />
        </motion.button>
      </div>

      {/* Duration */}
      <div className="flex items-center justify-end gap-4">
        <span className="text-zinc-400 text-sm">{formatDuration(track.duration)}</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TrackRow;
