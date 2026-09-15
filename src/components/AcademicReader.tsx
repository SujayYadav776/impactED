import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Globe, 
  Star, 
  ThumbsUp, 
  Heart, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Type, 
  Sliders, 
  Eye, 
  EyeOff, 
  BookOpen, 
  HelpCircle,
  Play,
  Pause,
  CloudRain,
  Compass,
  Coffee,
  Activity,
  Flame,
  Bookmark,
  Check,
  Headphones,
  Square,
  Printer,
  Download
} from 'lucide-react';
import { Article, UserProfile, ReactionType, getStudentStats } from '../types';
import CommentSection from './CommentSection';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import TextToSpeechPlayer from './TextToSpeechPlayer';
import { downloadArticleAsPdf, printArticleAsPdf, exportArticleAsPdf } from '../utils/pdfExport';
import DictionaryTooltip from './DictionaryTooltip';
import ReadingRibbon from './ReadingRibbon';
import DictionaryModal from './DictionaryModal';

interface Annotation {
  id: string;
  articleId: string;
  text: string;
  type: 'highlight' | 'underline' | 'curly-underline' | 'italic' | 'text-color';
  color?: string; // yellow, green, blue, pink, purple, orange, black, white
}

function renderTextWithAnnotations(
  text: string, 
  articleId: string, 
  annotations: Annotation[],
  onInspectHighlight?: (text: string, rect: DOMRect) => void
) {
  const articleAnnotations = annotations.filter(ann => ann.articleId === articleId && text.includes(ann.text));
  if (articleAnnotations.length === 0) {
    return text;
  }

  // Find unique text substrings that are annotated
  const uniqueTexts = Array.from(new Set(articleAnnotations.map(a => a.text)));
  // Sort by length descending to match larger blocks first
  uniqueTexts.sort((a, b) => b.length - a.length);

  let segments: Array<{ text: string; matchedText?: string }> = [{ text }];

  for (const term of uniqueTexts) {
    const nextSegments: typeof segments = [];
    for (const seg of segments) {
      if (seg.matchedText) {
        nextSegments.push(seg);
        continue;
      }

      let currentIndex = 0;
      const termLen = term.length;

      while (true) {
        const index = seg.text.indexOf(term, currentIndex);
        if (index === -1) {
          nextSegments.push({ text: seg.text.slice(currentIndex) });
          break;
        }

        if (index > currentIndex) {
          nextSegments.push({ text: seg.text.slice(currentIndex, index) });
        }

        nextSegments.push({ text: term, matchedText: term });
        currentIndex = index + termLen;
      }
    }
    segments = nextSegments.filter(s => s.text.length > 0);
  }

  return segments.map((seg, idx) => {
    if (!seg.matchedText) {
      return seg.text;
    }

    // Gather all annotations that apply to this matched text
    const activeAnns = articleAnnotations.filter(ann => ann.text === seg.matchedText);

    let className = 'px-0.5 rounded-sm ';
    let styleTitle = '';

    // Check styles
    const hasHighlight = activeAnns.some(ann => ann.type === 'highlight');
    const hasUnderline = activeAnns.some(ann => ann.type === 'underline');
    const hasCurlyUnderline = activeAnns.some(ann => ann.type === 'curly-underline');
    const hasItalic = activeAnns.some(ann => ann.type === 'italic');
    const textColorAnn = activeAnns.find(ann => ann.type === 'text-color');

    if (hasHighlight) {
      const highlightAnn = activeAnns.find(ann => ann.type === 'highlight');
      const color = highlightAnn?.color || 'yellow';
      const colorStyles: { [key: string]: string } = {
        yellow: 'bg-yellow-200/85 text-stone-900 dark:bg-yellow-500/30 dark:text-yellow-100 border-b border-yellow-300/30',
        green: 'bg-green-200/85 text-stone-900 dark:bg-green-500/30 dark:text-green-100 border-b border-green-300/30',
        blue: 'bg-blue-200/85 text-stone-900 dark:bg-blue-500/30 dark:text-blue-100 border-b border-blue-300/30',
        pink: 'bg-pink-200/85 text-stone-900 dark:bg-pink-500/30 dark:text-pink-100 border-b border-pink-300/30',
        purple: 'bg-purple-200/85 text-stone-900 dark:bg-purple-500/30 dark:text-purple-100 border-b border-purple-300/30',
        orange: 'bg-orange-200/85 text-stone-900 dark:bg-orange-500/30 dark:text-orange-100 border-b border-orange-300/30',
      };
      className += (colorStyles[color] || colorStyles.yellow) + ' ';
      styleTitle += `Highlight: ${color}. `;
    }

    if (hasUnderline) {
      className += 'underline decoration-2 decoration-emerald-600/80 underline-offset-4 font-semibold ';
      styleTitle += 'Underlined. ';
    }

    if (hasCurlyUnderline) {
      className += 'underline decoration-wavy decoration-2 decoration-amber-600/90 underline-offset-4 font-semibold ';
      styleTitle += 'Curly Underlined. ';
    }

    if (hasItalic) {
      className += 'italic ';
      styleTitle += 'Italicized. ';
    }

    if (textColorAnn) {
      if (textColorAnn.color === 'black') {
        className += 'text-stone-950 font-bold dark:text-stone-950 bg-white/90 px-0.5 rounded ';
        styleTitle += 'Text color: Black. ';
      } else if (textColorAnn.color === 'white') {
        className += 'text-white font-bold bg-stone-900/95 dark:bg-stone-900/95 px-1 rounded ';
        styleTitle += 'Text color: White. ';
      }
    }

    return (
      <span 
        key={idx} 
        className={`${className.trim()} ${onInspectHighlight ? 'cursor-pointer hover:opacity-85 transition-opacity' : ''}`} 
        title={`${styleTitle.trim()} (Click to inspect dictionary definition)`}
        onClick={(e) => {
          if (onInspectHighlight) {
            e.stopPropagation();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            onInspectHighlight(seg.text, rect);
          }
        }}
      >
        {seg.text}
      </span>
    );
  });
}

interface AcademicReaderProps {
  activeArticle: Article;
  articles: Article[];
  currentUser: UserProfile | null;
  onBack: () => void;
  onReact: (articleId: string, type: ReactionType) => void;
  onOpenAuth: () => void;
  animatingReaction: { [key: string]: string | null };
  onToggleBookmark?: (articleId: string) => void;
  onFinishReading?: (articleId: string) => void;
}

type ReaderTheme = 'alabaster' | 'warm-paper' | 'sepia' | 'midnight';
type ReaderFont = 'serif' | 'sans' | 'mono';
type ReaderSize = 'sm' | 'md' | 'lg' | 'xl';
type SoundscapeType = 'none' | 'rain' | 'drone' | 'coffee' | 'wind';

