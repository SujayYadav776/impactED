import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseTextToSpeechOptions {
  onChunkChange?: (index: number, total: number, chunkText: string) => void;
  onFinished?: () => void;
}

export function cleanMarkdownForSpeech(markdown: string): string {
  if (!markdown) return '';
  return markdown
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, ' ')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove image tags ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Replace headers (# Title) with clean text
    .replace(/^#{1,6}\s+(.*)$/gm, '$1. ')
    // Remove blockquotes (> Quote)
    .replace(/^\s*>\s+(.*)$/gm, '$1')
    // Remove bullet points and numbered lists
    .replace(/^\s*[-*+]\s+(.*)$/gm, '$1. ')
    .replace(/^\s*\d+\.\s+(.*)$/gm, '$1. ')
    // Remove bold/italic asterisks and underscores
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    // Remove strikethrough
    .replace(/~~([^~]+)~~/g, '$1')
    // Remove horizontal rules
    .replace(/^(?:---|\*\*\*|___)\s*$/gm, ' ')
    // Replace multiple newlines or spaces
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitIntoSpeechChunks(text: string): string[] {
  if (!text) return [];
  
  // Split into sentences using punctuation boundaries
  const rawSentences = text
    .split(/(?<=[.?!;:])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of rawSentences) {
    if ((currentChunk + ' ' + sentence).length > 200) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        // If single sentence is itself longer than 200 chars, push it directly
        chunks.push(sentence);
      }
    } else {
      currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

export function useTextToSpeech(options?: UseTextToSpeechOptions) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  const [chunks, setChunks] = useState<string[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);
  
  const [rate, setRateState] = useState<number>(1.0);
  const [pitch, setPitchState] = useState<number>(1.0);

  // References to keep event handlers synchronized
  const chunksRef = useRef<string[]>([]);
  const currentIndexRef = useRef<number>(0);
  const rateRef = useRef<number>(1.0);
  const pitchRef = useRef<number>(1.0);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isManuallyStoppedRef = useRef<boolean>(false);
  const watchdogIntervalRef = useRef<any>(null);

  chunksRef.current = chunks;
  currentIndexRef.current = currentChunkIndex;
  rateRef.current = rate;
  pitchRef.current = pitch;
  selectedVoiceRef.current = selectedVoice;

  // Initialize SpeechSynthesis support and voice list
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);

          // Select preferred voice if none selected
          setSelectedVoice(prev => {
            if (prev) return prev;
            // Prefer natural English voices
            const naturalEn = availableVoices.find(v => 
              v.lang.startsWith('en') && 
              (v.name.toLowerCase().includes('natural') || 
               v.name.toLowerCase().includes('google') ||
               v.name.toLowerCase().includes('samantha') ||
               v.name.toLowerCase().includes('daniel') ||
               v.name.toLowerCase().includes('karen'))
            );
            const standardEn = availableVoices.find(v => v.lang.startsWith('en'));
            const defaultVoice = availableVoices.find(v => v.default);
            return naturalEn || standardEn || defaultVoice || availableVoices[0];
          });
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  // Chrome watchdog to prevent speech synthesis from silently freezing
  useEffect(() => {
    if (isSpeaking && !isPaused) {
      watchdogIntervalRef.current = setInterval(() => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);
    } else {
      if (watchdogIntervalRef.current) {
        clearInterval(watchdogIntervalRef.current);
        watchdogIntervalRef.current = null;
      }
    }

    return () => {
      if (watchdogIntervalRef.current) {
        clearInterval(watchdogIntervalRef.current);
        watchdogIntervalRef.current = null;
      }
    };
  }, [isSpeaking, isPaused]);

  // Speak a specific chunk index
  const speakChunk = useCallback((index: number) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const currentChunks = chunksRef.current;
    if (index < 0 || index >= currentChunks.length) {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentChunkIndex(0);
      options?.onFinished?.();
      return;
    }

    setCurrentChunkIndex(index);
    isManuallyStoppedRef.current = false;

    const textToSpeak = currentChunks[index];
    options?.onChunkChange?.(index, currentChunks.length, textToSpeak);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    }
    utterance.rate = rateRef.current;
    utterance.pitch = pitchRef.current;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utterance.onend = () => {
      if (isManuallyStoppedRef.current) {
        return;
      }
      // Move to next chunk
      const nextIndex = index + 1;
      if (nextIndex < currentChunks.length) {
        speakChunk(nextIndex);
      } else {
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentChunkIndex(0);
        options?.onFinished?.();
      }
    };

    utterance.onerror = (event) => {
      // Ignore 'canceled' or 'interrupted' errors caused by user actions
      if (event.error === 'canceled' || event.error === 'interrupted') {
        return;
      }
      console.warn('SpeechSynthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [options]);

  // Start speaking a full article or raw text
  const startSpeaking = useCallback((rawText: string, startIndex: number = 0) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    isManuallyStoppedRef.current = false;

    const cleaned = cleanMarkdownForSpeech(rawText);
    const speechChunks = splitIntoSpeechChunks(cleaned);

    if (speechChunks.length === 0) return;

    setChunks(speechChunks);
    chunksRef.current = speechChunks;

    const validIndex = Math.max(0, Math.min(startIndex, speechChunks.length - 1));
    speakChunk(validIndex);
  }, [speakChunk]);

  // Speak a standalone phrase or highlighted selection
  const speakSnippet = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    isManuallyStoppedRef.current = false;

    const cleaned = cleanMarkdownForSpeech(text);
    if (!cleaned) return;

    const singleChunk = [cleaned];
    setChunks(singleChunk);
    chunksRef.current = singleChunk;
    speakChunk(0);
  }, [speakChunk]);

  const pause = useCallback(() => {
    if (!window.speechSynthesis) return;
    if (window.speechSynthesis.speaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPaused]);

  const resume = useCallback(() => {
    if (!window.speechSynthesis) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const stop = useCallback(() => {
    if (!window.speechSynthesis) return;
    isManuallyStoppedRef.current = true;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentChunkIndex(0);
  }, []);

  const togglePlayPause = useCallback((fullTextForFallback?: string) => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      if (fullTextForFallback) {
        startSpeaking(fullTextForFallback, 0);
      }
    }
  }, [isSpeaking, isPaused, resume, pause, startSpeaking]);

  const skipNext = useCallback(() => {
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < chunksRef.current.length) {
      speakChunk(nextIdx);
    } else {
      stop();
    }
  }, [speakChunk, stop]);

  const skipPrevious = useCallback(() => {
    const prevIdx = Math.max(0, currentIndexRef.current - 1);
    speakChunk(prevIdx);
  }, [speakChunk]);

  const changeRate = useCallback((newRate: number) => {
    setRateState(newRate);
    rateRef.current = newRate;
    // If currently speaking, restart current chunk with new rate
    if (isSpeaking && !isPaused && chunksRef.current.length > 0) {
      speakChunk(currentIndexRef.current);
    }
  }, [isSpeaking, isPaused, speakChunk]);

  const changePitch = useCallback((newPitch: number) => {
    setPitchState(newPitch);
    pitchRef.current = newPitch;
  }, []);

  const changeVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    setSelectedVoice(voice);
    selectedVoiceRef.current = voice;
    if (isSpeaking && !isPaused && chunksRef.current.length > 0) {
      speakChunk(currentIndexRef.current);
    }
  }, [isSpeaking, isPaused, speakChunk]);

  const progressPercentage = chunks.length > 0 
    ? Math.round(((currentChunkIndex + 1) / chunks.length) * 100) 
    : 0;

  const currentChunkText = chunks[currentChunkIndex] || '';

  return {
    isSupported,
    voices,
    selectedVoice,
    isSpeaking,
    isPaused,
    chunks,
    currentChunkIndex,
    currentChunkText,
    progressPercentage,
    rate,
    pitch,
    startSpeaking,
    speakSnippet,
    pause,
    resume,
    stop,
    togglePlayPause,
    skipNext,
    skipPrevious,
    changeRate,
    changePitch,
    changeVoice,
  };
}
