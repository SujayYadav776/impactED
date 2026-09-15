import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Volume2, 
  Search, 
  X, 
  ExternalLink, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  DictionaryEntry, 
  lookupDictionaryWord, 
  cleanWordForLookup, 
  speakWord 
} from '../utils/dictionary';

interface DictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWord?: string;
}

const SCHOLAR_PRESETS = [
  'epistemology',
  'paradigm',
  'pedagogy',
  'heuristic',
  'empirical',
  'dialectic',
  'synthesis',
  'rhetoric',
  'nuance',
  'cognitive'
];

export default function DictionaryModal({
  isOpen,
  onClose,
  initialWord = ''
}: DictionaryModalProps) {
  const [searchTerm, setSearchTerm] = useState(initialWord);
  const [activeWord, setActiveWord] = useState(initialWord);
  const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      const termToSearch = initialWord || '';
      setSearchTerm(termToSearch);
      setActiveWord(termToSearch);
      if (termToSearch) {
        performLookup(termToSearch);
      } else {
        setEntry(null);
        setHasSearched(false);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialWord]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const performLookup = async (wordToSearch: string) => {
    const cleaned = cleanWordForLookup(wordToSearch);
    if (!cleaned) return;

    setActiveWord(cleaned);
    setLoading(true);
    setHasSearched(true);

    try {
      const result = await lookupDictionaryWord(cleaned);
      setEntry(result);
    } catch (err) {
      console.warn('Dictionary lookup failed:', err);
      setEntry(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      performLookup(searchTerm);
    }
  };

  const handlePronounce = () => {
    if (!activeWord) return;
    setIsSpeaking(true);
    speakWord(activeWord, entry?.audioUrl);
    setTimeout(() => setIsSpeaking(false), 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-stone-900/95 text-stone-100 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden font-sans backdrop-blur-xl z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-stone-950/80 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-stone-100">
                    Scholastic Lexicon
                  </h3>
                  <p className="text-[10px] font-mono text-stone-400">
                    Definitions, phonetic guides &amp; pronunciation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleSubmit} className="p-4 border-b border-stone-800 bg-stone-950/40">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Look up any scholastic term or word..."
                  className="w-full pl-9 pr-20 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-stone-100 text-sm placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
                />
                <button
                  type="submit"
                  disabled={!searchTerm.trim() || loading}
                  className="absolute right-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Lookup
                </button>
              </div>

              {/* Scholastic Presets */}
              <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-2 border-t border-stone-800/60">
                <span className="text-[9.5px] font-mono uppercase text-stone-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Scholastic:</span>
                </span>
                {SCHOLAR_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setSearchTerm(preset);
                      performLookup(preset);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-mono transition-all cursor-pointer ${
                      activeWord.toLowerCase() === preset
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-700 border border-stone-700/60'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </form>

            {/* Results Area */}
            <div className="p-5 max-h-80 overflow-y-auto custom-scrollbar">
              {loading && (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-stone-400">
                  <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-mono">Retrieving academic definition for "{activeWord}"...</p>
                </div>
              )}

              {!loading && entry && (
                <div className="space-y-4">
                  {/* Word Title & Pronounce */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                      <h2 className="text-2xl font-serif font-bold text-stone-100 capitalize">
                        {entry.word}
                      </h2>
                      {entry.phonetic && (
                        <span className="font-mono text-xs text-amber-400">
                          {entry.phonetic}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handlePronounce}
                      className={`p-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSpeaking
                          ? 'bg-amber-500 text-stone-950 scale-105'
                          : 'bg-stone-800 text-stone-200 hover:text-white hover:bg-stone-700 border border-stone-700'
                      }`}
                      title="Pronounce aloud"
                    >
                      <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                      <span className="text-xs font-mono font-bold">Pronounce</span>
                    </button>
                  </div>

                  {/* Meanings */}
                  <div className="space-y-4">
                    {entry.meanings.map((meaning, mIdx) => (
                      <div key={mIdx} className="space-y-2 bg-stone-950/40 p-3.5 rounded-xl border border-stone-800">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10.5px] font-mono italic font-bold uppercase">
                            {meaning.partOfSpeech}
                          </span>
                        </div>

                        <div className="space-y-2 pl-1">
                          {meaning.definitions.map((def, dIdx) => (
                            <div key={dIdx} className="text-xs leading-relaxed text-stone-200 font-sans">
                              <span className="text-stone-400 font-mono mr-1.5">{dIdx + 1}.</span>
                              {def.definition}

                              {def.example && (
                                <p className="text-[11px] text-stone-400 italic font-serif pl-2 border-l-2 border-amber-500/40 mt-1">
                                  "{def.example}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Synonyms */}
                        {meaning.synonyms && meaning.synonyms.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-stone-800/80">
                            <span className="text-[9.5px] font-mono uppercase text-stone-400">Synonyms:</span>
                            {meaning.synonyms.map((syn, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => {
                                  setSearchTerm(syn);
                                  performLookup(syn);
                                }}
                                className="text-[10px] px-1.5 py-0.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded border border-stone-700 font-mono transition-colors cursor-pointer"
                              >
                                {syn}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && hasSearched && !entry && (
                <div className="py-8 text-center space-y-3">
                  <div className="text-sm text-stone-200">
                    No academic definition found for <span className="font-serif italic text-amber-300 font-bold">"{activeWord}"</span>
                  </div>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                    This may be an inflected grammatical form, technical proper noun, or specialized scholastic neologism.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handlePronounce}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Speak Aloud</span>
                    </button>
                    <a
                      href={`https://en.wiktionary.org/wiki/${encodeURIComponent(activeWord.toLowerCase())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
                    >
                      <span>Check Wiktionary</span>
                      <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                    </a>
                  </div>
                </div>
              )}

              {!loading && !hasSearched && (
                <div className="py-8 text-center space-y-2 text-stone-400">
                  <BookOpen className="w-8 h-8 text-stone-600 mx-auto" />
                  <p className="text-xs font-sans">
                    Enter a word or select one of the academic presets above to inspect its scholastic definition.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between text-[10px] font-mono text-stone-400">
              <span>Tip: You can also highlight any word in the article text to define it instantly.</span>
              <button
                type="button"
                onClick={onClose}
                className="hover:text-stone-200 transition-colors cursor-pointer font-bold uppercase"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
