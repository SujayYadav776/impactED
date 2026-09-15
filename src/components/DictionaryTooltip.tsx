import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Volume2, 
  X, 
  ExternalLink, 
  Sparkles, 
  Headphones, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Bookmark,
  Palette
} from 'lucide-react';
import { 
  DictionaryEntry, 
  lookupDictionaryWord, 
  cleanWordForLookup, 
  speakWord, 
  isWordLookupCandidate 
} from '../utils/dictionary';

interface DictionaryTooltipProps {
  selectionRange: {
    text: string;
    x: number;
    y: number;
  };
  onClose: () => void;
  onAddAnnotation: (type: 'highlight' | 'underline' | 'curly-underline' | 'italic' | 'text-color', color?: string) => void;
  onClearAnnotation: () => void;
  onListenPhrase?: (text: string) => void;
  isTtsSupported?: boolean;
}

export default function DictionaryTooltip({
  selectionRange,
  onClose,
  onAddAnnotation,
  onClearAnnotation,
  onListenPhrase,
  isTtsSupported = true
}: DictionaryTooltipProps) {
  const rawText = selectionRange.text;
  const isCandidate = isWordLookupCandidate(rawText);
  const targetWord = cleanWordForLookup(rawText);

  const [loading, setLoading] = useState(isCandidate);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAllMeanings, setShowAllMeanings] = useState(false);
  const [viewMode, setViewMode] = useState<'dictionary' | 'annotate'>(
    isCandidate ? 'dictionary' : 'annotate'
  );

  // Position calculation with screen edge bounds checking
  const [pos, setPos] = useState({ top: 0, left: 0, isBelow: false });

  useEffect(() => {
    const tooltipWidth = 320;
    const tooltipHeight = 240;

    // Viewport boundaries
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default centered on selection
    let left = selectionRange.x;
    // Keep at least 16px padding from screen edges
    const minLeft = tooltipWidth / 2 + 16;
    const maxLeft = viewportWidth - tooltipWidth / 2 - 16;
    left = Math.max(minLeft, Math.min(maxLeft, left));

    // Determine whether to place above or below selection
    // If too close to top (e.g. y < 240), place below the selection
    const isBelow = selectionRange.y < tooltipHeight + 20;
    const top = isBelow ? selectionRange.y + 24 : selectionRange.y - 12;

    setPos({ top, left, isBelow });
  }, [selectionRange]);

  // Load definition whenever target word changes
  useEffect(() => {
    let isMounted = true;

    if (!isCandidate || !targetWord) {
      setLoading(false);
      setEntry(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(false);

    lookupDictionaryWord(targetWord)
      .then((data) => {
        if (!isMounted) return;
        setEntry(data);
        setLoading(false);
        setHasSearched(true);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Dictionary lookup failed:', err);
        setEntry(null);
        setLoading(false);
        setHasSearched(true);
      });

    return () => {
      isMounted = false;
    };
  }, [targetWord, isCandidate]);

  // Listen for Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePronounce = () => {
    if (!targetWord) return;
    setIsSpeaking(true);
    speakWord(targetWord, entry?.audioUrl);
    setTimeout(() => setIsSpeaking(false), 1200);
  };

  const primaryMeaning = entry?.meanings?.[0];
  const primaryDef = primaryMeaning?.definitions?.[0];
  const additionalMeanings = entry?.meanings?.slice(1) || [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: pos.isBelow ? -8 : 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: pos.isBelow ? -8 : 8 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        left: `${pos.left}px`,
        top: `${pos.top}px`,
        transform: pos.isBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
      }}
      className="dictionary-tooltip-container z-50 w-72 sm:w-84 bg-stone-900/95 backdrop-blur-md text-stone-100 border border-stone-700/80 rounded-xl shadow-2xl overflow-hidden font-sans select-none"
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault(); // Prevents browser from deselecting text when clicking inside tooltip
      }}
    >
      {/* HEADER BAR */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-stone-950/70 border-b border-stone-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <BookOpen className="w-3 h-3" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-stone-300 truncate">
            {isCandidate ? 'Scholastic Lexicon' : 'Annotation Tools'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isCandidate && (
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'dictionary' ? 'annotate' : 'dictionary')}
              className="px-2 py-0.5 text-[9.5px] font-mono font-bold uppercase rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Toggle between Definition and Annotation tools"
            >
              {viewMode === 'dictionary' ? 'Annotate' : 'Definition'}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            title="Dismiss tooltip (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      {viewMode === 'dictionary' && isCandidate ? (
        <div className="p-3.5 text-left max-h-64 overflow-y-auto custom-scrollbar">
          {/* Loading State */}
          {loading && (
            <div className="py-5 flex flex-col items-center justify-center gap-2 text-stone-400">
              <div className="w-5 h-5 border-2 border-amber-500/80 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono text-stone-400">Consulting dictionary for "{targetWord}"...</span>
            </div>
          )}

          {/* Loaded Definition */}
          {!loading && entry && (
            <div className="space-y-2.5">
              {/* Word Title, Phonetic & Audio */}
              <div className="flex items-baseline justify-between gap-2 border-b border-stone-800 pb-2">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h4 className="text-base font-serif font-bold text-stone-100 tracking-tight capitalize">
                    {entry.word}
                  </h4>
                  {entry.phonetic && (
                    <span className="font-mono text-xs text-amber-400/90">
                      {entry.phonetic}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handlePronounce}
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${
                    isSpeaking 
                      ? 'bg-amber-500 text-stone-950 scale-105' 
                      : 'bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700'
                  }`}
                  title="Pronounce word aloud"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                </button>
              </div>

              {/* Primary Definition */}
              {primaryMeaning && primaryDef && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono italic font-bold">
                      {primaryMeaning.partOfSpeech}
                    </span>
                  </div>

                  <p className="text-xs text-stone-200 leading-relaxed font-sans">
                    {primaryDef.definition}
                  </p>

                  {primaryDef.example && (
                    <p className="text-[11px] text-stone-400 italic font-serif pl-2 border-l-2 border-amber-500/40 mt-1">
                      "{primaryDef.example}"
                    </p>
                  )}

                  {/* Synonyms Chips */}
                  {primaryMeaning.synonyms && primaryMeaning.synonyms.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[9px] font-mono uppercase text-stone-500">Synonyms:</span>
                      {primaryMeaning.synonyms.slice(0, 3).map((syn, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10px] px-1.5 py-0.2 bg-stone-800 text-stone-300 rounded border border-stone-700 font-mono"
                        >
                          {syn}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Additional Meanings Accordion */}
              {additionalMeanings.length > 0 && (
                <div className="pt-1 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowAllMeanings(!showAllMeanings)}
                    className="w-full flex items-center justify-between text-[10px] font-mono text-amber-400/90 hover:text-amber-300 py-1 cursor-pointer"
                  >
                    <span>{showAllMeanings ? 'Hide alternate meanings' : `+ ${additionalMeanings.length} more meaning${additionalMeanings.length > 1 ? 's' : ''}`}</span>
                    {showAllMeanings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {showAllMeanings && (
                    <div className="space-y-2 pt-1">
                      {additionalMeanings.map((meaning, mIdx) => (
                        <div key={mIdx} className="space-y-1 bg-stone-950/40 p-2 rounded border border-stone-800">
                          <span className="text-[9px] font-mono italic text-amber-300 font-bold uppercase">
                            {meaning.partOfSpeech}
                          </span>
                          <p className="text-[11px] text-stone-300 leading-snug">
                            {meaning.definitions[0]?.definition}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Not Found State */}
          {!loading && hasSearched && !entry && (
            <div className="py-2.5 text-center space-y-2">
              <div className="text-xs text-stone-300">
                No formal entry found for <span className="font-serif italic text-amber-300 font-bold">"{targetWord}"</span>
              </div>
              <p className="text-[10.5px] text-stone-400 leading-relaxed">
                This may be a specialized term, proper noun, or inflected form.
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handlePronounce}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3 h-3 text-amber-400" />
                  <span>Pronounce</span>
                </button>
                <a
                  href={`https://en.wiktionary.org/wiki/${encodeURIComponent(targetWord.toLowerCase())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <span>Wiktionary</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* QUICK ANNOTATION BAR (Always accessible or in annotate view) */}
      <div className="px-3 py-2 bg-stone-950/90 border-t border-stone-800 flex items-center justify-between gap-1.5">
        {/* Highlight Palette */}
        <div className="flex items-center gap-1 pr-1 border-r border-stone-800">
          {Object.entries({
            yellow: 'bg-yellow-300 hover:bg-yellow-400',
            green: 'bg-green-300 hover:bg-green-400',
            blue: 'bg-blue-300 hover:bg-blue-400',
            pink: 'bg-pink-300 hover:bg-pink-400',
            purple: 'bg-purple-300 hover:bg-purple-400',
            orange: 'bg-orange-300 hover:bg-orange-400',
          }).map(([colorName, bgClass]) => (
            <button
              key={colorName}
              type="button"
              onClick={() => onAddAnnotation('highlight', colorName)}
              className={`w-3.5 h-3.5 rounded-full ${bgClass} border border-black/20 hover:scale-125 active:scale-95 transition-transform cursor-pointer`}
              title={`Highlight with ${colorName}`}
            />
          ))}
        </div>

        {/* Styling controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onAddAnnotation('underline')}
            className="p-1 text-stone-300 hover:text-white rounded hover:bg-stone-800 text-xs font-mono font-bold transition-colors cursor-pointer"
            title="Underline text"
          >
            <span className="underline decoration-2 underline-offset-2">U</span>
          </button>

          <button
            type="button"
            onClick={() => onAddAnnotation('curly-underline')}
            className="p-1 text-amber-400 hover:text-amber-300 rounded hover:bg-stone-800 text-xs font-mono font-bold transition-colors cursor-pointer"
            title="Wavy underline"
          >
            <span className="underline decoration-wavy decoration-2 underline-offset-2">~</span>
          </button>

          <button
            type="button"
            onClick={() => onAddAnnotation('italic')}
            className="p-1 text-stone-300 hover:text-white rounded hover:bg-stone-800 text-xs font-serif italic font-bold transition-colors cursor-pointer"
            title="Italicize"
          >
            I
          </button>
        </div>

        {/* TTS Read Selection Aloud */}
        {isTtsSupported && onListenPhrase && (
          <button
            type="button"
            onClick={() => onListenPhrase(rawText)}
            className="p-1 text-emerald-400 hover:text-white rounded hover:bg-stone-800 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
            title="Listen to highlighted text aloud"
          >
            <Headphones className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Clear Annotations */}
        <button
          type="button"
          onClick={onClearAnnotation}
          className="p-1 text-[9.5px] font-mono font-bold text-stone-400 hover:text-red-400 uppercase rounded hover:bg-stone-800 transition-colors cursor-pointer"
          title="Remove highlight on this selection"
        >
          Clear
        </button>
      </div>

      {/* Sub-bar indicator */}
      <div className="px-3 py-1 bg-black/40 text-[9px] font-mono text-stone-400 flex items-center justify-between">
        <span className="truncate">Selected: "{rawText.length > 22 ? rawText.slice(0, 22) + '...' : rawText}"</span>
        {isCandidate && (
          <span className="text-amber-400/90 font-bold shrink-0">Click word to define</span>
        )}
      </div>
    </motion.div>
  );
}
