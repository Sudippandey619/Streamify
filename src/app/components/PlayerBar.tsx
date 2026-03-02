import React, { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Heart, Music } from 'lucide-react';
import { Download } from 'lucide-react';
import { motion } from 'motion/react';
import { usePlayer } from '@/contexts/PlayerContext';
import YouTubePlayer, { YouTubePlayerHandle } from './YouTubePlayer';

const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    setCurrentTimeDirect,
    setDurationDirect,
    playbackRate,
    setPlaybackRate,
    loopOne,
    setLoopOne,
  } = usePlayer();
  const ytRef = useRef<YouTubePlayerHandle | null>(null);
  
  const [imageError, setImageError] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (currentTrack?.youtubeVideoId && ytRef.current) {
      ytRef.current.seekTo(value);
      setCurrentTimeDirect && setCurrentTimeDirect(value);
    } else {
      seekTo(value);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (currentTrack?.youtubeVideoId && ytRef.current) {
      ytRef.current.setVolume(v);
    }
    setVolume(v);
  };

  const handleSetSpeed = (rate: number) => {
    try {
      setPlaybackRate(rate);
      if (currentTrack?.youtubeVideoId && ytRef.current && ytRef.current.setPlaybackRate) {
        ytRef.current.setPlaybackRate(rate);
      } else if (!currentTrack?.youtubeVideoId) {
        // audio element playbackRate is handled by context
      }
    } catch (err) {
      console.error('Failed to set playback rate', err);
    }
  };

  const downloadCurrent = async () => {
    if (!currentTrack) return;

    try {
      let audioUrl = currentTrack.audioUrl;

      if (!audioUrl && currentTrack.youtubeVideoId) {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/youtube/audio/${currentTrack.youtubeVideoId}`);
        if (!res.ok) throw new Error('Failed to get YouTube audio');
        const data = await res.json();
        audioUrl = data.url;
      }

      if (!audioUrl) {
        console.warn('No downloadable audio URL available');
        return;
      }

      const resp = await fetch(audioUrl);
      if (!resp.ok) throw new Error('Failed to fetch audio');
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const name = (currentTrack.title || 'track').replace(/[^a-z0-9_-]/gi, '_') + '.mp3';
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  if (!currentTrack) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-20 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-center"
      >
        <p className="text-slate-500 text-sm">Select a track to start playing</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-20 bg-slate-900/95 border-t border-slate-800 px-4 flex items-center justify-between gap-4 backdrop-blur-sm"
    >
      {/* Track Info */}
      <div className="flex items-center gap-3 w-1/5 min-w-0">
        <div className="w-14 h-14 rounded-md bg-slate-800 flex-shrink-0 overflow-hidden">
          {currentTrack.youtubeVideoId ? (
            <div className="w-full h-full">
              <YouTubePlayer
                ref={ytRef}
                videoId={currentTrack.youtubeVideoId}
                isPlaying={isPlaying}
                volume={volume}
                onTimeUpdate={(t) => setCurrentTimeDirect && setCurrentTimeDirect(t)}
                onDuration={(d) => setDurationDirect && setDurationDirect(d)}
              />
            </div>
          ) : (
            !imageError && currentTrack.coverUrl ? (
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Music size={20} className="text-white" />
              </div>
            )
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-semibold truncate">{currentTrack.title}</p>
          <p className="text-slate-400 text-xs truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <Shuffle size={16} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={previousTrack}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <SkipBack size={16} fill="currentColor" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlayPause}
            className="w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <Pause size={16} fill="white" className="text-white" />
            ) : (
              <Play size={16} fill="white" className="text-white ml-0.5" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextTrack}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <SkipForward size={16} fill="currentColor" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <Repeat size={16} />
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-slate-400 w-8 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:cursor-pointer"
            style={{
              background: `linear-gradient(to right, #a855f7 ${duration ? (currentTime / duration) * 100 : 0}%, rgb(55, 65, 81) ${duration ? (currentTime / duration) * 100 : 0}%)`,
            }}
          />
          <span className="text-xs text-slate-400 w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Control & Favorites */}
      <div className="flex items-center gap-3 w-1/6 justify-end">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-slate-400 hover:text-red-500 transition-colors p-1"
        >
          <Heart size={16} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadCurrent}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <Download size={16} />
        </motion.button>

        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-slate-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:cursor-pointer"
            style={{
              background: `linear-gradient(to right, #a855f7 ${volume * 100}%, rgb(55, 65, 81) ${volume * 100}%)`,
            }}
          />
        </div>
        
        {/* Playback speed */}
        <div className="flex items-center gap-2">
          <select
            value={playbackRate}
            onChange={(e) => handleSetSpeed(Number(e.target.value))}
            className="bg-slate-800 text-xs text-slate-300 p-1 rounded"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>

        {/* Loop toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLoopOne(!loopOne)}
          className={`p-1 rounded ${loopOne ? 'text-green-400' : 'text-slate-400'} hover:text-white transition-colors`}
        >
          <Repeat size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PlayerBar;