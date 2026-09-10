import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Check, Trophy, BookOpen, X, Calendar, Clock } from 'lucide-react';
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

  // Generate last 7 days grid (Mon-Sun style past 7 days)
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

  const motivationalQuote = useMemo(() => {
    const quotes = [
      "Rigorous reading forms the foundation of breakthrough writing.",
      "A scholar is built paragraph by paragraph, day by day.",
      "Consistency in literature expands perspective globally.",
      "Engagement with peer research is the spark of academic progress.",
      "Cultivate critical inquiry—keep the intellectual fire burning today!"
    ];
    return quotes[currentStreak % quotes.length];
  }, [currentStreak]);

  return (
    <div className="relative" ref={popoverRef}>
      {/* Main Flame Button in Header */}
      <button
        type="button"
        id="header-streak-badge"
        onClick={() => setShowPopover(!showPopover)}
        title="Your Daily Reading Streak - Automatically updated"
        aria-label="Reading streak details"
        className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer border ${
          activeToday
            ? 'bg-[#fcdcb6]/25 hover:bg-[#fcdcb6]/35 text-[#fcdcb6] border-[#fcdcb6]/60 shadow-xs' 
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
        <span className="font-extrabold tracking-tight text-[11px] sm:text-xs">
          {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
        </span>
      </button>

      {/* Streak Popover Window */}
      <AnimatePresence>
        {showPopover && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 mt-2.5 w-[min(350px,calc(100vw-24px))] bg-white border border-[#d8d3c7] shadow-2xl rounded-2xl z-50 overflow-hidden text-left ring-1 ring-black/10"
          >
            {/* Popover Header */}
            <div className="bg-gradient-to-r from-[#321d12] via-[#482b19] to-[#22130b] p-4 text-white flex items-center justify-between border-b border-[#523624]/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-300" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm tracking-tight text-[#fcdcb6] leading-snug">Reading Streak</h3>
                  <p className="text-[10px] text-stone-300 font-mono leading-none mt-0.5">Automatic Scholastic Tracker</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-mono uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                  activeToday 
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' 
                    : 'bg-amber-500/20 text-amber-200 border-amber-400/40'
                }`}>
                  {activeToday ? 'Active Today' : 'Pending'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPopover(false)}
                  className="p-1 rounded-full text-stone-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                  title="Close streak tracker"
                  aria-label="Close streak tracker"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Popover Body */}
            <div className="p-4 space-y-3.5 bg-[#fcfbf9]">
              
              {/* Streak Stats Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">Current Run</span>
                    <Flame className={`w-3.5 h-3.5 ${activeToday ? 'text-amber-500 fill-amber-400' : 'text-stone-300'}`} />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-productsans text-2xl font-black text-stone-900">{currentStreak}</span>
                    <span className="text-[11px] font-medium text-stone-500">{currentStreak === 1 ? 'day' : 'days'}</span>
                  </div>
                  <p className="text-[9.5px] text-stone-500 font-sans mt-0.5">
                    {activeToday ? 'Maintained today' : 'Read today to maintain'}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">Best Record</span>
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-productsans text-2xl font-black text-stone-900">{longestStreak}</span>
                    <span className="text-[11px] font-medium text-stone-500">{longestStreak === 1 ? 'day' : 'days'}</span>
                  </div>
                  <p className="text-[9.5px] text-stone-500 font-sans mt-0.5">
                    {currentStreak >= longestStreak && longestStreak > 0 ? 'Peak record' : 'Personal best streak'}
                  </p>
                </div>
              </div>

              {/* Weekly Tracker Calendar */}
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-stone-600">Past 7 Days</span>
                  </div>
                  <span className="text-[10px] font-sans text-stone-400">
                    {last7Days.filter(d => d.hasRead).length}/7 Active
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {last7Days.map((day, idx) => (
                    <div key={idx} className="space-y-1">
                      {/* Day Name */}
                      <p className={`text-[9px] font-mono font-bold ${day.isToday ? 'text-amber-800' : 'text-stone-400'}`}>
                        {day.dayName}
                      </p>
                      {/* Activity Circle */}
                      <div 
                        title={`${day.dateStr} - ${day.hasRead ? 'Activity Logged' : day.isToday ? 'Pending Today' : 'No Activity'}`}
                        className={`aspect-square w-8 mx-auto flex items-center justify-center rounded-full border transition-all ${
                          day.hasRead
                            ? 'bg-amber-500 border-amber-600 text-white shadow-xs'
                            : day.isToday
                              ? 'bg-amber-50/70 border-dashed border border-amber-400 text-amber-700'
                              : 'bg-stone-100 border-stone-200 text-stone-400'
                        }`}
                      >
                        {day.hasRead ? (
                          <Check className="w-3.5 h-3.5 stroke-[3px]" />
                        ) : (
                          <span className="text-[10px] font-bold font-mono">
                            {day.dayNumber}
                          </span>
                        )}
                      </div>
                      {/* Day Number Label */}
                      <p className={`text-[8.5px] font-mono leading-none ${day.isToday ? 'text-amber-700 font-bold' : 'text-stone-400'}`}>
                        {day.isToday ? 'Today' : `${day.dayNumber}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automatic Status Notice */}
              {activeToday ? (
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300/60 flex items-center justify-center shrink-0 text-emerald-700">
                    <Check className="w-4 h-4 stroke-[2.5px]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-900 font-productsans">Today's reading recorded</p>
                    <p className="text-[10.5px] text-emerald-700 font-sans mt-0.5">Automatically tracked as you read manuscripts in the library.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300/60 flex items-center justify-center shrink-0 text-amber-800">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950 font-productsans">Today's reading pending</p>
                    <p className="text-[10.5px] text-amber-800 font-sans mt-0.5">Automatically recorded as soon as you open and read any manuscript today.</p>
                  </div>
                </div>
              )}

              {/* Motivational Scholarly Insight */}
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 flex gap-2 items-start text-stone-800">
                <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[10.5px] leading-relaxed italic text-stone-600">
                  "{motivationalQuote}"
                </p>
              </div>

              {/* Footer Hint and Library Navigation */}
              <div className="text-[10px] text-stone-500 border-t border-stone-200/80 pt-2 flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400">Automatic Streak Tracker</span>
                {onExploreLibrary && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowPopover(false);
                      onExploreLibrary();
                    }}
                    className="text-amber-800 hover:text-amber-950 font-bold cursor-pointer underline underline-offset-2 shrink-0 ml-2"
                  >
                    Explore Library →
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

