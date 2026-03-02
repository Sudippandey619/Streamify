import React from 'react';
import { Play } from 'lucide-react';
import { motion } from 'motion/react';
import { Album } from '@/types/music';
import { usePlayer } from '@/contexts/PlayerContext';

interface AlbumCardProps {
  album: Album;
  onClick?: () => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick }) => {
  const { playQueue } = usePlayer();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playQueue(album.tracks);
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
          src={album.coverUrl}
          alt={album.title}
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
      <h3 className="text-white font-semibold truncate mb-1">{album.title}</h3>
      <p className="text-zinc-400 text-sm truncate">{album.artist}</p>
    </motion.div>
  );
};

export default AlbumCard;
