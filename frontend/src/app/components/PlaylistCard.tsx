import React from 'react';
import { Play } from 'lucide-react';
import { motion } from 'motion/react';
import { Playlist } from '@/types/music';
import { usePlayer } from '@/contexts/PlayerContext';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick?: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  const { playQueue } = usePlayer();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playQueue(playlist.tracks);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="bg-zinc-800/40 rounded-lg p-4 cursor-pointer transition-colors hover:bg-zinc-800/60 group relative"
    >
      <div className="relative mb-4">
        <img
          src={playlist.coverUrl}
          alt={playlist.name}
          className="w-full aspect-square object-cover rounded-lg shadow-lg"
        />
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Play size={20} fill="black" className="text-black ml-0.5" />
        </motion.button>
      </div>
      <h3 className="text-white font-semibold truncate mb-1">{playlist.name}</h3>
      <p className="text-zinc-400 text-sm line-clamp-2">{playlist.description}</p>
    </motion.div>
  );
};

export default PlaylistCard;
