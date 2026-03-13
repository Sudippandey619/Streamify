import React from 'react';
import { motion } from 'motion/react';
import { Artist } from '@/types/music';
import { CheckCircle } from 'lucide-react';

interface ArtistCardProps {
  artist: Artist;
  onClick?: () => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="bg-zinc-800/40 rounded-lg p-4 cursor-pointer transition-colors hover:bg-zinc-800/60"
    >
      <div className="relative mb-4">
        <img
          src={artist.imageUrl}
          alt={artist.name}
          className="w-full aspect-square object-cover rounded-full shadow-lg"
        />
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <h3 className="text-white font-semibold truncate">{artist.name}</h3>
          {artist.verified && (
            <CheckCircle size={14} className="text-blue-500" fill="currentColor" />
          )}
        </div>
        <p className="text-zinc-400 text-sm">Artist</p>
      </div>
    </motion.div>
  );
};

export default ArtistCard;
