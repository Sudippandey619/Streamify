import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Track } from '@/types/music';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Track[];
  playTrack: (track: Track) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  // Imperative setters used by external players (e.g. YouTube iframe)
  setCurrentTimeDirect: (time: number) => void;
  setDurationDirect: (duration: number) => void;
  // Playback extras
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  loopOne: boolean;
  setLoopOne: (v: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [loopOne, setLoopOne] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Initialize audio element on mount
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'metadata';
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Real audio playback with accessible audio URLs
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Update audio properties
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.playbackRate = playbackRate;
    
    if (currentTrack && currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      
      if (isPlaying) {
        console.log(`Playing: ${currentTrack.title} - ${currentTrack.audioUrl}`);
        
        // Reset audio before playing
        audio.currentTime = 0;
        audio.load();
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio started playing successfully');
            })
            .catch(err => {
              console.error('Audio play error:', err.message);
              // Log more details for debugging
              if (audio.error) {
                console.error('Media error code:', audio.error.code);
              }
            });
        }
      } else {
        audio.pause();
      }
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [currentTrack, isPlaying, volume, playbackRate]);

  // Sync time updates from audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      // Handle end of track - loop or move to next
      if (loopOne) {
        if (audio) {
          audio.currentTime = 0;
          audio.play();
        }
        return;
      }

      setCurrentIndex(prevIndex => {
        const newIndex = prevIndex < (queue.length - 1) ? prevIndex + 1 : 0;
        if (queue.length > 0) {
          setCurrentTrack(queue[newIndex]);
          setIsPlaying(true);
        }
        return newIndex;
      });
    };
    
    const handleError = () => {
      const errorCodes = {
        1: 'MEDIA_ERR_ABORTED - Loading aborted',
        2: 'MEDIA_ERR_NETWORK - Network error',
        3: 'MEDIA_ERR_DECODE - Decoding error',
        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Source not supported',
      };
      const code = audio.error?.code || 0;
      const message = errorCodes[code as keyof typeof errorCodes] || 'Unknown error';
      console.error(`Audio error: ${message}`, { 
        url: audio.src,
        errorCode: code,
      });
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [queue, loopOne]);

  const playTrack = (track: Track) => {
    setQueue([track]);
    setCurrentIndex(0);
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const playQueue = (tracks: Track[], startIndex: number = 0) => {
    setQueue(tracks);
    setCurrentIndex(startIndex);
    setCurrentTrack(tracks[startIndex]);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const nextTrack = () => {
    if (currentIndex < queue.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentTrack(queue[newIndex]);
      setIsPlaying(true);
    } else {
      // Loop back to start
      setCurrentIndex(0);
      setCurrentTrack(queue[0]);
      setIsPlaying(true);
    }
  };

  const previousTrack = () => {
    const audio = audioRef.current;
    if (audio?.currentTime ?? 0 > 3) {
      // If more than 3 seconds in, restart current track
      if (audio) audio.currentTime = 0;
    } else if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentTrack(queue[newIndex]);
      setIsPlaying(true);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current !== null) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  const setPlaybackRate = (rate: number) => {
    setPlaybackRateState(rate);
  };

  const addToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track]);
  };

  const setCurrentTimeDirect = (time: number) => {
    setCurrentTime(time);
  };

  const setDurationDirect = (dur: number) => {
    setDuration(dur);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        currentTime,
        duration,
        queue,
        playTrack,
        playQueue,
        togglePlayPause,
        nextTrack,
        previousTrack,
        seekTo,
        setVolume,
        addToQueue,
        setCurrentTimeDirect,
        setDurationDirect,
        // Expose playback controls
        playbackRate,
        setPlaybackRate,
        loopOne,
        setLoopOne,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
