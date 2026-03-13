import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fetchPlaylists, fetchAlbums } from '@/services/api';
import { Playlist, Album } from '@/types/music';
import { Music, ListMusic, Grid3x3, List } from 'lucide-react';
import { AlbumCardSkeleton } from '@/app/components/LoadingSkeleton';

const LibraryView: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'playlists' | 'albums'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [playlistsData, albumsData] = await Promise.all([
        fetchPlaylists(),
        fetchAlbums(),
      ]);
      setPlaylists(playlistsData);
      setAlbums(albumsData);
      setLoading(false);
    };

    loadData();
  }, []);

  const filterButtons = [
    { id: 'all' as const, label: 'All', icon: Music },
    { id: 'playlists' as const, label: 'Playlists', icon: ListMusic },
    { id: 'albums' as const, label: 'Albums', icon: Music },
  ];

  const getFilteredItems = () => {
    if (filter === 'playlists') return playlists;
    if (filter === 'albums') return albums;
    return [...playlists, ...albums];
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black">
      <div className="p-4 md:p-8 pb-20 md:pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">Your Library</h1>

          {/* Filter and View Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {filterButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <motion.button
                    key={btn.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(btn.id)}
                    className={`px-4 py-2 rounded-full transition-colors ${
                      filter === btn.id
                        ? 'bg-white text-black'
                        : 'bg-zinc-800 text-white hover:bg-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} />
                      <span className="text-sm font-medium">{btn.label}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Grid3x3 size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <List size={20} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
            : 'space-y-2'
          }>
            {[...Array(10)].map((_, i) => (
              <AlbumCardSkeleton key={i} />
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map((item, index) => {
              const isPlaylist = 'tracks' in item && 'isPublic' in item;
              const coverUrl = isPlaylist ? (item as Playlist).coverUrl : (item as Album).coverUrl;
              const title = isPlaylist ? (item as Playlist).name : (item as Album).title;
              const subtitle = isPlaylist ? 'Playlist' : (item as Album).artist;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-zinc-800/40 rounded-lg p-4 cursor-pointer transition-colors hover:bg-zinc-800/60"
                >
                  <img
                    src={coverUrl}
                    alt={title}
                    className="w-full aspect-square object-cover rounded-lg shadow-lg mb-4"
                  />
                  <h3 className="text-white font-semibold truncate">{title}</h3>
                  <p className="text-zinc-400 text-sm truncate">{subtitle}</p>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item, index) => {
              const isPlaylist = 'tracks' in item && 'isPublic' in item;
              const coverUrl = isPlaylist ? (item as Playlist).coverUrl : (item as Album).coverUrl;
              const title = isPlaylist ? (item as Playlist).name : (item as Album).title;
              const subtitle = isPlaylist 
                ? `${(item as Playlist).tracks.length} songs`
                : (item as Album).artist;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ backgroundColor: 'rgba(63, 63, 70, 0.4)' }}
                  className="flex items-center gap-4 p-2 rounded cursor-pointer"
                >
                  <img
                    src={coverUrl}
                    alt={title}
                    className="w-14 h-14 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{title}</h3>
                    <p className="text-zinc-400 text-sm truncate">{subtitle}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">No {filter === 'all' ? 'items' : filter} found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryView;