import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'pill' | 'drawer';
  className?: string;
}

export default function ThemeToggle({ variant = 'pill', className = '' }: ThemeToggleProps) {
  const { theme, isDark, toggleTheme } = useTheme();

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center text-[#fcdcb6] hover:bg-white/10 active:scale-95 border border-white/10 ${className}`}
        title={isDark ? 'Switch to Paper theme' : 'Switch to Night-time Reading'}
        aria-label={isDark ? 'Switch to Paper theme' : 'Switch to Night-time Reading'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <Moon className="w-4 h-4 text-amber-300 fill-amber-300/30" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <Sun className="w-4 h-4 text-[#fcdcb6]" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  }

  if (variant === 'drawer') {
    return (
      <div className={`bg-black/25 rounded-xl p-3 border border-white/10 space-y-2 select-none ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#fcdcb6]/70 font-bold">
            Reading Canvas
          </span>
          <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-white/10 text-amber-200">
            {isDark ? 'Night Reading' : 'Paper Theme'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => !isDark || toggleTheme()}
            className={`py-2 px-3 rounded-lg text-xs font-space font-medium flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              !isDark
                ? 'bg-[#fcdcb6] text-[#3d2517] font-bold border-[#fcdcb6] shadow-xs'
                : 'bg-white/5 text-stone-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Paper</span>
          </button>

          <button
            type="button"
            onClick={() => isDark || toggleTheme()}
            className={`py-2 px-3 rounded-lg text-xs font-space font-medium flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              isDark
                ? 'bg-stone-800 text-amber-300 font-bold border-amber-400/40 shadow-xs'
                : 'bg-white/5 text-stone-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Moon className="w-3.5 h-3.5 fill-amber-300/30 text-amber-300" />
            <span>Night Mode</span>
          </button>
        </div>
      </div>
    );
  }

  // Default 'pill' variant for desktop header
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative px-2.5 py-1.5 rounded-full border border-[#fcdcb6]/30 bg-black/20 hover:bg-black/35 hover:border-[#fcdcb6]/60 transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 ${className}`}
      title={isDark ? 'Switch to archival paper theme' : 'Switch to comfortable night-time reading'}
      aria-label={isDark ? 'Switch to archival paper theme' : 'Switch to comfortable night-time reading'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="dark-icon"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300/40" />
            </motion.div>
          ) : (
            <motion.div
              key="paper-icon"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun className="w-3.5 h-3.5 text-[#fcdcb6] group-hover:rotate-45 transition-transform duration-300" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <span className="font-space text-[10.5px] uppercase tracking-wider font-semibold text-[#fcdcb6] hidden lg:inline select-none">
        {isDark ? 'Night' : 'Paper'}
      </span>
    </button>
  );
}
