import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search as SearchIcon } from 'lucide-react';
import { searchContent, SearchResults } from '@/services/api';
import AlbumCard from '@/app/components/AlbumCard';
import PlaylistCard from '@/app/components/PlaylistCard';
import ArtistCard from '@/app/components/ArtistCard';
import { AlbumCardSkeleton, ArtistCardSkeleton } from '@/app/components/LoadingSkeleton';

const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        setHasSearched(true);
        const searchResults = await searchContent(query);
        setResults(searchResults);
        setLoading(false);
      } else {
        setResults(null);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [query]);

  const browseCategories = [
    { name: 'Pop', color: 'from-pink-500 to-purple-500' },
    { name: 'Hip-Hop', color: 'from-orange-500 to-red-500' },
    { name: 'Rock', color: 'from-blue-500 to-cyan-500' },
    { name: 'Electronic', color: 'from-green-500 to-teal-500' },
    { name: 'Jazz', color: 'from-yellow-500 to-orange-500' },
    { name: 'Classical', color: 'from-purple-500 to-pink-500' },
    { name: 'Indie', color: 'from-teal-500 to-blue-500' },
    { name: 'R&B', color: 'from-red-500 to-pink-500' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black">
      <div className="p-4 md:p-8 pb-20 md:pb-8">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              placeholder="What do you want to listen to?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white text-black pl-12 pr-4 py-3 rounded-full font-medium placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </motion.div>

        {/* Browse Categories or Search Results */}
        {!hasSearched ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">Browse All</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {browseCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className={`bg-gradient-to-br ${category.color} rounded-lg p-6 cursor-pointer relative overflow-hidden h-32`}
                >
                  <h3 className="text-white text-xl font-bold">{category.name}</h3>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-black/20 rounded-lg rotate-12" />
                </motion.div>
              ))}
            </div>
          </>
        ) : loading ? (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Artists</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <ArtistCardSkeleton key={i} />
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Albums</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <AlbumCardSkeleton key={i} />
                ))}
              </div>
            </section>
          </div>
        ) : results ? (
          <div className="space-y-8">
            {/* Artists Results */}
            {results.artists.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Artists</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {results.artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </section>
            )}

            {/* Albums Results */}
            {results.albums.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Albums</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {results.albums.map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
                </div>
              </section>
            )}

            {/* Playlists Results */}
            {results.playlists.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Playlists</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {results.playlists.map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
                </div>
              </section>
            )}

            {/* No Results */}
            {results.artists.length === 0 &&
              results.albums.length === 0 &&
              results.playlists.length === 0 &&
              results.tracks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-zinc-400 text-lg">No results found for "{query}"</p>
                  <p className="text-zinc-500 text-sm mt-2">Try searching for something else</p>
                </div>
              )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchView;