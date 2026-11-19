import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

export interface VoiceMicButtonProps {
  language: 'pt' | 'en';
  value: string;
  onChange: (newValue: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  onError?: (friendlyMessage: string) => void;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

export default function VoiceMicButton({
  language,
  value,
  onChange,
  onListeningChange,
  onError,
  disabled = false,
  maxLength,
  className = '',
}: VoiceMicButtonProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);
  const baseValueRef = useRef('');
  const onChangeRef = useRef(onChange);
  const onListeningChangeRef = useRef(onListeningChange);
  const onErrorRef = useRef(onError);
  const maxLengthRef = useRef(maxLength);

  onChangeRef.current = onChange;
  onListeningChangeRef.current = onListeningChange;
  onErrorRef.current = onError;
  maxLengthRef.current = maxLength;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(Boolean(SpeechRec));
  }, []);

  const stopListening = () => {
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) {
      try {
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.stop();
      } catch {
        // Ignore stop errors if already ended
      }
    }
    setIsListening(false);
    onListeningChangeRef.current?.(false);
  };

  useEffect(() => {
    if (disabled && isListening) {
      stopListening();
    }
  }, [disabled, isListening]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  if (!isSupported) {
    return null;
  }

  const toggleListening = () => {
    if (disabled) return;

    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      const rec = new SpeechRec();
      rec.lang = language === 'pt' ? 'pt-PT' : 'en-US';
      rec.continuous = true;
      rec.interimResults = true;

      baseValueRef.current = value.trim();

      rec.onresult = (event: any) => {
        let spoken = '';
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i]?.[0]?.transcript || '';
          spoken += transcript;
        }
        const trimmedSpoken = spoken.trim();
        const combined = baseValueRef.current
          ? trimmedSpoken
            ? `${baseValueRef.current} ${trimmedSpoken}`
            : baseValueRef.current
          : trimmedSpoken;

        const capped =
          typeof maxLengthRef.current === 'number'
            ? combined.slice(0, maxLengthRef.current)
            : combined;
        onChangeRef.current(capped);
      };

      rec.onerror = (event: any) => {
        const errCode = event?.error;
        if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
          onErrorRef.current?.('Microphone access was blocked. You can type instead.');
        } else if (errCode && errCode !== 'aborted' && errCode !== 'no-speech') {
          console.error('[VoiceMicButton SpeechRecognition Error]:', errCode);
        }
        stopListening();
      };

      rec.onend = () => {
        recognitionRef.current = null;
        setIsListening(false);
        onListeningChangeRef.current?.(false);
      };

      recognitionRef.current = rec;
      setIsListening(true);
      onListeningChangeRef.current?.(true);
      rec.start();
    } catch (startErr: any) {
      console.error('[VoiceMicButton Start Error]:', startErr);
      stopListening();
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
      aria-pressed={isListening}
      title={isListening ? 'Listening... click to stop' : 'Speak your request'}
      className={`p-1.5 rounded-lg border transition-colors shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
        isListening
          ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
          : 'bg-white/5 text-gray-300 border-white/10 hover:text-white hover:bg-white/10'
      } ${className}`}
    >
      {isListening ? (
        <MicOff className="w-3.5 h-3.5" aria-hidden="true" />
      ) : (
        <Mic className="w-3.5 h-3.5" aria-hidden="true" />
      )}
    </button>
  );
}
