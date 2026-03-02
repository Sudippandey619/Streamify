import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Music, Pause } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Track } from '@/types/music';

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
  audioUrl?: string;
}

interface SongCardProps {
  song: Song;
  onPlay?: (song: Song) => void;
}

export function SongCard({ song, onPlay }: SongCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  
  const isCurrentTrack = currentTrack?.id === song.id;
  
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Handle YouTube videos
    if (song.youtubeVideoId && song.embedUrl) {
      console.log(`Playing YouTube video: ${song.youtubeVideoId}`);
      
      const track: Track = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        artistId: song.id,
        album: song.album || 'YouTube',
        albumId: song.id,
        duration: song.duration || 300, // Default to 5 minutes for YouTube
        coverUrl: song.image || '',
        audioUrl: song.embedUrl,
        youtubeVideoId: song.youtubeVideoId,
        releaseDate: new Date().toISOString().split('T')[0],
      };
      playTrack(track);
      setIsExpanded(true);
      onPlay?.(song);
      return;
    }
    
    // Use Spotify preview URL directly (official, legal audio)
    if (song.previewUrl) {
      console.log(`Playing Spotify preview: ${song.previewUrl.substring(0, 80)}...`);
      
      const track: Track = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        artistId: song.id,
        album: song.album || 'Spotify',
        albumId: song.id,
        duration: song.duration || 30, // Spotify previews are 30 seconds
        coverUrl: song.image || '',
        audioUrl: song.previewUrl,
        releaseDate: new Date().toISOString().split('T')[0],
      };
      playTrack(track);
      setIsExpanded(true);
      onPlay?.(song);
      return;
    }

    // Fallback if no preview available
    console.warn('No preview available for this track');
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: '0 20px 25px rgba(0, 0, 0, 0.5)' }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer border border-slate-700 hover:border-slate-600"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Card Header */}
      <div className="relative group">
        {song.image ? (
          <img
            src={song.image}
            alt={song.title}
            className="w-full h-48 object-cover group-hover:brightness-75 transition-all duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:brightness-75 transition-all duration-300">
            <Music className="w-12 h-12 text-white" />
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlay}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
          >
            <Play className="w-6 h-6 fill-white" />
          </motion.button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-white truncate">
          {song.title}
        </h3>
        <p className="text-sm text-slate-400 truncate mb-2">
          {song.artist}
        </p>

        {song.album && (
          <p className="text-xs text-slate-500 truncate mb-2">
            {song.album}
          </p>
        )}

        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>{formatDuration(song.duration)}</span>
          {song.popularity && (
            <span className="flex items-center gap-1">
              ⭐ {Math.round(song.popularity / 10)}/10
            </span>
          )}
        </div>
      </div>

      {/* Expanded Player */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-slate-700 p-6 bg-gradient-to-b from-slate-700 to-slate-800"
        >
          {/* Album Art Display */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              {song.image ? (
                <img
                  src={song.image}
                  alt={song.title}
                  className="w-48 h-48 rounded-lg object-cover shadow-lg"
                />
              ) : (
                <div className="w-48 h-48 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Music className="w-24 h-24 text-white" />
                </div>
              )}
              
              {/* Now Playing Indicator */}
              {isCurrentTrack && isPlaying && (
                <div className="absolute inset-0 rounded-lg border-2 border-green-400 animate-pulse" />
              )}
            </motion.div>
            
            {/* Track Info */}
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-1">NOW PLAYING</p>
              <h3 className="font-bold text-lg text-white">
                {song.title}
              </h3>
              <p className="text-sm text-slate-300">
                {song.artist}
              </p>
            </div>
            
            {/* Playing Status */}
            {isCurrentTrack && (
              <div className="flex items-center gap-2 text-green-400 font-semibold">
                {isPlaying ? (
                  <>
                    <span className="flex gap-1">
                      <span className="w-1 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <span className="w-1 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-1 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </span>
                    <span>Playing</span>
                  </>
                ) : (
                  <span>Paused</span>
                )}
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="w-full bg-slate-600 hover:bg-slate-500 text-white py-2 rounded-lg transition-colors font-semibold"
          >
            Collapse
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              try {
                let audioUrl = song.previewUrl || song.audioUrl;
                if (!audioUrl && song.youtubeVideoId) {
                  const res = await fetch(`/api/youtube/audio/${song.youtubeVideoId}`);
                  if (!res.ok) throw new Error('Failed to get audio');
                  const data = await res.json();
                  audioUrl = data.url;
                }
                if (!audioUrl) return;
                const r = await fetch(audioUrl);
                const blob = await r.blob();
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = (song.title || 'track').replace(/[^a-z0-9_-]/gi, '_') + '.mp3';
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(blobUrl);
              } catch (err) {
                console.error('Download failed', err);
              }
            }}
            className="mt-3 w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg transition-colors font-semibold"
          >
            Download
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
