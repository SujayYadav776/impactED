import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Check, X, ArrowRight } from 'lucide-react';
import { getLocalDateString, calculateStreak, UserProfile } from '../types';

interface ReadingStreakTrackerProps {
  currentUser: UserProfile | null;
  // Triggered when reading activity is detected
  onActivityLogged?: (newStreak: number) => void;
  // Listen to selectedArticleId to trigger activity
  selectedArticleId: string | null;
  // Triggered when a student finishes reading an article to the end
  finishReadingTrigger?: number;
  // Optional callback to scroll to library
  onExploreLibrary?: () => void;
}

export default function ReadingStreakTracker({
  currentUser,
  onActivityLogged,
  selectedArticleId,
  finishReadingTrigger = 0,
  onExploreLibrary
}: ReadingStreakTrackerProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [readDates, setReadDates] = useState<string[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);
  const previousTriggerRef = useRef<number>(finishReadingTrigger);

  // Load read dates on mount and when user changes
  useEffect(() => {
    const userId = currentUser ? currentUser.uid : 'guest';
    const saved = localStorage.getItem(`impactED_read_dates_${userId}`);
    if (saved) {
      try {
        setReadDates(JSON.parse(saved));
      } catch (e) {
        setReadDates([]);
      }
    } else {
      if (userId === 'guest') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterday);
        const initial = [yesterdayStr];
        localStorage.setItem(`impactED_read_dates_guest`, JSON.stringify(initial));
        setReadDates(initial);
      } else {
        setReadDates([]);
      }
    }
  }, [currentUser]);

  // Calculate streak details (current run, all-time record, active today)
  const { currentStreak, longestStreak, activeToday } = useMemo(() => {
    return calculateStreak(readDates);
  }, [readDates]);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowPopover(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowPopover(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Internal helper to automatically log today's reading date
  const autoRecordToday = () => {
    const todayStr = getLocalDateString(new Date());
    const userId = currentUser ? currentUser.uid : 'guest';

    setReadDates(prev => {
      if (prev.includes(todayStr)) return prev;
      const updated = [...prev, todayStr];
      localStorage.setItem(`impactED_read_dates_${userId}`, JSON.stringify(updated));
      const { currentStreak: newStreak } = calculateStreak(updated);
      if (onActivityLogged) onActivityLogged(newStreak);
      return updated;
    });
  };

  // Automatically record when reading completion trigger fires
  useEffect(() => {
    if (finishReadingTrigger > 0 && finishReadingTrigger !== previousTriggerRef.current) {
      previousTriggerRef.current = finishReadingTrigger;
      autoRecordToday();
    }
  }, [finishReadingTrigger]);

  // Automatically record reading activity as soon as an article is opened
  useEffect(() => {
    if (selectedArticleId) {
      autoRecordToday();
    }
  }, [selectedArticleId, currentUser]);

  // Generate last 7 days grid
  const last7Days = useMemo(() => {
    const days = [];
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      
      days.push({
        dateStr,
        dayNumber: d.getDate(),
        dayName: weekdayNames[d.getDay()],
        isToday: i === 0,
        hasRead: readDates.includes(dateStr)
      });
    }
    return days;
  }, [readDates]);

  return (
    <div className="relative" ref={popoverRef}>
      {/* Main Flame Button in Header */}
      <button
        type="button"
        id="header-streak-badge"
        onClick={() => setShowPopover(!showPopover)}
        title="Your Daily Reading Streak"
        aria-label="Reading streak details"
        className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-space font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer border ${
          activeToday
            ? 'bg-[#fcdcb6]/25 hover:bg-[#fcdcb6]/35 text-[#fcdcb6] border-[#fcdcb6]/60 shadow-2xs' 
            : 'bg-white/10 hover:bg-white/15 text-stone-300 border-white/20'
        }`}
      >
        <Flame 
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
            activeToday
              ? 'text-amber-400 fill-amber-300' 
              : 'text-stone-400 fill-stone-200/50'
          }`} 
        />
        <span className="font-space font-bold tracking-tight text-[11px] sm:text-xs">
          {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
        </span>
      </button>

      {/* Clean, Card-Separated Streak Popover */}
      <AnimatePresence>
        {showPopover && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-76 max-w-[calc(100vw-24px)] bg-stone-50 border border-stone-200 shadow-xl rounded-2xl z-50 overflow-hidden text-left"
          >
            {/* Header (CSS selector 1) */}
            <div className="px-3.5 py-3 border-b border-stone-200/80 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  activeToday ? 'bg-amber-100 text-amber-700' : 'bg-stone-200/70 text-stone-400'
                }`}>
                  <Flame className={`w-3.5 h-3.5 ${activeToday ? 'fill-amber-500 text-amber-600' : 'text-stone-400'}`} />
                </div>
                <span className="font-space font-bold text-xs tracking-tight text-stone-900">Reading Streak</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-space font-bold px-2 py-0.5 rounded-full border ${
                  activeToday 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {activeToday ? 'Active' : 'Pending'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPopover(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors cursor-pointer"
                  title="Close streak tracker"
                  aria-label="Close streak tracker"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Content with Distinct Cards (CSS selector 2) */}
            <div className="p-3 space-y-2.5 font-space">
              
              {/* Card 1: Main Metric & Record */}
              <div className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-2xs">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-space text-3xl font-extrabold text-stone-900 tracking-tight">
                        {currentStreak}
                      </span>
                      <span className="font-space text-xs text-stone-600 font-semibold">
                        {currentStreak === 1 ? 'day streak' : 'days streak'}
                      </span>
                    </div>
                    <p className="text-[11px] font-space text-stone-500 mt-0.5 font-normal">
                      {activeToday ? 'Goal completed for today' : 'Read any article to extend'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-space uppercase tracking-wider text-stone-400 block font-bold">
                      Personal Best
                    </span>
                    <span className="text-xs font-space font-bold text-stone-800">
                      {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: 7-Day Activity Matrix */}
              <div className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-[10px] font-space text-stone-400 mb-2">
                  <span className="uppercase tracking-wider text-[9px] font-bold text-stone-500">Last 7 Days</span>
                  <span className="text-stone-700 font-bold text-[10px]">
                    {last7Days.filter(d => d.hasRead).length}/7 active
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {last7Days.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <span className={`text-[9px] font-space font-medium ${
                        day.isToday ? 'font-bold text-amber-800' : 'text-stone-400'
                      }`}>
                        {day.dayName.slice(0, 2)}
                      </span>
                      <div 
                        title={`${day.dateStr}${day.hasRead ? ' - Activity recorded' : day.isToday ? ' - Pending today' : ''}`}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          day.hasRead
                            ? 'bg-amber-600 text-white font-bold shadow-2xs'
                            : day.isToday
                              ? 'border-2 border-dashed border-amber-500 bg-amber-50/60 text-amber-700'
                              : 'bg-stone-100 text-stone-300'
                        }`}
                      >
                        {day.hasRead ? (
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : day.isToday ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        ) : (
                          <span className="w-1 h-1 rounded-full bg-stone-300" />
                        )}
                      </div>
                      <span className={`text-[8.5px] font-space ${
                        day.isToday ? 'font-bold text-amber-900' : 'text-stone-400'
                      }`}>
                        {day.dayNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Status & Action Footer Card */}
              <div className="bg-white rounded-xl px-3 py-2 border border-stone-200/80 shadow-2xs flex items-center justify-between text-[11px]">
                <span className="text-[10px] font-space font-medium text-stone-500">
                  {activeToday ? 'Streak secured today' : 'Auto-updates on read'}
                </span>
                {!activeToday && onExploreLibrary ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowPopover(false);
                      onExploreLibrary();
                    }}
                    className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-950 font-bold font-space text-xs cursor-pointer hover:underline"
                  >
                    <span>Read now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-emerald-700 text-[10.5px] font-space font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[2]" /> All set
                  </span>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

