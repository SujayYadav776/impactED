import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Printer, 
  Download,
  Check, 
  BookOpen, 
  Headphones, 
  Pause, 
  Play, 
  Square, 
  Bookmark, 
  ArrowUp,
  Sliders
} from 'lucide-react';
import { Article } from '../types';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface ReadingRibbonProps {
  article: Article;
  scrollProgress: number;
  onBack: () => void;
  // Quick Actions - PDF Download & Print
  isDownloadingPdf?: boolean;
  pdfDownloadSuccess?: boolean;
  onDownloadPdf?: () => void;
  isExportingPdf?: boolean;
  pdfExportSuccess?: boolean;
  onExportPdf?: () => void;
  onPrintPdf?: () => void;
  onOpenDictionary: () => void;
  // TTS
  tts: ReturnType<typeof useTextToSpeech>;
  fullSpokenText: string;
  // Bookmark
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  // Optional Scroll to top
  onScrollToTop?: () => void;
  onEnterFocusMode?: () => void;
}

export default function ReadingRibbon({
  article,
  scrollProgress,
  onBack,
  isDownloadingPdf = false,
  pdfDownloadSuccess = false,
  onDownloadPdf,
  isExportingPdf = false,
  pdfExportSuccess = false,
  onExportPdf,
  onPrintPdf,
  onOpenDictionary,
  tts,
  fullSpokenText,
  isBookmarked,
  onToggleBookmark,
  onScrollToTop,
  onEnterFocusMode,
}: ReadingRibbonProps) {
  const roundedProgress = Math.round(Math.min(100, Math.max(0, scrollProgress)));

  // SVG Circular Gauge calculations (radius = 10, circumference = 2 * PI * 10 ≈ 62.83)
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (roundedProgress / 100) * circumference;

  return (
    <motion.div
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -64, opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 h-13 sm:h-14 bg-[#1a110a]/90 backdrop-blur-xl border-b border-[#fcdcb6]/20 text-[#fdfcf0] shadow-xl flex items-center justify-between px-3 sm:px-6 select-none font-sans"
    >
      {/* LEFT SECTION: BACK NAVIGATION & ARTICLE TITLE / AUTHOR */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 p-1.5 sm:px-2 sm:py-1 rounded-md text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-xs font-mono font-bold shrink-0"
          title="Return to Library Feed"
        >
          <ChevronLeft className="w-4 h-4 text-[#fcdcb6]" />
          <span className="hidden sm:inline">Library</span>
        </button>

        <div className="h-4 w-px bg-white/20 shrink-0 hidden sm:block" />

        {/* Title & Author Info */}
        <div className="min-w-0 flex items-baseline gap-2">
          <h2 
            className="font-serif font-bold text-xs sm:text-sm text-stone-100 truncate max-w-[130px] sm:max-w-xs md:max-w-md lg:max-w-lg cursor-pointer hover:text-[#fcdcb6] transition-colors"
            title={`${article.title} — click to scroll to top`}
            onClick={onScrollToTop}
          >
            {article.title}
          </h2>
          <span className="hidden md:inline text-[11px] font-mono text-[#fcdcb6]/75 truncate shrink-0">
            by {article.authorName}
          </span>
        </div>
      </div>

      {/* CENTER / PROGRESS GAUGE (Visible on all screens) */}
      <div 
        className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-black/30 border border-white/10 rounded-full shrink-0 cursor-pointer hover:bg-black/50 transition-colors"
        onClick={onScrollToTop}
        title="Reading progress — click to scroll to top"
      >
        <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 -rotate-90" viewBox="0 0 24 24">
            {/* Background ring */}
            <circle
              cx="12"
              cy="12"
              r={radius}
              className="stroke-stone-700/60"
              strokeWidth="2.5"
              fill="transparent"
            />
            {/* Foreground progress */}
            <circle
              cx="12"
              cy="12"
              r={radius}
              className="stroke-amber-500 transition-all duration-150"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
        </div>
        <span className="text-[10px] font-mono font-bold tracking-wider text-stone-200">
          {roundedProgress}%
        </span>
      </div>

      {/* RIGHT SECTION: QUICK-ACTION BUTTONS (PDF, DICTIONARY, TTS, BOOKMARK) */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        
        {/* Mobile Mini Progress text */}
        <span className="sm:hidden font-mono text-[10px] font-bold text-stone-300 mr-1">
          {roundedProgress}%
        </span>

        {/* 1. PDF ACTIONS: DIRECT DOWNLOAD & PRINT */}
        <div className="flex items-center rounded-md bg-black/40 border border-white/10 p-0.5">
          {/* Direct Download PDF */}
          <button
            type="button"
            onClick={onDownloadPdf || onExportPdf}
            disabled={isDownloadingPdf || isExportingPdf}
            className={`px-2 sm:px-2.5 py-1 rounded flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer ${
              pdfDownloadSuccess || pdfExportSuccess
                ? 'bg-emerald-600/90 text-white border border-emerald-400/40'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Download this manuscript directly as a .PDF file"
          >
            {isDownloadingPdf ? (
              <span className="w-3.5 h-3.5 border-2 border-stone-300 border-t-amber-400 rounded-full animate-spin" />
            ) : (pdfDownloadSuccess || pdfExportSuccess) ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <Download className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden md:inline text-[11px] uppercase tracking-wider">
              {isDownloadingPdf ? 'Generating...' : (pdfDownloadSuccess || pdfExportSuccess) ? 'Downloaded' : 'Download PDF'}
            </span>
            <span className="md:hidden text-[11px] uppercase">
              {isDownloadingPdf ? '...' : (pdfDownloadSuccess || pdfExportSuccess) ? 'PDF' : 'PDF'}
            </span>
          </button>

          {/* System Print / Print-to-PDF Dialog */}
          {onPrintPdf && (
            <button
              type="button"
              onClick={onPrintPdf}
              className="p-1 sm:px-1.5 py-1 text-stone-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Print manuscript or open system print dialog"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. DICTIONARY LOOKUP QUICK-ACTION */}
        <button
          type="button"
          onClick={onOpenDictionary}
          className="p-1.5 sm:px-2.5 sm:py-1 rounded-md text-stone-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer"
          title="Open Scholastic Lexicon & Dictionary search"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline text-[11px] uppercase tracking-wider">Dictionary</span>
        </button>

        {/* 3. TEXT-TO-SPEECH (TTS) QUICK-ACTION */}
        {tts.isSupported && (
          <div className="flex items-center rounded-md bg-black/40 border border-white/10 p-0.5">
            <button
              type="button"
              onClick={() => tts.togglePlayPause(fullSpokenText)}
              className={`px-2 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                tts.isSpeaking && !tts.isPaused
                  ? 'text-emerald-400 font-bold bg-emerald-500/15'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
              title={
                tts.isSpeaking && !tts.isPaused
                  ? "Pause Text-to-Speech"
                  : tts.isPaused
                  ? "Resume Text-to-Speech"
                  : "Listen to Article (Text-to-Speech)"
              }
            >
              {tts.isSpeaking && !tts.isPaused ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current text-emerald-400" />
                  <span className="hidden lg:inline text-[10.5px] uppercase tracking-wider text-emerald-300 font-extrabold">
                    {tts.progressPercentage}%
                  </span>
                </>
              ) : (
                <>
                  {tts.isPaused ? (
                    <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                  ) : (
                    <Headphones className="w-3.5 h-3.5 text-stone-300" />
                  )}
                  <span className="hidden lg:inline text-[10.5px] uppercase tracking-wider">
                    {tts.isPaused ? 'Resume' : 'TTS'}
                  </span>
                </>
              )}
            </button>

            {tts.isSpeaking && (
              <button
                type="button"
                onClick={tts.stop}
                className="p-1 text-stone-400 hover:text-red-400 rounded cursor-pointer transition-colors"
                title="Stop Reading"
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            )}
          </div>
        )}

        {/* 4. BOOKMARK QUICK-ACTION */}
        <button
          type="button"
          onClick={onToggleBookmark}
          className={`p-1.5 sm:px-2.5 sm:py-1 rounded-md flex items-center gap-1.5 text-xs font-mono font-bold transition-colors cursor-pointer border ${
            isBookmarked
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'border-transparent hover:border-white/10 text-stone-300 hover:text-white hover:bg-white/10'
          }`}
          title={isBookmarked ? "Saved in Reading List" : "Bookmark Article"}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-amber-400' : ''}`} />
          <span className="hidden lg:inline text-[11px] uppercase tracking-wider">
            {isBookmarked ? 'Saved' : 'Bookmark'}
          </span>
        </button>

        {/* Focus Mode Quick Link (Optional) */}
        {onEnterFocusMode && (
          <button
            type="button"
            onClick={onEnterFocusMode}
            className="hidden xl:flex items-center gap-1 p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-md text-xs font-mono transition-colors cursor-pointer"
            title="Enter Focus Mode"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
          </button>
        )}

        {/* Scroll to top quick button */}
        {onScrollToTop && (
          <button
            type="button"
            onClick={onScrollToTop}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            title="Scroll to Top of Article"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* INTEGRATED SLENDER PROGRESS LINE ON THE BOTTOM LIP OF THE RIBBON */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-stone-900/80 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-400 transition-all duration-75"
          style={{ width: `${roundedProgress}%` }}
        />
      </div>
    </motion.div>
  );
}
