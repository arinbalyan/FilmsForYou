'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  PictureInPicture,
  X
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { StreamingSource } from '@/types/movie';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  onClose?: () => void;
  className?: string;
}

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  isLoading: boolean;
  showControls: boolean;
  showSettings: boolean;
  selectedQuality: string;
}

export const VideoPlayer = ({
  src,
  poster,
  title = 'Video Player',
  onClose,
  className
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>(null);

  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    playbackRate: 1,
    isLoading: true,
    showControls: true,
    showSettings: false,
    selectedQuality: 'auto',
  });

  // Show controls temporarily
  const showControls = useCallback(() => {
    setState(prev => ({ ...prev, showControls: true }));
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  }, []);

  // Hide controls after timeout
  const hideControls = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setState(prev => {
        if (prev.isPlaying) {
          return { ...prev, showControls: false };
        }
        return prev;
      });
    }, 3000);
  }, []);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setState(prev => ({
        ...prev,
        duration: video.duration,
        isLoading: false
      }));
    };

    const handleTimeUpdate = () => {
      setState(prev => ({
        ...prev,
        currentTime: video.currentTime
      }));
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
      hideControls();
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false, showControls: true }));
    };

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false, showControls: true }));
    };

    const handleVolumeChange = () => {
      setState(prev => ({
        ...prev,
        volume: video.volume,
        isMuted: video.muted
      }));
    };

    const handleFullscreenChange = () => {
      setState(prev => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement
      }));
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [hideControls]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (state.isFullscreen) {
            exitFullscreen();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [state.isFullscreen]);

  // Player controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (state.isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const seek = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(state.duration, videoRef.current.currentTime + seconds));
  };

  const adjustVolume = (delta: number) => {
    if (!videoRef.current) return;
    const newVolume = Math.max(0, Math.min(1, state.volume + delta));
    videoRef.current.volume = newVolume;
    setState(prev => ({ ...prev, volume: newVolume, isMuted: newVolume === 0 }));
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
  };

  const toggleFullscreen = async () => {
    if (!playerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await playerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * state.duration;
  };

  const togglePictureInPicture = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  };

  const setPlaybackRate = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setState(prev => ({ ...prev, playbackRate: rate }));
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
  const bufferedPercent = videoRef.current?.buffered.length
    ? (videoRef.current.buffered.end(videoRef.current.buffered.length - 1) / state.duration) * 100
    : 0;

  return (
    <div
      ref={playerRef}
      className={cn(
        "relative bg-black rounded-xl overflow-hidden group",
        state.isFullscreen ? "fixed inset-0 z-50 rounded-none" : "w-full aspect-video",
        className
      )}
      onMouseMove={showControls}
      onMouseLeave={hideControls}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        onClick={togglePlay}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Loading Spinner */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-end transition-opacity duration-300",
          state.showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium truncate">{title}</h3>
            <div className="flex items-center gap-2">
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-2">
          <div
            className="relative bg-white/20 h-1 rounded cursor-pointer group/progress"
            onClick={handleProgressClick}
          >
            {/* Buffered Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-white/40 rounded"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Played Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-purple-500 rounded"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `${progressPercent}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => seek(-10)}
                className="p-2 hover:bg-white/20 rounded transition-colors"
              >
                <SkipBack className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={togglePlay}
                className="p-3 hover:bg-white/20 rounded-full transition-colors"
              >
                {state.isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white" />
                )}
              </button>
              <button
                onClick={() => seek(10)}
                className="p-2 hover:bg-white/20 rounded transition-colors"
              >
                <SkipForward className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded transition-colors"
              >
                {state.isMuted || state.volume === 0 ? (
                  <VolumeX className="h-5 w-5 text-white" />
                ) : (
                  <Volume2 className="h-5 w-5 text-white" />
                )}
              </button>
              <div className="group/volume relative">
                <div
                  className="w-20 h-1 bg-white/20 rounded cursor-pointer"
                  onClick={(e) => {
                    if (!videoRef.current) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    videoRef.current.volume = percent;
                  }}
                >
                  <div
                    className="h-full bg-white rounded"
                    style={{ width: `${state.volume * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-white text-sm font-mono ml-2">
                {formatTime(state.currentTime)} / {formatTime(state.duration)}
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Playback Speed */}
              <div className="relative group/speed">
                <button className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors">
                  {state.playbackRate}x
                </button>
                <div className="absolute bottom-full mb-2 right-0 bg-black/90 rounded p-1 opacity-0 group-hover/speed:opacity-100 transition-opacity">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setPlaybackRate(rate)}
                      className={cn(
                        "block w-full px-3 py-1 text-left text-sm hover:bg-white/20 rounded",
                        state.playbackRate === rate ? "bg-purple-600" : "text-white"
                      )}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => setState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                >
                  <Settings className="h-5 w-5 text-white" />
                </button>
                {state.showSettings && (
                  <div className="absolute bottom-full mb-2 right-0 bg-black/90 rounded p-2 min-w-[200px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium">Settings</span>
                      <button
                        onClick={() => setState(prev => ({ ...prev, showSettings: false }))}
                        className="p-1 hover:bg-white/20 rounded"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-white text-xs block mb-1">Playback Speed</label>
                        <select
                          value={state.playbackRate}
                          onChange={(e) => setPlaybackRate(Number(e.target.value))}
                          className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                        >
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                            <option key={rate} value={rate} className="bg-gray-800">
                              {rate}x
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Picture-in-Picture */}
              {document.pictureInPictureEnabled && (
                <button
                  onClick={togglePictureInPicture}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                >
                  <PictureInPicture className="h-5 w-5 text-white" />
                </button>
              )}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/20 rounded transition-colors"
              >
                {state.isFullscreen ? (
                  <Minimize className="h-5 w-5 text-white" />
                ) : (
                  <Maximize className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Play Button Overlay (when paused) */}
      {!state.isPlaying && !state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="p-6 bg-black/50 hover:bg-black/70 rounded-full transition-colors group"
          >
            <Play className="h-12 w-12 text-white group-hover:scale-110 transition-transform" fill="currentColor" />
          </button>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      {state.showControls && (
        <div className="absolute bottom-20 right-4 bg-black/80 text-white text-xs p-3 rounded max-w-[250px] opacity-75">
          <div className="font-medium mb-2">Keyboard Shortcuts:</div>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <span>Space:</span><span>Play/Pause</span>
            <span>← →:</span><span>Seek ±10s</span>
            <span>↑ ↓:</span><span>Volume ±10%</span>
            <span>M:</span><span>Mute</span>
            <span>F:</span><span>Fullscreen</span>
            <span>Esc:</span><span>Exit Fullscreen</span>
          </div>
        </div>
      )}
    </div>
  );
};
