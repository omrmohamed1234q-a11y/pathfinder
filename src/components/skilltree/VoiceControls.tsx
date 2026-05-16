import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipForward, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react';

interface VoiceControlsProps {
  text: string;
  autoPlay?: boolean;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({ text, autoPlay = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    // Auto-play if enabled
    if (autoPlay && text) {
      setIsExpanded(true);
      handlePlay();
    }

    return () => {
      // Cleanup: stop speech when component unmounts
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    // Update rate and volume when changed
    if (utteranceRef.current) {
      utteranceRef.current.rate = rate;
      utteranceRef.current.volume = isMuted ? 0 : volume;
    }
  }, [rate, volume, isMuted]);

  const handlePlay = () => {
    if (!isSupported || !text) return;

    // Expand controls when playing
    setIsExpanded(true);

    // Resume if paused
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.volume = isMuted ? 0 : volume;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!isSupported) {
    return null; // Hide entirely if not supported — less clutter
  }

  // Collapsed state — just a small button
  if (!isExpanded && !isPlaying && !isPaused) {
    return (
      <button
        onClick={() => {
          setIsExpanded(true);
          handlePlay();
        }}
        className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors w-full hover:border-primary/30"
      >
        <Volume2 className="h-3.5 w-3.5" />
        Listen to this lesson
        <Play className="h-3.5 w-3.5 ml-auto" />
      </button>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Header — always visible when expanded */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Volume2 className="h-3.5 w-3.5" />
          <span className="font-medium">Voice Learning</span>
          {isPlaying && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
              <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-pulse mr-1" />
              Playing
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            {!isPlaying && !isPaused && (
              <Button onClick={handlePlay} size="sm" className="h-9 flex-1">
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Play
              </Button>
            )}
            {isPlaying && (
              <Button onClick={handlePause} size="sm" variant="secondary" className="h-9 flex-1">
                <Pause className="h-3.5 w-3.5 mr-1.5" />
                Pause
              </Button>
            )}
            {isPaused && (
              <Button onClick={handlePlay} size="sm" className="h-9 flex-1">
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Resume
              </Button>
            )}
            <Button onClick={handleStop} size="sm" variant="outline" className="h-9">
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
            <Button onClick={toggleMute} size="sm" variant="outline" className="h-9">
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </Button>
          </div>

          {/* Speed Control — compact inline */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground w-12">Speed</span>
            <Slider
              value={[rate]}
              onValueChange={(values) => setRate(values[0])}
              min={0.5}
              max={2.0}
              step={0.1}
              className="flex-1"
            />
            <span className="text-muted-foreground w-10 text-right">{rate.toFixed(1)}x</span>
          </div>

          {/* Volume Control — compact inline */}
          {!isMuted && (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-muted-foreground w-12">Vol</span>
              <Slider
                value={[volume]}
                onValueChange={(values) => setVolume(values[0])}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <span className="text-muted-foreground w-10 text-right">{Math.round(volume * 100)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
