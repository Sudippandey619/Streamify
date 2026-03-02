import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

type Props = {
  videoId: string;
  isPlaying: boolean;
  volume?: number; // 0-1
  onTimeUpdate?: (seconds: number) => void;
  onDuration?: (seconds: number) => void;
  loopOne?: boolean;
};

export type YouTubePlayerHandle = {
  seekTo: (seconds: number) => void;
  setVolume: (v: number) => void;
  setPlaybackRate?: (rate: number) => void;
};

const YouTubePlayer = forwardRef<YouTubePlayerHandle, Props>(({ videoId, isPlaying, volume = 0.7, onTimeUpdate, onDuration, loopOne }, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    seekTo: (s: number) => {
      if (playerRef.current && playerRef.current.seekTo) {
        playerRef.current.seekTo(s, true);
      }
    },
    setVolume: (v: number) => {
      if (playerRef.current && playerRef.current.setVolume) {
        playerRef.current.setVolume(Math.round(v * 100));
      }
    }
    ,
    setPlaybackRate: (r: number) => {
      try {
        if (playerRef.current && playerRef.current.setPlaybackRate) {
          playerRef.current.setPlaybackRate(r);
        }
      } catch (err) {}
    }
  }));

  useEffect(() => {
    // Load IFrame API if needed
    const loadApi = () => new Promise<void>((resolve) => {
      if ((window as any).YT && (window as any).YT.Player) return resolve();
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = () => resolve();
    });

    let mounted = true;

    loadApi().then(() => {
      if (!mounted) return;
      if (!containerRef.current) return;

      // Create player
      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        height: '200',
        width: '320',
        videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(Math.round(volume * 100));
            const dur = e.target.getDuration();
            onDuration && onDuration(dur || 0);
            if (isPlaying) {
              e.target.playVideo();
            }
          },
          onStateChange: (e: any) => {
            const YT = (window as any).YT;
            // 1 = playing, 2 = paused, 0 = ended
            if (e.data === YT.PLAYING) {
              // start poll
              if (intervalRef.current) window.clearInterval(intervalRef.current);
              intervalRef.current = window.setInterval(() => {
                try {
                  const t = playerRef.current.getCurrentTime();
                  onTimeUpdate && onTimeUpdate(Math.floor(t));
                } catch (err) {}
              }, 500);
            } else if (e.data === YT.ENDED) {
              // Restart when loopOne is enabled
              if (loopOne) {
                try {
                  playerRef.current.seekTo(0, true);
                  playerRef.current.playVideo();
                } catch (err) {}
              }
            } else {
              if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
            }
          }
        }
      });
    }).catch(err => console.error('YT API load error', err));

    return () => {
      mounted = false;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      try {
        if (playerRef.current && playerRef.current.destroy) {
          playerRef.current.destroy();
        }
      } catch (e) {}
    };
  }, [videoId]);

  // react to play/pause/volume changes
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) playerRef.current.playVideo();
      else playerRef.current.pauseVideo();
      playerRef.current.setVolume(Math.round(volume * 100));
    } catch (err) {}
  }, [isPlaying, volume]);

  return (
    <div className="youtube-player" style={{ width: 320, height: 200 }}>
      <div ref={containerRef} />
    </div>
  );
});

export default YouTubePlayer;