export default function AcademicReader({
  activeArticle,
  articles,
  currentUser,
  onBack,
  onReact,
  onOpenAuth,
  animatingReaction,
  onToggleBookmark,
  onFinishReading
}: AcademicReaderProps) {
  // Check if article is bookmarked
  const isBookmarked = useMemo(() => {
    return currentUser?.bookmarks?.includes(activeArticle.id) || false;
  }, [currentUser?.bookmarks, activeArticle.id]);

  // Reading Completion state
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    setHasCompleted(false);
    setScrollProgress(0);

    const resetToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      setIsPastHeader(false);
      if (articleContentRef.current) {
        articleContentRef.current.scrollTop = 0;
      }
    };

    resetToTop();
    const rafId = requestAnimationFrame(resetToTop);
    const timeoutId = setTimeout(resetToTop, 25);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [activeArticle.id]);

  // Mode settings
  const [isMinimalist, setIsMinimalist] = useState(false);
  const [theme, setTheme] = useState<ReaderTheme>('warm-paper');
  const [font, setFont] = useState<ReaderFont>('serif');
  const [size, setSize] = useState<ReaderSize>('md');
  const [showMask, setShowMask] = useState(false);
  const [maskY, setMaskY] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);

  // Audio settings (Ambient Soundscape)
  const [activeSound, setActiveSound] = useState<SoundscapeType>('none');
  const [volume, setVolume] = useState(0.4); // 0 to 1
  const [isPlaying, setIsPlaying] = useState(false);

  // Text-To-Speech (Web Speech API)
  const fullArticleSpokenText = useMemo(() => {
    const summaryPart = activeArticle.summary ? `Abstract. ${activeArticle.summary}.` : '';
    return `${activeArticle.title}. By author ${activeArticle.authorName}, from ${activeArticle.authorSchool}. ${summaryPart} ${activeArticle.content}`;
  }, [activeArticle]);

  const tts = useTextToSpeech();

  // Cleanly stop text-to-speech when changing articles or on unmount
  useEffect(() => {
    tts.stop();
  }, [activeArticle.id]);

  // PDF Export & Download State & Action
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfExportSuccess, setPdfExportSuccess] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfDownloadSuccess, setPdfDownloadSuccess] = useState(false);

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    try {
      setIsDownloadingPdf(true);
      await downloadArticleAsPdf(activeArticle);
      setPdfDownloadSuccess(true);
      setTimeout(() => setPdfDownloadSuccess(false), 3500);
    } catch (error) {
      console.error('Failed to download article as PDF:', error);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrintPdf = async () => {
    if (isExportingPdf) return;
    try {
      setIsExportingPdf(true);
      await printArticleAsPdf(activeArticle);
      setPdfExportSuccess(true);
      setTimeout(() => setPdfExportSuccess(false), 3500);
    } catch (error) {
      console.error('Failed to print article as PDF:', error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportPdf = handleDownloadPdf;

  // Scroll Progress & Reading Ribbon state
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPastHeader, setIsPastHeader] = useState(false);
  const articleContentRef = useRef<HTMLDivElement>(null);
  const articleHeaderRef = useRef<HTMLDivElement>(null);
  const minimalistHeaderRef = useRef<HTMLDivElement>(null);

  // Scholastic Lexicon Dictionary Modal state
  const [isDictionaryModalOpen, setIsDictionaryModalOpen] = useState(false);

  // Annotation States
  const [annotations, setAnnotations] = useState<Annotation[]>(() => {
    try {
      const saved = localStorage.getItem(`greenboard-annotations-${activeArticle.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectionRange, setSelectionRange] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Sync annotations when activeArticle changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`greenboard-annotations-${activeArticle.id}`);
      setAnnotations(saved ? JSON.parse(saved) : []);
    } catch {
      setAnnotations([]);
    }
    setSelectionRange(null);
  }, [activeArticle.id]);

  // Save annotations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`greenboard-annotations-${activeArticle.id}`, JSON.stringify(annotations));
    } catch (err) {
      console.error("Failed to save annotations:", err);
    }
  }, [annotations, activeArticle.id]);

  // Listen for document selection change to hide popover if selection is cleared outside tooltip
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handleGlobalSelectionChange = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          // If active focus is inside dictionary tooltip or user clicked on tooltip, preserve tooltip
          const activeEl = document.activeElement;
          if (!activeEl?.closest('.dictionary-tooltip-container')) {
            setSelectionRange(null);
          }
        }
      }, 180);
    };

    document.addEventListener('selectionchange', handleGlobalSelectionChange);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('selectionchange', handleGlobalSelectionChange);
    };
  }, []);

  const handleInspectHighlight = (text: string, rect: DOMRect) => {
    setSelectionRange({
      text,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleTextSelection = (e: React.MouseEvent) => {
    // If clicking inside dictionary tooltip, ignore
    const target = e.target as HTMLElement;
    if (target && target.closest('.dictionary-tooltip-container')) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length === 0 || selectedText.length > 300) {
      setSelectionRange(null);
      return;
    }

    try {
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rects = range.getClientRects();
        if (rects.length > 0) {
          const rect = rects[0];
          setSelectionRange({
            text: selectedText,
            x: rect.left + rect.width / 2,
            y: rect.top,
          });
        }
      }
    } catch (err) {
      console.error("Error getting selection bounds:", err);
    }
  };

  const handleAddAnnotation = (type: 'highlight' | 'underline' | 'curly-underline' | 'italic' | 'text-color', color?: string) => {
    if (!selectionRange) return;
    const text = selectionRange.text;

    setAnnotations(prev => {
      // Remove any existing annotation of the SAME type on this exact text to avoid duplicate/conflicting types
      const filtered = prev.filter(ann => !(ann.text === text && ann.type === type));
      const newAnn: Annotation = {
        id: `${Date.now()}-${Math.random()}`,
        articleId: activeArticle.id,
        text,
        type,
        color,
      };
      return [...filtered, newAnn];
    });

    // Clear selection
    window.getSelection()?.removeAllRanges();
    setSelectionRange(null);
  };

  const handleClearAnnotation = () => {
    if (!selectionRange) return;
    const text = selectionRange.text;
    setAnnotations(prev => prev.filter(ann => ann.text !== text));
    window.getSelection()?.removeAllRanges();
    setSelectionRange(null);
  };

  // Web Audio Nodes Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeSourcesRef = useRef<any[]>([]);
  const lfoNodeRef = useRef<OscillatorNode | null>(null);

  // Handle Scroll Progress (Minimalist Mode)
  useEffect(() => {
    const handleScroll = () => {
      if (!articleContentRef.current) return;
      const element = articleContentRef.current;
      const totalHeight = element.scrollHeight - element.clientHeight;
      if (totalHeight <= 0) return;
      const progress = (element.scrollTop / totalHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      if (minimalistHeaderRef.current) {
        const rect = minimalistHeaderRef.current.getBoundingClientRect();
        setIsPastHeader(rect.bottom <= 56);
      }

      if (progress >= 88 && !hasCompleted) {
        setHasCompleted(true);
        if (onFinishReading) {
          onFinishReading(activeArticle.id);
        }
      }
    };

    const container = articleContentRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isMinimalist, hasCompleted, activeArticle.id, onFinishReading]);

  // Track page-level scroll when NOT in minimalist mode
  useEffect(() => {
    const handleWindowScroll = () => {
      if (isMinimalist) return;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      if (articleHeaderRef.current) {
        const rect = articleHeaderRef.current.getBoundingClientRect();
        // Ribbon activates when scrolling past the article header
        setIsPastHeader(rect.bottom <= 56);
      }

      if (progress >= 88 && !hasCompleted) {
        setHasCompleted(true);
        if (onFinishReading) {
          onFinishReading(activeArticle.id);
        }
      }
    };

    handleWindowScroll();
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, [isMinimalist, hasCompleted, activeArticle.id, onFinishReading]);

  // Clean up Web Audio on Unmount
  useEffect(() => {
    return () => {
      stopAllSounds();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Update volume on gain node
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current?.currentTime || 0);
    }
  }, [volume]);

  // Sound Engine Methods (Pure browser Web Audio Synthesis)
  const initAudio = () => {
    if (!audioCtxRef.current) {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const stopAllSounds = () => {
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
    if (lfoNodeRef.current) {
      try {
        lfoNodeRef.current.stop();
      } catch (e) {}
      lfoNodeRef.current = null;
    }
  };

  const startSoundscape = (type: SoundscapeType) => {
    initAudio();
    stopAllSounds();

    const ctx = audioCtxRef.current!;
    const dest = masterGainRef.current!;

    if (type === 'none') {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    if (type === 'rain') {
      // ☔ Synthesis of soft organic rain crackles using white noise & lowpass sweeps
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter noise to sound like heavy soft rain drops
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 1200;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 450;
      bandpass.Q.value = 1.2;

      const rainGain = ctx.createGain();
      rainGain.gain.value = 0.85;

      // Connect rain node pipeline
      whiteNoise.connect(lowpass);
      lowpass.connect(bandpass);
      bandpass.connect(rainGain);
      rainGain.connect(dest);

      whiteNoise.start();
      activeSourcesRef.current.push(whiteNoise);

      // Create random raindrop crackles by modulating another noise source rapidly
      const crackleBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
      const crackleOutput = crackleBuffer.getChannelData(0);
      for (let i = 0; i < crackleBuffer.length; i++) {
        // High-pass filter impulse
        crackleOutput[i] = (Math.random() * 2 - 1) * Math.exp(-i / 800);
      }

      // Play rapid random grains
      const triggerGrain = () => {
        if (activeSound !== 'rain' || !audioCtxRef.current) return;
        const grain = ctx.createBufferSource();
        grain.buffer = crackleBuffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2500 + Math.random() * 3000;

        const grainGain = ctx.createGain();
        grainGain.gain.value = 0.08 + Math.random() * 0.15;

        grain.connect(filter);
        filter.connect(grainGain);
        grainGain.connect(dest);
        grain.start();
        
        const nextTime = 50 + Math.random() * 250;
        setTimeout(triggerGrain, nextTime);
      };
      
      triggerGrain();

    } else if (type === 'drone') {
      // 🧘 Binaural oscillation focus drone (110Hz left and 114Hz right, plus ambient sub-bass)
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const oscSub = ctx.createOscillator();

      const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      oscL.type = 'sine';
      oscL.frequency.value = 110; // Warm low A note

      oscR.type = 'sine';
      oscR.frequency.value = 114.5; // Creates an alpha binaural wave of ~4.5Hz

      oscSub.type = 'triangle';
      oscSub.frequency.value = 55; // Sub-octave

      const subFilter = ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.value = 70;

      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.35;

      const subGain = ctx.createGain();
      subGain.gain.value = 0.2;

      // Connect with panning if supported
      if (pannerL && pannerR) {
        pannerL.pan.value = -0.8;
        pannerR.pan.value = 0.8;
        oscL.connect(pannerL).connect(oscGain);
        oscR.connect(pannerR).connect(oscGain);
      } else {
        oscL.connect(oscGain);
        oscR.connect(oscGain);
      }

      oscSub.connect(subFilter).connect(subGain).connect(dest);
      oscGain.connect(dest);

      oscL.start();
      oscR.start();
      oscSub.start();

      activeSourcesRef.current.push(oscL, oscR, oscSub);

    } else if (type === 'coffee') {
      // ☕ Warm vinyl/baking room cafe crackle + low-frequency table chatter synthesis
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Custom bandpass for vinyl crackle style noise
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 0.5;

      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.12;

      // Low-frequency murmur oscillators (several detuned sine waves)
      const oscs = [180, 240, 320, 410].map(freq => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        return osc;
      });

      const filterMurmur = ctx.createBiquadFilter();
      filterMurmur.type = 'lowpass';
      filterMurmur.frequency.value = 150; // Muffly chatter hum

      const murmurGain = ctx.createGain();
      murmurGain.gain.value = 0.45;

      oscs.forEach(osc => {
        osc.connect(filterMurmur);
        osc.start();
        activeSourcesRef.current.push(osc);
      });

      filterMurmur.connect(murmurGain).connect(dest);
      noise.connect(filter).connect(noiseGain).connect(dest);
      noise.start();
      activeSourcesRef.current.push(noise);

    } else if (type === 'wind') {
      // 🍃 Whispering winds: slow dynamic lowpass sweeping on white/pink noise
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Make it pinkish
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
      }

      const pinkNoise = ctx.createBufferSource();
      pinkNoise.buffer = buffer;
      pinkNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 350;
      filter.Q.value = 2.0;

      // LFO to create slow gushing wind swells
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08; // Super slow - 12 seconds per wave

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 180; // Modulate lowpass frequency by +/- 180Hz

      const windGain = ctx.createGain();
      windGain.gain.value = 0.8;

      lfo.connect(lfoGain).connect(filter.frequency);
      pinkNoise.connect(filter).connect(windGain).connect(dest);

      lfo.start();
      pinkNoise.start();

      activeSourcesRef.current.push(pinkNoise);
      lfoNodeRef.current = lfo; // Save so we can stop it specifically
    }
  };

  const handleTogglePlay = () => {
    if (activeSound === 'none') {
      handleSoundChange('rain');
    } else {
      if (isPlaying) {
        stopAllSounds();
        setIsPlaying(false);
      } else {
        startSoundscape(activeSound);
      }
    }
  };

  const handleSoundChange = (sound: SoundscapeType) => {
    setActiveSound(sound);
    if (sound === 'none') {
      stopAllSounds();
      setIsPlaying(false);
    } else {
      startSoundscape(sound);
    }
  };

  // Format Article Content Custom Markdown Helper
  const renderFormattedContent = (txt: string) => {
    return txt.split('\n').map((para, idx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      const isCurrentSpoken = Boolean(
        tts.isSpeaking &&
        tts.currentChunkText &&
        trimmed.length > 10 &&
        (trimmed.toLowerCase().includes(tts.currentChunkText.slice(0, 35).toLowerCase()) ||
         tts.currentChunkText.toLowerCase().includes(trimmed.slice(0, 35).toLowerCase()))
      );

      const spokenHighlightClasses = isCurrentSpoken 
        ? 'ring-2 ring-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/20 border-l-2 border-emerald-600 pl-3 rounded-r transition-all duration-300' 
        : '';

      if (trimmed.startsWith('###')) {
        return (
          <h4 key={idx} className={`font-display font-bold text-lg sm:text-xl text-inherit mt-8 mb-4 border-b border-stone-200/20 pb-2 leading-tight ${spokenHighlightClasses}`}>
            {trimmed.replace('###', '').trim()}
          </h4>
        );
      }
      if (trimmed.startsWith('##')) {
        return (
          <h3 key={idx} className={`font-display font-bold text-xl sm:text-2xl text-inherit mt-10 mb-5 border-b border-stone-300/30 pb-2.5 leading-tight ${spokenHighlightClasses}`}>
            {trimmed.replace('##', '').trim()}
          </h3>
        );
      }
      if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
        return (
          <li key={idx} className={`text-inherit text-base ml-6 list-disc pl-1.5 mb-3 leading-relaxed ${spokenHighlightClasses}`}>
            {renderTextWithAnnotations(trimmed.substring(1).trim(), activeArticle.id, annotations, handleInspectHighlight)}
          </li>
        );
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return (
          <p key={idx} className={`font-bold text-inherit text-md my-5 leading-relaxed ${spokenHighlightClasses}`}>
            {renderTextWithAnnotations(trimmed.replace(/\*\*/g, '').trim(), activeArticle.id, annotations, handleInspectHighlight)}
          </p>
        );
      }
      if (trimmed.startsWith('>')) {
        return (
          <blockquote key={idx} className={`border-l-4 border-amber-500 bg-amber-500/5 px-5 py-4 my-8 text-base italic leading-relaxed text-stone-600 dark:text-stone-300 ${spokenHighlightClasses}`}>
            {renderTextWithAnnotations(trimmed.replace('>', '').trim(), activeArticle.id, annotations, handleInspectHighlight)}
          </blockquote>
        );
      }
      return (
        <p key={idx} className={`text-base mb-6 leading-relaxed text-justify transition-all ${spokenHighlightClasses}`}>
          {renderTextWithAnnotations(trimmed, activeArticle.id, annotations, handleInspectHighlight)}
        </p>
      );
    });
  };

  // Visual classes mapped based on themes
  const themeClasses = {
    'alabaster': 'bg-[#FAF9F6] text-stone-900 border-stone-200',
    'warm-paper': 'bg-[#FDFBF7] text-[#2C2523] border-[#E8E2D9]',
    'sepia': 'bg-[#F4ECD8] text-[#433422] border-[#E4D5B7]',
    'midnight': 'bg-[#0E1111] text-[#E0E0E0] border-[#1F2424]'
  };

  const fontClasses = {
    'serif': 'font-serif tracking-normal font-normal',
    'sans': 'font-sans tracking-wide font-normal',
    'mono': 'font-mono tracking-tight font-medium'
  };

  const sizeClasses = {
    'sm': 'text-sm prose-sm',
    'md': 'text-base prose',
    'lg': 'text-lg prose-lg',
    'xl': 'text-xl prose-xl'
  };

  return (
    <div id="academic-study-workspace" className="min-h-screen flex flex-col">
      
      {/* 1. SCROLL PROGRESS BAR (active when ribbon is hidden) */}
      {!isPastHeader && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-stone-200 z-[100]">
          <div 
            className="h-full bg-amber-600 transition-all duration-75"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* 2. SLENDER GLASSMORPHIC READING RIBBON (activates when scrolling past article header) */}
      <AnimatePresence>
        {isPastHeader && (
          <ReadingRibbon
            article={activeArticle}
            scrollProgress={scrollProgress}
            onBack={onBack}
            isDownloadingPdf={isDownloadingPdf}
            pdfDownloadSuccess={pdfDownloadSuccess}
            onDownloadPdf={handleDownloadPdf}
            isExportingPdf={isExportingPdf}
            pdfExportSuccess={pdfExportSuccess}
            onExportPdf={handleDownloadPdf}
            onPrintPdf={handlePrintPdf}
            onOpenDictionary={() => setIsDictionaryModalOpen(true)}
            tts={tts}
            fullSpokenText={fullArticleSpokenText}
            isBookmarked={isBookmarked}
            onToggleBookmark={() => {
              if (!currentUser) {
                onOpenAuth();
              } else {
                onToggleBookmark?.(activeArticle.id);
              }
            }}
            onScrollToTop={() => {
              if (isMinimalist && articleContentRef.current) {
                articleContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onEnterFocusMode={!isMinimalist ? () => {
              setIsMinimalist(true);
              if (activeSound === 'none') {
                handleSoundChange('rain');
              }
            } : undefined}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isMinimalist ? (
          
          /* ========================================================= */
          /* MINIMALIST DISTRACTION-FREE READ WINDOW                   */
          /* ========================================================= */
          <motion.div
            key="minimalist-deck"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex flex-col overflow-hidden transition-colors duration-300 ${themeClasses[theme]}`}
          >
            {/* MINIMALIST TOP BAR */}
            <div className="px-6 py-3 border-b border-inherit flex items-center justify-between select-none shrink-0 bg-inherit/90 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMinimalist(false)}
                  className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>Exit Focus</span>
                </button>
                <span className="opacity-30">|</span>
                <p className="text-xs font-mono font-bold uppercase truncate max-w-[200px] sm:max-w-xs opacity-80">
                  📖 {activeArticle.title}
                </p>
              </div>

              {/* QUICK STATUS INDICATOR */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Minimalist TTS Pill */}
                {tts.isSupported && (
                  <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-1 rounded-full text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => tts.togglePlayPause(fullArticleSpokenText)}
                      className={`p-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                        tts.isSpeaking && !tts.isPaused
                          ? 'text-emerald-600 font-bold'
                          : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                      }`}
                      title={tts.isSpeaking && !tts.isPaused ? "Pause Speech" : "Listen with Web Speech TTS"}
                    >
                      {tts.isSpeaking && !tts.isPaused ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current text-emerald-600" />
                          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                            Reading {tts.progressPercentage}%
                          </span>
                        </>
                      ) : (
                        <>
                          <Headphones className="w-3.5 h-3.5 text-stone-500 dark:text-stone-300" />
                          <span className="text-[10px] uppercase font-bold">
                            {tts.isPaused ? 'Resume' : 'Listen'}
                          </span>
                        </>
                      )}
                    </button>

                    {tts.isSpeaking && (
                      <button
                        type="button"
                        onClick={tts.stop}
                        className="p-1 text-stone-400 hover:text-red-500 rounded cursor-pointer transition-colors"
                        title="Stop Speech"
                      >
                        <Square className="w-3 h-3 fill-current" />
                      </button>
                    )}
                  </div>
                )}

                {/* Scroll Indicator */}
                <span className="hidden sm:inline font-mono text-[10px] uppercase font-extrabold tracking-widest opacity-60">
                  Read Progress: {Math.round(scrollProgress)}%
                </span>
                
                {/* Minimalist Bookmark Button */}
                {currentUser && (
                  <button
                    onClick={() => onToggleBookmark?.(activeArticle.id)}
                    className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold ${
                      isBookmarked ? 'text-amber-600' : 'opacity-65 hover:opacity-100'
                    }`}
                    title={isBookmarked ? "Saved in Reading List" : "Bookmark Article"}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-wider">
                      {isBookmarked ? 'Saved' : 'Bookmark'}
                    </span>
                  </button>
                )}

                {/* Minimalist PDF Download Button */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold ${
                    pdfDownloadSuccess 
                      ? 'text-emerald-600 font-bold' 
                      : 'opacity-65 hover:opacity-100 hover:text-amber-700'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                  title="Download current manuscript directly as a .PDF file"
                >
                  {isDownloadingPdf ? (
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : pdfDownloadSuccess ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Download className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  )}
                  <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-wider">
                    {isDownloadingPdf ? 'Downloading...' : pdfDownloadSuccess ? 'Downloaded' : 'Download PDF'}
                  </span>
                </button>

                {/* Custom Focus mask toggle */}
                <button
                  onClick={() => setShowMask(!showMask)}
                  className={`p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${showMask ? 'text-amber-600' : 'opacity-60'}`}
                  title="Toggle Visual Focus Mask"
                >
                  {showMask ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* TWO COLUMN MINIMALIST WORKSPACE: LEFT WORKBENCH / RIGHT ESSAY */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* LEFT FLOATING STUDY CONTROLS */}
              <AnimatePresence initial={false}>
                {showSidebar && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 256, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="hidden lg:flex flex-col justify-between border-r border-inherit p-6 shrink-0 bg-black/[0.01] dark:bg-white/[0.01] overflow-y-auto whitespace-nowrap"
                  >
                    <div className="w-52 flex flex-col justify-between h-full space-y-6">
                      <div className="space-y-6">
                        
                        {/* Focus Header */}
                        <div className="flex items-start justify-between">
                          <div className="whitespace-normal">
                            <h3 className="font-mono text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1">Scholar Workbench</h3>
                            <p className="text-xs opacity-70">Tailor your sensory workspace for maximum cognitive retention.</p>
                          </div>
                          <button
                            onClick={() => setShowSidebar(false)}
                            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0 ml-1 mt-0.5"
                            title="Hide Sidebar"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        </div>

                        {/* 1. TYPOGRAPHY SELECTOR */}
                        <div className="space-y-2">
                          <label className="font-mono text-[9px] uppercase font-bold tracking-wider text-stone-400">Library Font</label>
                          <div className="grid grid-cols-3 gap-1 bg-black/5 dark:bg-white/5 p-1 rounded">
                            {(['serif', 'sans', 'mono'] as ReaderFont[]).map(f => (
                              <button
                                key={f}
                                onClick={() => setFont(f)}
                                className={`py-1 text-[10px] font-mono rounded uppercase font-bold transition-all ${
                                  font === f ? 'bg-amber-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                                }`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. TEXT SIZE CONTROL */}
                        <div className="space-y-2">
                          <label className="font-mono text-[9px] uppercase font-bold tracking-wider text-stone-400">Syllable Scale</label>
                          <div className="grid grid-cols-4 gap-1 bg-black/5 dark:bg-white/5 p-1 rounded">
                            {(['sm', 'md', 'lg', 'xl'] as ReaderSize[]).map(s => (
                              <button
                                key={s}
                                onClick={() => setSize(s)}
                                className={`py-1 text-[10px] font-mono rounded uppercase font-bold transition-all ${
                                  size === s ? 'bg-amber-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 3. COLOR BACKGROUND SCHEMES */}
                        <div className="space-y-2">
                          <label className="font-mono text-[9px] uppercase font-bold tracking-wider text-stone-400">Canvas Hue</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'alabaster', name: 'Alabaster' },
                              { id: 'warm-paper', name: 'Book Paper' },
                              { id: 'sepia', name: 'Sepia Dust' },
                              { id: 'midnight', name: 'Midnight' }
                            ].map(sc => (
                              <button
                                key={sc.id}
                                onClick={() => setTheme(sc.id as ReaderTheme)}
                                className={`py-1.5 px-2 text-[10px] rounded border transition-all text-center font-semibold ${
                                  theme === sc.id
                                    ? 'border-amber-600 ring-2 ring-amber-500/20'
                                    : 'border-inherit opacity-70 hover:opacity-100'
                                }`}
                              >
                                {sc.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 4. WEB AUDIO SOUNDSCAPES */}
                        <div className="space-y-3 pt-4 border-t border-inherit">
                          <div className="flex items-center justify-between">
                            <label className="font-mono text-[9px] uppercase font-bold tracking-wider text-stone-400">Focus Soundscape</label>
                            <button
                              onClick={handleTogglePlay}
                              className={`p-1 rounded-full transition-colors ${isPlaying ? 'text-emerald-600 bg-emerald-500/10' : 'text-stone-400 hover:text-stone-600'}`}
                              title="Play / Pause Audio Synthesizer"
                            >
                              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <div className="space-y-1 text-xs">
                            {[
                              { id: 'rain', label: '☔ Rainy Library', icon: CloudRain },
                              { id: 'drone', label: '🧘 Monastery Drone', icon: Compass },
                              { id: 'coffee', label: '☕ Cafe Ambience', icon: Coffee },
                              { id: 'wind', label: '🍃 Forest Wind', icon: Activity },
                              { id: 'none', label: '🔇 Silent Study', icon: VolumeX }
                            ].map(sc => {
                              const Icon = sc.icon;
                              const isCurrent = activeSound === sc.id;
                              return (
                                <button
                                  key={sc.id}
                                  onClick={() => handleSoundChange(sc.id as SoundscapeType)}
                                  className={`w-full p-2 rounded flex items-center justify-between text-left transition-all ${
                                    isCurrent
                                      ? 'bg-amber-600 text-white font-bold'
                                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{sc.label}</span>
                                  </span>
                                  {isCurrent && isPlaying && (
                                    <span className="flex items-center gap-0.5 shrink-0">
                                      <span className="w-1 h-3 bg-white animate-pulse" />
                                      <span className="w-1 h-2 bg-white animate-pulse delay-75" />
                                      <span className="w-1 h-4 bg-white animate-pulse delay-150" />
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Volume Slider */}
                          {activeSound !== 'none' && (
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between text-[9px] font-mono opacity-60">
                                <span>Acoustic Gain:</span>
                                <span>{Math.round(volume * 100)}%</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <VolumeX className="w-3 h-3 opacity-50" />
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.05"
                                  value={volume}
                                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                                  className="w-full h-1 bg-stone-300 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                                />
                                <Volume2 className="w-3 h-3 opacity-50" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 5. TEXT-TO-SPEECH (READ ALOUD) */}
                        <TextToSpeechPlayer
                          tts={tts}
                          fullText={fullArticleSpokenText}
                          articleTitle={activeArticle.title}
                          variant="sidebar"
                        />

                        {/* 6. CLEAN PDF DOWNLOAD & PRINT */}
                        <div className="space-y-2 pt-3 border-t border-inherit">
                          <label className="font-mono text-[9px] uppercase font-bold tracking-wider text-stone-400">
                            Archival Document
                          </label>
                          <div className="flex flex-col gap-1.5">
                            <button
                              type="button"
                              onClick={handleDownloadPdf}
                              disabled={isDownloadingPdf}
                              className={`w-full py-2 px-3 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                                pdfDownloadSuccess
                                  ? 'bg-emerald-600 text-white border border-emerald-700'
                                  : 'bg-amber-600 text-white hover:bg-amber-700 border border-amber-700'
                              } disabled:opacity-40 disabled:cursor-not-allowed`}
                              title="Download manuscript directly as a .PDF file"
                            >
                              {isDownloadingPdf ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Generating PDF...</span>
                                </>
                              ) : pdfDownloadSuccess ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>PDF Downloaded!</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download PDF</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={handlePrintPdf}
                              disabled={isExportingPdf}
                              className="w-full py-1.5 px-3 rounded text-[11px] font-mono font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 text-stone-600 hover:text-stone-900 bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors cursor-pointer"
                              title="Print manuscript or open system print dialog"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print / System Dialog</span>
                            </button>
                          </div>
                        </div>

                        {/* 7. SCHOLASTIC LEXICON / DICTIONARY */}
                        <div className="space-y-2 pt-3 border-t border-inherit">
                          <div className="flex items-center justify-between">
                            <label className="font-mono text-[9px] uppercase font-bold tracking-wider text-stone-400 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                              <span>Lexicon Active</span>
                            </label>
                            <span className="text-[8.5px] font-mono text-amber-600 dark:text-amber-400 font-bold bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/20">
                              Highlight word
                            </span>
                          </div>
                          <p className="text-[11px] opacity-70 leading-relaxed font-sans">
                            Highlight or double-click any word in the manuscript to see its dictionary definition, phonetics, and speech pronunciation.
                          </p>
                        </div>

                      </div>

                      {/* Footer status */}
                      <div className="border-t border-inherit pt-4">
                        <div className="flex items-center gap-2 text-[9px] font-mono uppercase font-bold tracking-widest opacity-60">
                          <Activity className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Focus Loop Live</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Show Sidebar Floating Button when hidden */}
              {!showSidebar && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ scale: 1.05, x: 2 }}
                  onClick={() => setShowSidebar(true)}
                  className="fixed left-4 top-1/2 -translate-y-1/2 z-40 bg-amber-600 hover:bg-amber-700 text-white p-2.5 rounded-r-xl shadow-2xl border border-amber-700/30 flex flex-col items-center gap-2 transition-all cursor-pointer"
                  title="Show Scholar Workbench"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span className="[writing-mode:vertical-lr] text-[9px] font-mono uppercase tracking-widest font-extrabold select-none">
                    Workbench
                  </span>
                </motion.button>
              )}

              {/* CENTRAL ESSAY CANVAS */}
              <div 
                ref={articleContentRef}
                className="flex-1 overflow-y-auto scroll-smooth py-12 px-6 sm:px-12 relative"
                onMouseUp={handleTextSelection}
                onMouseMove={(e) => {
                  if (showMask) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMaskY(e.clientY - rect.top);
                  }
                }}
              >
                {/* Visual Focus Mask overlay */}
                {showMask && (
                  <div 
                    className="absolute inset-x-0 h-28 pointer-events-none transition-all duration-75 mix-blend-difference bg-stone-500/10 dark:bg-stone-100/10 border-y border-amber-500/30 shadow-lg z-10"
                    style={{ top: `${maskY - 56}px` }}
                  />
                )}

                <div className="max-w-2xl mx-auto space-y-8">
                  {/* Category Stamp */}
                  <div className="flex items-center justify-between text-xs font-mono font-bold tracking-widest uppercase opacity-70">
                    <span>Issue Study Paper</span>
                    <span className="text-amber-600">{activeArticle.category}</span>
                  </div>

                  {/* Header details */}
                  <div ref={minimalistHeaderRef} className="space-y-4">
                    {activeArticle.status !== 'Published' && (
                      <div className="p-4 bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5 text-left text-xs text-amber-900 font-sans">
                        <span className="text-lg">🛡️</span>
                        <div>
                          <p className="font-bold uppercase tracking-wider text-[10px] text-amber-800 mb-0.5">
                            Private Submission ({activeArticle.status})
                          </p>
                          <p className="text-stone-600 dark:text-stone-400 font-medium leading-relaxed">
                            This article is currently in <strong>"{activeArticle.status}"</strong> status and is <strong>NOT</strong> published to the general public. Only you and platform moderators can view it.
                          </p>
                        </div>
                      </div>
                    )}

                    <h1 className="font-productsans font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
                      {activeArticle.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs opacity-70 font-mono">
                      <span>By {activeArticle.authorName}</span>
                      <span>&bull;</span>
                      <span>{activeArticle.authorSchool}</span>
                      <span>&bull;</span>
                      <span>{activeArticle.wordCount} words</span>
                    </div>
                  </div>

                  {/* Paragraph spacing controller wrapper */}
                  <div className={`prose max-w-none text-justify pb-16 font-serif ${fontClasses[font]} ${sizeClasses[size]}`}>
                    {renderFormattedContent(activeArticle.content)}
                  </div>
                  
                  {/* Completion check card */}
                  <div className="border-t border-inherit pt-8 pb-12 text-center space-y-4">
                    <p className="font-serif italic text-sm opacity-60">End of scholastic manuscript publication.</p>
                    
                    {/* Automatic Streak Status */}
                    <div className="p-3 bg-stone-100/80 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl max-w-md mx-auto flex items-center justify-center gap-2.5 text-center">
                      <Flame className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                      <p className="text-xs text-stone-600 dark:text-stone-300 font-sans">
                        {hasCompleted 
                          ? "Manuscript completed. Today's reading activity has been automatically saved to your streak."
                          : "Reading activity is automatically recorded to your daily scholastic streak."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsMinimalist(false)}
                      className="px-6 py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-sans text-xs uppercase font-bold tracking-widest cursor-pointer rounded-lg transition-colors"
                    >
                      Exit Focus Reader
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          
          /* ========================================================= */
          /* STANDARD DETAILED VIEW CARD LAYOUT                        */
          /* ========================================================= */
          <motion.div
            key="standard-deck"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
          >
            {/* Top Navigation Row */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2.5">
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-amber-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Library Feed</span>
                <span className="sm:hidden">Back</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Direct Download PDF Action */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className={`px-2.5 sm:px-3 py-1.5 border flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                    pdfDownloadSuccess
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                      : 'bg-white border-stone-300 text-stone-700 hover:text-amber-900 hover:bg-stone-50 hover:border-amber-600/60'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title="Download this manuscript directly as a .PDF file"
                >
                  {isDownloadingPdf ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-stone-400 border-t-amber-700 rounded-full animate-spin" />
                      <span>Downloading PDF...</span>
                    </>
                  ) : pdfDownloadSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-amber-700" />
                      <span className="hidden sm:inline">Download PDF</span>
                      <span className="sm:hidden">Download</span>
                    </>
                  )}
                </button>

                {/* Print / System PDF Action */}
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  disabled={isExportingPdf}
                  className="px-2 sm:px-2.5 py-1.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 flex items-center gap-1 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="Print manuscript or open system print dialog"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-500" />
                  <span className="hidden md:inline">Print</span>
                </button>

                {/* Scholastic Lexicon / Dictionary Quick Action */}
                <button
                  type="button"
                  onClick={() => setIsDictionaryModalOpen(true)}
                  className="px-2.5 sm:px-3 py-1.5 border border-stone-300 text-stone-700 hover:text-amber-900 hover:bg-stone-50 hover:border-amber-600/60 bg-white flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="Search Scholastic Dictionary & Lexicon"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Dictionary</span>
                </button>

                {/* Bookmarking Button */}
                <button
                  onClick={() => {
                    if (!currentUser) {
                      onOpenAuth();
                    } else {
                      onToggleBookmark?.(activeArticle.id);
                    }
                  }}
                  className={`px-2.5 sm:px-3 py-1.5 border flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                    isBookmarked
                      ? 'bg-amber-50 border-amber-600 text-amber-900'
                      : 'bg-white border-stone-300 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                  title={!currentUser ? "Sign in to save to your Reading List" : isBookmarked ? "Saved to Reading List" : "Bookmark Article"}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-amber-700' : ''}`} />
                  <span className="hidden sm:inline">{isBookmarked ? 'Saved to Reading List' : 'Bookmark Article'}</span>
                  <span className="sm:hidden">{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                </button>

                {/* Immersive Focus Mode Entrance Button */}
                <button
                  onClick={() => {
                    setIsMinimalist(true);
                    // Auto launch soft soundscape when entering focusing mode to welcome them!
                    if (activeSound === 'none') {
                      handleSoundChange('rain');
                    }
                  }}
                  className="px-2.5 sm:px-3.5 py-1.5 bg-[#1a1a1a] hover:bg-amber-600 text-[#fdfcf0] text-[10px] sm:text-[11px] font-sans uppercase tracking-widest font-extrabold flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="hidden sm:inline">Enter Focus Reader &amp; Soundscape</span>
                  <span className="sm:hidden">Focus Reader</span>
                </button>
              </div>
            </div>

            {/* Main content wrapper */}
            <div className="bg-white rounded-none border border-[#d1cfc0] overflow-hidden shadow-xs">
              
              {/* Cover Banner */}
              <div className="relative aspect-[21/9] w-full bg-stone-100 border-b border-[#d1cfc0]">
                <img 
                  src={activeArticle.coverImage} 
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] bg-amber-700 text-white font-extrabold uppercase tracking-widest px-3 py-1.5 border border-amber-600">
                    {activeArticle.category}
                  </span>
                </div>
              </div>

              {/* Text-to-Speech Web Speech API Player */}
              <TextToSpeechPlayer
                tts={tts}
                fullText={fullArticleSpokenText}
                articleTitle={activeArticle.title}
                variant="standard"
              />

              {/* Dynamic Reading Quick Control Bar on Standard View */}
              <div className="bg-stone-50 border-b border-[#d1cfc0] p-4 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-stone-400" />
                  <span className="font-mono font-bold text-[10px] uppercase text-stone-500">Quick Ambience</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDictionaryModalOpen(true)}
                    className="hidden sm:flex items-center gap-1.5 text-stone-600 hover:text-amber-800 font-mono text-[11px] pr-2 border-r border-stone-200 transition-colors cursor-pointer"
                    title="Open Scholastic Lexicon & Dictionary lookup"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dictionary Lookup</span>
                  </button>

                  {/* Mini Sound Selectors */}
                  <div className="flex rounded bg-stone-200 p-0.5">
                    {[
                      { id: 'none', label: '🔇 Silent' },
                      { id: 'rain', label: '☔ Rain' },
                      { id: 'drone', label: '🧘 Drone' },
                      { id: 'coffee', label: '☕ Cafe' }
                    ].map(snd => (
                      <button
                        key={snd.id}
                        onClick={() => handleSoundChange(snd.id as SoundscapeType)}
                        className={`px-2 py-1 rounded-sm text-[10px] font-mono font-bold uppercase transition-all ${
                          activeSound === snd.id 
                            ? 'bg-emerald-600 text-white' 
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {snd.label}
                      </button>
                    ))}
                  </div>

                  {activeSound !== 'none' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-16 h-1 bg-stone-300 rounded-lg accent-emerald-600 appearance-none cursor-pointer"
                        title="Adjust Soundscape volume"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Stats */}
              <div ref={articleHeaderRef} className="p-6 sm:p-8 border-b border-[#d1cfc0]">
                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 mb-4 font-mono font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-stone-400" />
                    {activeArticle.readingTime} min read
                  </span>
                  <span className="w-1.5 h-1.5 bg-stone-300 rounded-full" />
                  <span>{activeArticle.wordCount} words</span>
                  <span className="w-1.5 h-1.5 bg-stone-300 rounded-full" />
                  <span className="flex items-center gap-1 text-emerald-800 font-bold uppercase tracking-wider text-[10px]">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    {activeArticle.authorCountry}
                  </span>
                </div>

                {activeArticle.status !== 'Published' && (
                  <div className="mb-6 p-4 bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5 text-left text-xs text-amber-900 font-sans">
                    <span className="text-lg">🛡️</span>
                    <div>
                      <p className="font-bold uppercase tracking-wider text-[10px] text-amber-800 mb-0.5">
                        Private Submission ({activeArticle.status})
                      </p>
                      <p className="text-stone-600 font-medium leading-relaxed">
                        This article is currently in <strong className="text-amber-950">"{activeArticle.status}"</strong> status and is <strong>NOT</strong> published to the general public. Only you (the author) and platform moderators can view it.
                      </p>
                    </div>
                  </div>
                )}

                <h2 className="font-productsans font-bold text-2xl sm:text-3xl text-stone-950 leading-tight mb-6">
                  {activeArticle.title}
                </h2>

                {/* Author Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-none bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 font-bold text-sm font-display flex items-center justify-center">
                      {activeArticle.authorName.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Author Publication By:</p>
                      <p className="text-sm font-bold text-stone-900 mt-0.5">{activeArticle.authorName}</p>
                      <p className="text-xs text-stone-600 font-medium">{activeArticle.authorSchool}</p>
                    </div>
                  </div>

                  {/* Portfolio stats */}
                  {(() => {
                    const { publishedCount, stampsCount } = getStudentStats(activeArticle.authorId, 'student', articles);
                    return (
                      <div className="flex items-center gap-2 self-start sm:self-auto pl-13 sm:pl-0 font-mono">
                        <div className="bg-white px-2.5 py-1 border border-stone-200 text-center">
                          <p className="text-[8px] uppercase tracking-wider font-semibold text-stone-400">Published</p>
                          <p className="text-xs font-bold text-stone-800">📝 {publishedCount} {publishedCount === 1 ? 'paper' : 'papers'}</p>
                        </div>
                        <div className="bg-white px-2.5 py-1 border border-stone-200 text-center">
                          <p className="text-[8px] uppercase tracking-wider font-semibold text-stone-400">Grade Stamps</p>
                          <p className="text-xs font-bold text-emerald-800">⭐ {stampsCount}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Body */}
              <div 
                onMouseUp={handleTextSelection}
                className="p-6 sm:p-10 font-serif prose max-w-none text-stone-800 border-b border-[#d1cfc0] text-justify leading-relaxed academic-notebook-paper"
              >
                {renderFormattedContent(activeArticle.content)}
              </div>

              {/* Reaction Section */}
              <div className="p-6 sm:px-10 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d1cfc0]">
                <div className="text-left">
                  <h4 className="text-xs font-bold uppercase text-stone-500 tracking-wider font-display mb-1">
                    Student Peer Review Grade Stamp
                  </h4>
                  <p className="text-[10px] text-stone-400">Choose a reaction stamp below to review this paper:</p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {(['great', 'like', 'heart', 'wow'] as ReactionType[]).map((type) => {
                    const count = activeArticle.reactions[type] || 0;
                    const isSelected = currentUser && activeArticle.userReactions?.[currentUser.uid] === type;
                    const isAnimating = animatingReaction[activeArticle.id] === type;

                    const details = {
                      great: { icon: Star, label: 'Great Paper ⭐', color: 'text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100/50' },
                      like: { icon: ThumbsUp, label: 'Helpful 👍', color: 'text-blue-600 border-blue-300 bg-blue-100/40 hover:bg-blue-100/80' },
                      heart: { icon: Heart, label: 'Inspiring ❤️', color: 'text-red-600 border-red-300 bg-red-100/40 hover:bg-red-100/80' },
                      wow: { icon: Sparkles, label: 'Mindblown 😮', color: 'text-purple-600 border-purple-300 bg-purple-100/40 hover:bg-purple-100/80' }
                    }[type];

                    const Icon = details.icon;

                    return (
                      <motion.button
                        key={type}
                        onClick={() => onReact(activeArticle.id, type)}
                        whileTap={{ scale: 0.9 }}
                        animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
                        className={`px-3 py-1.5 border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-600 border-emerald-700 text-white scale-105' 
                            : details.color
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : ''}`} />
                        <span className="text-[10.5px]">{details.label}</span>
                        <span className="font-bold opacity-80 border-l pl-1.5">{count}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Article Reading Streak Status */}
              <div className="p-4 bg-stone-50 border-t border-b border-[#d1cfc0] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/25 flex items-center justify-center shrink-0">
                    <Flame className="w-4.5 h-4.5 fill-amber-400 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-stone-800 font-display flex items-center gap-2">
                      <span>{hasCompleted ? "Manuscript Completed" : "Scholastic Reading Tracked"}</span>
                      {hasCompleted && (
                        <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wide flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 stroke-[3px]" /> Recorded
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5 font-sans">
                      {hasCompleted 
                        ? "Today's reading activity has been automatically saved to your daily streak."
                        : "Your reading streak is updated automatically as you read publications."}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Comment Section */}
            <CommentSection 
              articleId={activeArticle.id} 
              currentUser={currentUser} 
              onOpenAuth={onOpenAuth} 
            />

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Dictionary & Annotation Tooltip */}
      <AnimatePresence>
        {selectionRange && (
          <DictionaryTooltip
            selectionRange={selectionRange}
            onClose={() => {
              setSelectionRange(null);
              window.getSelection()?.removeAllRanges();
            }}
            onAddAnnotation={handleAddAnnotation}
            onClearAnnotation={handleClearAnnotation}
            onListenPhrase={(text) => {
              tts.speakSnippet(text);
              setSelectionRange(null);
            }}
            isTtsSupported={tts.isSupported}
          />
        )}
      </AnimatePresence>

      {/* Scholastic Lexicon & Dictionary Modal */}
      <DictionaryModal
        isOpen={isDictionaryModalOpen}
        onClose={() => setIsDictionaryModalOpen(false)}
      />

    </div>
  );
}
