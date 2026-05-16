"use client";

import { Play, Pause } from "lucide-react";
import { useState, useRef } from "react";

interface VoiceMessageProps {
  audioUrl: string;
  duration?: number;
  transcription?: string;
  textColor?: string;
}

export function VoiceMessage({ audioUrl, duration, transcription, textColor }: VoiceMessageProps) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setPlaying(false);
      audioRef.current.ontimeupdate = () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      };
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const totalDuration = duration || 0;
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="space-y-1.5 min-w-[200px]">
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 hover:bg-white/30 transition-colors"
        >
          {playing ? (
            <Pause className="w-4 h-4 text-current" />
          ) : (
            <Play className="w-4 h-4 text-current ml-0.5" />
          )}
        </button>
        <div className="flex-1">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-current rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-[11px] opacity-70 shrink-0">
          {playing ? formatTime(currentTime) : formatTime(totalDuration)}
        </span>
      </div>
      {transcription && (
        <p className={`text-[12px] leading-relaxed opacity-90 ${textColor || ""}`}>
          {transcription}
        </p>
      )}
    </div>
  );
}
