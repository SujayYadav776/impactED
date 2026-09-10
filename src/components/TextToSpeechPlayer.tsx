import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Headphones, 
  Volume2, 
  Settings2, 
  ChevronDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface TextToSpeechPlayerProps {
  tts: ReturnType<typeof useTextToSpeech>;
  fullText: string;
  articleTitle: string;
  variant?: 'standard' | 'sidebar';
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

export default function TextToSpeechPlayer({
  tts,
  fullText,
  articleTitle,
  variant = 'standard'
}: TextToSpeechPlayerProps) {
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);

  if (!tts.isSupported) {
    return (
      <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-900 rounded">
        Web Speech API is not supported in this browser environment.
      </div>
    );
  }

  // =========================================================================
  // SIDEBAR VARIANT (For Minimalist Focus Mode Workbench)
  // =========================================================================
  if (variant === 'sidebar') {
    return (
      <div className="space-y-3 pt-4 border-t border-inherit">
        <div className="flex items-center justify-between">
          <label className="font-mono text-[9px] uppercase font-bold tracking-wider text-stone-400 flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-emerald-600" />
            <span>Read Aloud (TTS)</span>
          </label>
          {tts.isSpeaking && (
            <span className="text-[9px] font-mono text-emerald-600 font-bold animate-pulse">
              {tts.progressPercentage}%
            </span>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded">
          <button
            type="button"
            onClick={() => tts.togglePlayPause(fullText)}
            className={`flex-1 py-1.5 px-2 rounded text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tts.isSpeaking && !tts.isPaused
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-800 text-white hover:bg-stone-900'
            }`}
            title={tts.isSpeaking && !tts.isPaused ? "Pause Speech" : "Play / Resume Speech"}
          >
            {tts.isSpeaking && !tts.isPaused ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{tts.isPaused ? 'Resume' : 'Listen'}</span>
              </>
            )}
          </button>

          {tts.isSpeaking && (
            <>
              <button
                type="button"
                onClick={tts.skipPrevious}
                disabled={tts.currentChunkIndex === 0}
                className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded text-stone-500 disabled:opacity-30 cursor-pointer transition-colors"
                title="Previous Sentence"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={tts.skipNext}
                disabled={tts.currentChunkIndex >= tts.chunks.length - 1}
                className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded text-stone-500 disabled:opacity-30 cursor-pointer transition-colors"
                title="Next Sentence"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={tts.stop}
                className="p-1.5 hover:bg-red-500/10 text-stone-500 hover:text-red-600 rounded cursor-pointer transition-colors"
                title="Stop Speech"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            </>
          )}
        </div>

        {/* Speed presets */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[9px] font-mono text-stone-400">
            <span>Speech Velocity</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{tts.rate}x</span>
          </div>
          <div className="grid grid-cols-5 gap-1 bg-black/5 dark:bg-white/5 p-1 rounded">
            {SPEED_OPTIONS.map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => tts.changeRate(spd)}
                className={`py-1 text-[9px] font-mono rounded font-bold transition-all cursor-pointer ${
                  tts.rate === spd
                    ? 'bg-emerald-600 text-white'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Voice Selector */}
        {tts.voices.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono uppercase font-bold tracking-wider text-stone-400 flex items-center justify-between">
              <span>Voice Accent</span>
              <span className="text-[8px] opacity-60 font-normal truncate max-w-[90px]">
                {tts.selectedVoice?.name.split(' ')[0] || 'Default'}
              </span>
            </label>
            <div className="relative">
              <select
                value={tts.selectedVoice?.name || ''}
                onChange={(e) => {
                  const found = tts.voices.find(v => v.name === e.target.value);
                  if (found) tts.changeVoice(found);
                }}
                className="w-full text-[10px] font-mono bg-black/5 dark:bg-stone-800 border border-stone-300/40 dark:border-stone-700/60 rounded p-1.5 pr-6 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {tts.voices
                  .filter(v => v.lang.startsWith('en') || v.lang === '')
                  .map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-2.5 opacity-40 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Live speaking snippet */}
        {tts.isSpeaking && tts.currentChunkText && (
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] leading-relaxed text-stone-700 dark:text-stone-300 font-sans italic">
            <span className="font-mono not-italic font-bold text-[8px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
              Active Utterance ({tts.currentChunkIndex + 1}/{tts.chunks.length}):
            </span>
            "{tts.currentChunkText.slice(0, 110)}{tts.currentChunkText.length > 110 ? '...' : ''}"
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // STANDARD VARIANT (For detailed article reading view)
  // =========================================================================
  return (
    <div className="bg-emerald-900/[0.03] border-b border-[#d1cfc0] p-3.5 sm:p-4 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left: Player Title & Main Action */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
            tts.isSpeaking && !tts.isPaused
              ? 'bg-emerald-600 text-white border-emerald-700 animate-pulse'
              : 'bg-white text-emerald-800 border-stone-200'
          }`}>
            <Headphones className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[10px] uppercase tracking-widest text-emerald-900">
                Text-to-Speech Narrator
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                Web Speech API
              </span>
            </div>
            <p className="text-xs text-stone-600 font-sans mt-0.5">
              {tts.isSpeaking 
                ? (tts.isPaused ? 'Narration paused' : 'Narrating scholastic manuscript...') 
                : 'Listen to this paper with browser audio narration'}
            </p>
          </div>
        </div>

        {/* Center / Right: Interactive Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Main Play / Pause / Listen button */}
          <button
            type="button"
            onClick={() => tts.togglePlayPause(fullText)}
            className={`px-3.5 py-2 text-xs font-semibold flex items-center gap-2 rounded transition-all cursor-pointer shadow-xs ${
              tts.isSpeaking && !tts.isPaused
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/30'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            {tts.isSpeaking && !tts.isPaused ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Narration</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                <span>{tts.isPaused ? 'Resume Narration' : 'Listen to Article'}</span>
              </>
            )}
          </button>

          {/* Navigation Controls when speaking */}
          {tts.isSpeaking && (
            <div className="flex items-center gap-1 bg-white border border-stone-200 p-0.5 rounded">
              <button
                type="button"
                onClick={tts.skipPrevious}
                disabled={tts.currentChunkIndex === 0}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded disabled:opacity-30 cursor-pointer transition-colors"
                title="Skip to previous passage"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={tts.skipNext}
                disabled={tts.currentChunkIndex >= tts.chunks.length - 1}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded disabled:opacity-30 cursor-pointer transition-colors"
                title="Skip to next passage"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-4 bg-stone-200 mx-0.5" />

              <button
                type="button"
                onClick={tts.stop}
                className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                title="Stop Narration"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          )}

          {/* Speed Presets */}
          <div className="flex items-center gap-0.5 bg-white border border-stone-200 p-0.5 rounded">
            {SPEED_OPTIONS.map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => tts.changeRate(spd)}
                className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
                  tts.rate === spd
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
                title={`Playback speed ${spd}x`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Voice Selector Settings Toggle */}
          {tts.voices.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowVoiceMenu(!showVoiceMenu)}
                className={`px-2.5 py-1.5 text-xs font-mono border rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showVoiceMenu 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
                title="Voice settings"
              >
                <Settings2 className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-[10px] uppercase font-bold hidden sm:inline">
                  {tts.selectedVoice?.name.split(' ')[0] || 'Voice'}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {showVoiceMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-stone-200 shadow-xl rounded-lg p-3 z-30 select-none text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-stone-600">
                      Narration Voice
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {tts.voices.length} voices
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {tts.voices
                      .filter(v => v.lang.startsWith('en') || v.lang === '')
                      .map((v) => {
                        const isSelected = tts.selectedVoice?.name === v.name;
                        return (
                          <button
                            key={v.name}
                            type="button"
                            onClick={() => {
                              tts.changeVoice(v);
                              setShowVoiceMenu(false);
                            }}
                            className={`w-full text-left p-1.5 rounded text-xs transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200'
                                : 'hover:bg-stone-50 text-stone-700'
                            }`}
                          >
                            <span className="truncate pr-2">{v.name}</span>
                            <span className="text-[9px] font-mono opacity-50 shrink-0 uppercase">{v.lang}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Progress & Live Transcript Bar when active */}
      {tts.isSpeaking && (
        <div className="mt-3 pt-3 border-t border-emerald-900/10 space-y-2">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
            <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Reading Passage {tts.currentChunkIndex + 1} of {tts.chunks.length}
            </span>
            <span className="font-bold text-emerald-700">{tts.progressPercentage}% completed</span>
          </div>

          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${tts.progressPercentage}%` }}
            />
          </div>

          {/* Current Spoken Sentence Highlight Display */}
          {tts.currentChunkText && (
            <div className="p-2 bg-white border border-emerald-200/80 rounded shadow-xs text-xs text-stone-800 font-serif italic text-left">
              <span className="font-mono not-italic font-bold text-[9px] uppercase tracking-wider text-emerald-800 mr-2 bg-emerald-50 px-1 py-0.5 border border-emerald-200">
                Spoken Passage
              </span>
              "{tts.currentChunkText}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
