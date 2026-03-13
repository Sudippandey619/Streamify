import React from 'react';
import { motion } from 'motion/react';

export const AlbumCardSkeleton: React.FC = () => {
  return (
    <div className="bg-zinc-800/40 rounded-lg p-4">
      <motion.div
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="aspect-square bg-zinc-700 rounded-lg mb-4"
      />
      <div className="space-y-2">
        <motion.div
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          className="h-4 bg-zinc-700 rounded w-3/4"
        />
        <motion.div
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="h-3 bg-zinc-700 rounded w-1/2"
        />
      </div>
    </div>
  );
};

export const TrackRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-2">
      <motion.div
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-10 h-10 bg-zinc-700 rounded"
      />
      <div className="flex-1 space-y-2">
        <motion.div
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          className="h-4 bg-zinc-700 rounded w-1/3"
        />
        <motion.div
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="h-3 bg-zinc-700 rounded w-1/4"
        />
      </div>
      <motion.div
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        className="h-3 bg-zinc-700 rounded w-12"
      />
    </div>
  );
};

export const ArtistCardSkeleton: React.FC = () => {
  return (
    <div className="bg-zinc-800/40 rounded-lg p-4">
      <motion.div
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="aspect-square bg-zinc-700 rounded-full mb-4"
      />
      <motion.div
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
        className="h-4 bg-zinc-700 rounded w-3/4 mx-auto"
      />
    </div>
  );
};
