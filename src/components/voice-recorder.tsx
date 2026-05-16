"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Square, X } from "lucide-react";

interface VoiceRecorderProps {
  onVoiceRecorded: (audioUrl: string, durationSec: number) => void;
  onTranscriptionReady?: (audioUrl: string, transcription: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onVoiceRecorded, onTranscriptionReady, disabled }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      if (typeof MediaRecorder === "undefined") {
        alert("Ваш браузер не поддерживает запись голоса. Используйте Chrome или Safari последней версии.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Safari prefers audio/mp4, others prefer audio/webm
      const mimeType = MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onerror = (e) => {
        console.error("MediaRecorder error:", e);
        setRecording(false);
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        stream.getTracks().forEach((track) => track.stop());
        alert("Ошибка записи. Попробуйте ещё раз.");
      };

      recorder.onstart = () => {
        console.log("[VoiceRecorder] Recording started, mimeType:", mimeType || "default");
      };

      recorder.onstop = () => {
        console.log("[VoiceRecorder] Recording stopped, chunks:", chunksRef.current.length);
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);

        console.log("[VoiceRecorder] Sending voice message, duration:", durationSec);
        // 1. Сразу отправляем в чат (без transcription)
        onVoiceRecorded(url, durationSec);

        // 2. Параллельно транскрибируем
        if (onTranscriptionReady) {
          console.log("[VoiceRecorder] Starting transcription...");
          transcribe(blob)
            .then((text) => {
              console.log("[VoiceRecorder] Transcription ready:", text.slice(0, 50));
              onTranscriptionReady(url, text);
            })
            .catch((err) => {
              console.error("[VoiceRecorder] Transcription failed:", err);
            });
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(100);
      setRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Не удалось получить доступ к микрофону. Проверьте разрешения в браузере.");
    }
  }, [onVoiceRecorded, onTranscriptionReady]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Safari fallback: if onstop doesn't fire within 3s, force it
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          console.warn("[VoiceRecorder] Safari fallback: forcing stop");
          const mimeType = mediaRecorderRef.current.mimeType;
          const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
          const url = URL.createObjectURL(blob);
          const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);
          onVoiceRecorded(url, durationSec);
          if (onTranscriptionReady) {
            transcribe(blob).then((text) => onTranscriptionReady(url, text)).catch(() => {});
          }
          streamRef.current?.getTracks().forEach((track) => track.stop());
          mediaRecorderRef.current = null;
        }
      }, 3000);
    }
  }, [recording, onVoiceRecorded, onTranscriptionReady]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [recording]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (recording) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-mono text-green-600 min-w-[36px]">
          {formatTime(recordingTime)}
        </span>
        <button
          className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-green-100 transition-colors"
          onClick={stopRecording}
          title="Отправить"
        >
          <Square className="w-3.5 h-3.5 text-green-600 fill-red-600" />
        </button>
        <button
          className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-green-100 transition-colors"
          onClick={cancelRecording}
          title="Отмена"
        >
          <X className="w-3.5 h-3.5 text-green-600" />
        </button>
      </div>
    );
  }

  return (
    <button
      className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
      onClick={startRecording}
      disabled={disabled}
      title="Голосовое сообщение"
    >
      <Mic className="w-4 h-4" />
    </button>
  );
}

async function transcribe(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", blob, "voice.webm");
  const res = await fetch("/api/transcribe", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Transcription failed");
  const data = await res.json();
  return data.text || "";
}
