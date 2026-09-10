import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Article, UserProfile, CATEGORIES, getStudentStats, calculateStreak } from '../types';
import { 
  BookOpen, 
  BookOpenCheck,
  Award,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle,
  FileText,
  Bookmark,
  Trash2,
  Clock3,
  Calendar,
  Layers,
  Activity,
  PlusCircle,
  ThumbsUp,
  MessageSquare,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';

interface AcademicDashboardProps {
  currentUser: UserProfile;
  articles: Article[];
  onSelectArticle: (id: string) => void;
  onEditDraft: (art: Article) => void;
  onDeleteArticle: (id: string) => void;
  onRestoreArticle?: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onWriteEssay: () => void;
}

export default function AcademicDashboard({
  currentUser,
  articles,
  onSelectArticle,
  onEditDraft,
  onDeleteArticle,
  onRestoreArticle,
  onToggleBookmark,
  onWriteEssay
}: AcademicDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'submissions' | 'published' | 'bookmarks' | 'deleted'>('dashboard');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Filter types for published works
  const [publishTypeFilter, setPublishTypeFilter] = useState<'all' | 'essay' | 'blog' | 'article'>('all');

  // Filter student-specific articles
  const studentArticles = articles.filter(a => a.authorId === currentUser.uid);
  const publishedArticles = studentArticles.filter(a => a.status === 'Published');
  const pendingArticles = studentArticles.filter(a => a.status === 'Submitted' || a.status === 'In Review');
  const draftsArticles = studentArticles.filter(a => a.status === 'Draft' || a.status === 'Revision Requested');
  const deletedArticles = studentArticles.filter(a => a.status === 'Deleted');

  // Set default selected article on submissions tab open
  useEffect(() => {
    if (activeTab === 'submissions' && studentArticles.length > 0 && !selectedArticle) {
      // Prefer pending or revision requested, otherwise first available
      const preferred = studentArticles.find(a => a.status === 'Revision Requested' || a.status === 'Submitted' || a.status === 'In Review') || studentArticles[0];
      setSelectedArticle(preferred);
    }
  }, [activeTab]);

  // Timeline calculation of student's own writing
  const getPublicationsByDay = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts: { [key: string]: number } = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    
    studentArticles.forEach(art => {
      if (art.createdAt) {
        const date = new Date(art.createdAt);
        const dayName = days[date.getDay()];
        counts[dayName] = (counts[dayName] || 0) + 1;
      }
    });

    const baseCounts: { [key: string]: number } = { Sun: 0, Mon: 1, Tue: 0, Wed: 1, Thu: 0, Fri: 1, Sat: 0 };
    
    return days.map(day => {
      const realVal = counts[day];
      // If student has no articles, show beautiful baseline, else show actuals
      const displayVal = studentArticles.length > 0 ? realVal : baseCounts[day];
      return {
        day,
        count: displayVal,
        isReal: realVal > 0
      };
    });
  };

  // Calculate reading streak from local storage
  const readingStreak = React.useMemo(() => {
    const userId = currentUser ? currentUser.uid : 'guest';
    const saved = localStorage.getItem(`impactED_read_dates_${userId}`);
    if (saved) {
      try {
        const dates = JSON.parse(saved);
        const streakInfo = calculateStreak(dates);
        return streakInfo.currentStreak;
      } catch (e) {
        return 0;
      }
    }
    return 0;
  }, [currentUser]);

  // Engagement stats calculations
  const totalWords = studentArticles.reduce((sum, a) => sum + (a.wordCount || 0), 0);
  const avgReadingTime = studentArticles.length > 0 
    ? Math.round(studentArticles.reduce((sum, a) => sum + (a.readingTime || 0), 0) / studentArticles.length)
    : 0;

  // Reaction counts received by the student's publications
  const totalReactionsReceived = studentArticles.reduce((sum, a) => {
    const reacts = a.reactions || {};
    return sum + (Object.values(reacts) as number[]).reduce((s, val) => s + (val || 0), 0);
  }, 0);

  // Bookmarks count on current user
  const bookmarksList = articles.filter(art => currentUser.bookmarks?.includes(art.id));

  // Category distribution for progress bars
  const categoryStats = CATEGORIES.map(cat => {
    const count = studentArticles.filter(a => a.category === cat).length;
    const percentage = studentArticles.length > 0 
      ? Math.round((count / studentArticles.length) * 100)
      : 0;
    return { name: cat, count, percentage };
  }).filter(c => c.count > 0 || studentArticles.length === 0);

  // Default baseline if they have no categories written yet
  const displayCategories = studentArticles.length > 0 
    ? categoryStats 
    : [
        { name: 'Science & Tech', percentage: 50, count: 0 },
        { name: 'Opinion & Editorial', percentage: 30, count: 0 },
        { name: 'Global Issues', percentage: 20, count: 0 }
      ];

  // Helper stats computed using pre-existing helper
  const stats = getStudentStats(currentUser.uid, currentUser.role, articles);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-xl p-6 sm:p-8 max-w-5xl mx-auto">
      
      {/* Dashboard Main Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#523624] text-white rounded text-[10px] font-bold uppercase tracking-wider">
              Scholarly Portal
            </span>
            <h2 className="font-display font-bold text-xl text-stone-900">
              impactED Academic Dashboard
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Track your scholarly draft progression, review editorial grader stamps, and view reading statistics.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="text-right text-xs bg-stone-50 p-2.5 rounded-lg border border-stone-100">
            <span className="text-stone-400 font-sans block text-[9px] uppercase tracking-wider font-bold">Student Scholar:</span>
            <span className="font-semibold text-stone-800">{currentUser.displayName}</span>
          </div>
        </div>
      </div>

      {/* Dashboard Navigation Tabs */}
      <div className="flex border-b border-stone-100 gap-2 mb-6 overflow-x-auto select-none scrollbar-none">
        <button
          onClick={() => { setActiveTab('dashboard'); setSelectedArticle(null); }}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'border-emerald-700 text-emerald-700 bg-emerald-500/5' : 'border-transparent text-stone-500 hover:text-stone-800'} flex items-center gap-1.5`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-700" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => { setActiveTab('submissions'); setSelectedArticle(null); }}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${activeTab === 'submissions' ? 'border-emerald-700 text-emerald-700 bg-emerald-500/5' : 'border-transparent text-stone-500 hover:text-stone-800'} flex items-center gap-1.5`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-700" />
          <span>My Submissions Queue ({studentArticles.filter(a => a.status !== 'Deleted').length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('published'); setSelectedArticle(null); }}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${activeTab === 'published' ? 'border-emerald-700 text-emerald-700 bg-emerald-500/5' : 'border-transparent text-stone-500 hover:text-stone-800'} flex items-center gap-1.5`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-700" />
          <span>Published Works ({publishedArticles.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('bookmarks'); setSelectedArticle(null); }}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${activeTab === 'bookmarks' ? 'border-emerald-700 text-emerald-700 bg-emerald-500/5' : 'border-transparent text-stone-500 hover:text-stone-800'} flex items-center gap-1.5`}
        >
          <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
          <span>My Reading List ({bookmarksList.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('deleted'); setSelectedArticle(null); }}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${activeTab === 'deleted' ? 'border-emerald-700 text-emerald-700 bg-emerald-500/5' : 'border-transparent text-stone-500 hover:text-stone-800'} flex items-center gap-1.5`}
        >
          <Trash2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Deleted Works ({deletedArticles.length})</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Welcome Banner Card */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-stone-50 border border-stone-200/60 p-5 rounded-2xl">
            <div>
              <h3 className="font-productsans font-black text-2xl text-stone-900 tracking-tight">
                Academic Progress & Telemetry
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Observe writing timeline contributions, global scholastic reach, and peer stamp reviews.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={onWriteEssay}
                className="w-full md:w-auto bg-[#523624] hover:bg-[#3d2517] text-white rounded-lg flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Write New Blog</span>
              </button>
            </div>
          </div>

          {/* STATS CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Total Submissions */}
            <div className="bg-[#523624] text-[#f4faf7] rounded-2xl p-5 relative flex flex-col justify-between min-h-[140px] border border-[#3d2517] hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-productsans font-bold uppercase tracking-wider text-emerald-200/90">Total Manuscripts</span>
                <span className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-white font-bold text-xs group-hover:scale-110 transition-transform">
                  📝
                </span>
              </div>
              <div className="my-2">
                <strong className="text-3xl font-productsans font-black tracking-tight block">{studentArticles.length}</strong>
              </div>
              <div className="flex items-center gap-1 text-[9.5px] text-emerald-100 font-semibold mt-1 font-productsans">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                <span>{draftsArticles.length} drafts, {pendingArticles.length} in moderation</span>
              </div>
            </div>

            {/* 2. Published Works */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 relative flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-productsans font-bold uppercase tracking-wider text-stone-400">Published Papers</span>
                <span className="w-7 h-7 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 font-bold text-xs group-hover:scale-110 transition-transform">
                  🎓
                </span>
              </div>
              <div className="my-2">
                <strong className="text-3xl font-productsans font-black tracking-tight text-stone-900 block">{publishedArticles.length}</strong>
              </div>
              <div className="flex items-center gap-1 text-[9.5px] text-stone-500 font-semibold mt-1 font-productsans">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Live inside general archive</span>
              </div>
            </div>

            {/* 3. Received Stamps / Stars */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 relative flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-productsans font-bold uppercase tracking-wider text-stone-400">Academic Stamps</span>
                <span className="w-7 h-7 bg-stone-100 rounded-full flex items-center justify-center text-amber-500 font-bold text-xs group-hover:scale-110 transition-transform animate-bounce">
                  ★
                </span>
              </div>
              <div className="my-2">
                <strong className="text-3xl font-productsans font-black tracking-tight text-stone-900 block">{stats.stampsCount}</strong>
              </div>
              <div className="flex items-center gap-1 text-[9.5px] text-emerald-800 font-semibold mt-1 font-productsans">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Approved grade stamps received</span>
              </div>
            </div>

            {/* 4. Reading Streak */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 relative flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-productsans font-bold uppercase tracking-wider text-stone-400">Reading Streak</span>
                <span className="w-7 h-7 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 font-bold text-xs group-hover:scale-110 transition-transform">
                  🔥
                </span>
              </div>
              <div className="my-2">
                <strong className="text-3xl font-productsans font-black tracking-tight text-stone-900 block">
                  {readingStreak} days
                </strong>
              </div>
              <div className="flex items-center gap-1 text-[9.5px] text-stone-500 font-semibold mt-1 font-productsans">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Keep reading to boost stats</span>
              </div>
            </div>
          </div>

          {/* TIMELINE & GAUGE ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Writing Timeline Chart */}
            <div className="lg:col-span-8 flex flex-col justify-between bg-white border border-stone-200 rounded-2xl p-5 shadow-xs min-h-[240px]">
              <div>
                <div className="flex justify-between items-start border-b border-stone-100 pb-2 mb-4">
                  <div>
                    <h4 className="font-productsans font-black text-sm text-stone-950 uppercase tracking-wider">
                      Manuscript Composition Frequency
                    </h4>
                    <p className="text-[10px] text-stone-400 font-sans mt-0.5">
                      Weekly volume distribution of scholarly papers written or uploaded
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-productsans font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    {studentArticles.length > 0 ? "Active Author" : "Baseline Active"}
                  </span>
                </div>

                {/* Highly Stylized SVG Chart mirroring AdminPanel */}
                <div className="w-full h-[150px] bg-white border border-stone-150 rounded-xl px-2 py-1 select-none relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 520 160" preserveAspectRatio="none">
                    <defs>
                      <pattern id="diagonal-stripes-stud" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="10" stroke="#523624" strokeWidth="2.5" opacity="0.85" />
                        <rect width="10" height="10" fill="#523624" opacity="0.1" />
                      </pattern>
                      <linearGradient id="bar-overlay-grad-stud" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#523624" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>

                    {/* Y Axis Grid Lines */}
                    {[0, 1, 2, 3].map((yVal) => {
                      const yPos = 135 - (yVal * 35);
                      return (
                        <g key={yVal}>
                          <line x1="30" y1={yPos} x2="510" y2={yPos} stroke="#f1f1f0" strokeWidth="1" />
                          <text x="22" y={yPos + 3} fill="#a8a29e" fontSize="8" textAnchor="end" className="font-mono font-medium">
                            {yVal}
                          </text>
                        </g>
                      );
                    })}

                    {/* Columns */}
                    {getPublicationsByDay().map((item, idx) => {
                      const colWidth = 475 / 7;
                      const colX = 35 + (idx * colWidth);
                      const maxVal = 3;
                      const itemHeight = (item.count / maxVal) * 105;
                      const barY = 135 - Math.min(115, itemHeight);
                      const barHeight = Math.min(115, itemHeight);
                      const colCenterX = colX + (colWidth / 2);
                      const isHighlighted = item.count > 0;

                      return (
                        <g key={item.day} className="group cursor-pointer">
                          {idx > 0 && (
                            <line x1={colX} y1="10" x2={colX} y2="135" stroke="#e7e5e4" strokeWidth="0.75" strokeDasharray="2 2" />
                          )}

                          {barHeight > 0 && (
                            <>
                              <rect 
                                x={colX + 4} 
                                y={barY} 
                                width={colWidth - 8} 
                                height={barHeight} 
                                fill="url(#diagonal-stripes-stud)" 
                                className="transition-all duration-500 group-hover:opacity-90"
                              />
                              <rect 
                                x={colX + 4} 
                                y={barY} 
                                width={colWidth - 8} 
                                height={barHeight} 
                                fill="url(#bar-overlay-grad-stud)" 
                                pointerEvents="none"
                              />
                              <rect 
                                x={colCenterX - 6} 
                                y={barY - 4} 
                                width="12" 
                                height="2" 
                                rx="1" 
                                fill={isHighlighted ? '#523624' : '#14b8a6'} 
                              />
                            </>
                          )}

                          <text 
                            x={colCenterX} 
                            y="150" 
                            fill={isHighlighted ? '#523624' : '#78716c'} 
                            fontSize="9" 
                            textAnchor="middle" 
                            className={`font-productsans font-bold ${isHighlighted ? 'font-black' : ''}`}
                          >
                            {item.day}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            {/* Publications Success Rate Gauge */}
            <div className="lg:col-span-4">
              {(() => {
                const total = studentArticles.length || 1;
                const published = publishedArticles.length;
                const curationRate = Math.round((published / total) * 100);

                return (
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full min-h-[240px] text-center">
                    <div>
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-3">
                        <span className="text-[10px] font-productsans font-bold text-stone-400 uppercase tracking-wider block text-left">
                          Archival Conversion Rate
                        </span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 font-productsans font-bold px-1.5 py-0.5 rounded">
                          Target 75%
                        </span>
                      </div>

                      {/* Gauge Arch */}
                      <div className="flex flex-col items-center pt-2 pb-1 space-y-2">
                        <div className="relative w-full max-w-[120px]">
                          <svg viewBox="0 0 100 55" className="w-full">
                            <path
                              d="M 10 50 A 40 40 0 0 1 90 50"
                              fill="none"
                              stroke="#f3f4f6"
                              strokeWidth="10"
                              strokeLinecap="round"
                            />
                            <path
                              d="M 10 50 A 40 40 0 0 1 90 50"
                              fill="none"
                              stroke="#523624"
                              strokeWidth="10"
                              strokeLinecap="round"
                              strokeDasharray="125"
                              strokeDashoffset={125 - (125 * curationRate) / 100}
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                        </div>
                        
                        <div className="text-center">
                          <strong className="text-2xl font-productsans font-black text-stone-900 block leading-none">{curationRate}%</strong>
                          <span className="text-[9.5px] font-productsans font-semibold text-stone-450 block uppercase tracking-wider mt-1">Acceptance Progress</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Legend */}
                    <div className="grid grid-cols-3 gap-1 border-t border-stone-100 pt-3 text-[9.5px]">
                      <div>
                        <span className="inline-block w-2 h-2 rounded-full bg-[#523624] mr-1" />
                        <span className="text-stone-500 font-medium">Published</span>
                        <strong className="block text-stone-900 font-bold mt-0.5">{published}</strong>
                      </div>
                      <div>
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />
                        <span className="text-stone-500 font-medium">In Review</span>
                        <strong className="block text-stone-900 font-bold mt-0.5">{pendingArticles.length}</strong>
                      </div>
                      <div>
                        <span className="inline-block w-2 h-2 rounded-full bg-stone-300 mr-1" />
                        <span className="text-stone-500 font-medium">Drafts</span>
                        <strong className="block text-stone-900 font-bold mt-0.5">{draftsArticles.length}</strong>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* BENTO GRID: BINDING CLASSROOM & ENGAGEMENT METRICS */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-100 pb-4">
              <div>
                <h4 className="font-productsans font-black text-lg text-stone-900 tracking-tight">
                  Scholastic Telemetry & Achievements
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Detailed analytics regarding total vocabulary impact, topic dispersion, and unlocked milestone badges.
                </p>
              </div>
              <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Scholar</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Engagement Telemetry */}
              <div className="bg-stone-50/55 border border-stone-150 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <span className="text-[10px] font-productsans font-bold text-stone-400 uppercase tracking-wider block">
                  Vocabulary & Engagement impact
                </span>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-medium">Total Words Authored</span>
                    <strong className="text-lg font-productsans font-bold text-stone-900">{totalWords.toLocaleString()}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-medium">Average Reading Time</span>
                    <strong className="text-lg font-productsans font-bold text-stone-900">{avgReadingTime} min</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-medium">Total Peer Reaction Stamps</span>
                    <strong className="text-lg font-productsans font-bold text-stone-900">{totalReactionsReceived}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-medium">Bookmarks Booked</span>
                    <strong className="text-lg font-productsans font-bold text-stone-900">{bookmarksList.length}</strong>
                  </div>
                </div>
                <div className="border-t border-stone-200/50 pt-3 text-[10px] text-stone-500 font-medium">
                  📈 Average engagement impact is <span className="text-emerald-700 font-semibold">outstanding</span>.
                </div>
              </div>

              {/* Card 2: Personal Milestones (Achieved badges) */}
              <div className="bg-stone-50/55 border border-stone-150 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <span className="text-[10px] font-productsans font-bold text-stone-400 uppercase tracking-wider block">
                  Unlocked Scholastic Badges
                </span>
                <div className="space-y-3">
                  {[
                    { name: 'Prolific Scribe', desc: 'Authored more than 1,000 words', unlocked: totalWords > 1000 },
                    { name: 'Archival Pioneer', desc: 'Successfully published an essay', unlocked: publishedArticles.length > 0 },
                    { name: 'Streak Champion', desc: 'Maintained 3+ days reading streak', unlocked: readingStreak >= 3 },
                    { name: 'Grade Stamp Honoree', desc: 'Earned at least 1 star review', unlocked: stats.stampsCount > 0 },
                  ].map((badge, i) => (
                    <div key={i} className={`flex items-center justify-between text-xs p-1.5 rounded ${badge.unlocked ? 'bg-white border border-stone-200' : 'opacity-40'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {i === 0 ? '✍️' : i === 1 ? '📜' : i === 2 ? '🔥' : '⭐'}
                        </span>
                        <div>
                          <p className="font-semibold text-stone-850">{badge.name}</p>
                          <p className="text-[9px] text-stone-400">{badge.desc}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700">
                        {badge.unlocked ? '✓ Unlocked' : 'Locked'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-stone-200/50 pt-3 text-[10px] text-stone-500 font-medium flex justify-between items-center">
                  <span>Milestone progress</span>
                  <span className="text-[#523624] font-bold">
                    {[totalWords > 1000, publishedArticles.length > 0, readingStreak >= 3, stats.stampsCount > 0].filter(Boolean).length} / 4 Unlocked
                  </span>
                </div>
              </div>

              {/* Card 3: Distribution by Category */}
              <div className="bg-stone-50/55 border border-stone-150 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <span className="text-[10px] font-productsans font-bold text-stone-400 uppercase tracking-wider block">
                  Thematic Distribution
                </span>
                <div className="space-y-3">
                  {displayCategories.map((cat, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-[11px] font-medium text-stone-700">
                        <span>{cat.name}</span>
                        <strong className="font-bold text-stone-900">{cat.percentage}%</strong>
                      </div>
                      <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-700/80 rounded-full transition-all duration-500" 
                          style={{ width: `${cat.percentage}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-stone-200/50 pt-3 text-[10px] text-stone-500 font-medium flex justify-between items-center">
                  <span>Predominant category</span>
                  <span className="text-[#523624] font-bold">
                    {studentArticles.length > 0 
                      ? (categoryStats[0]?.name || 'N/A') 
                      : 'Science & Tech'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: MY SUBMISSIONS QUEUE */}
      {activeTab === 'submissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* Submissions list (5 cols) */}
          <div className="lg:col-span-5 space-y-3 max-h-[500px] overflow-y-auto pr-2 border-r border-stone-100 lg:pr-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              My Submissions & Drafts
            </h3>

            {studentArticles.filter(a => a.status !== 'Deleted').length > 0 ? (
              studentArticles.filter(a => a.status !== 'Deleted').map((art) => (
                <button
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className={`w-full p-4 rounded-xl text-left border transition-all ${selectedArticle?.id === art.id ? 'bg-amber-500/5 border-amber-600 shadow-sm' : 'bg-white border-stone-200 hover:bg-stone-50'}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm inline-block ${
                      art.status === 'Draft' ? 'bg-slate-100 text-slate-700' :
                      art.status === 'Submitted' ? 'bg-blue-100 text-blue-700' :
                      art.status === 'In Review' ? 'bg-yellow-100 text-yellow-700' :
                      art.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {art.status}
                    </span>
                    <span className="text-[9px] text-stone-400">
                      {art.readingTime} min read
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-stone-900 text-xs line-clamp-2 leading-snug">
                    {art.title}
                  </h4>
                  
                  <div className="flex items-center justify-between text-[10px] text-stone-500 mt-2.5">
                    <span className="capitalize">Type: {art.type || 'article'}</span>
                    <span className="font-semibold text-emerald-900">{art.category}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-12 text-stone-400 text-xs font-sans">
                📖 No student drafts found. Click compose above to start!
              </div>
            )}
          </div>

          {/* Submission inspection / review details (7 cols) */}
          <div className="lg:col-span-7">
            {selectedArticle ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                key={selectedArticle.id}
                className="bg-stone-50/50 border border-stone-200 rounded-2xl p-6 space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-150 pb-4">
                  <div>
                    <span className="text-[10px] text-[#0e4d3e] font-bold uppercase tracking-wider block">
                      Manuscript Information
                    </span>
                    <h3 className="font-display font-bold text-sm text-stone-900 mt-0.5">
                      {selectedArticle.title}
                    </h3>
                  </div>
                  
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md ${
                    selectedArticle.status === 'Draft' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                    selectedArticle.status === 'Submitted' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    selectedArticle.status === 'In Review' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                    selectedArticle.status === 'Published' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                    'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {selectedArticle.status}
                  </span>
                </div>

                {/* Editor feedback requested message */}
                {selectedArticle.status === 'Revision Requested' && selectedArticle.rejectionReason && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-stone-800 space-y-1.5">
                    <p className="font-bold flex items-center gap-1.5 text-amber-900">
                      ⚠️ Action Required: Editorial Feedback Recieved
                    </p>
                    <p className="text-stone-700 italic bg-white/70 p-2.5 rounded border border-amber-100/50 leading-relaxed">
                      "{selectedArticle.rejectionReason}"
                    </p>
                    <p className="text-[10px] text-stone-500 leading-tight">
                      Please edit this manuscript incorporating the feedback above and submit again for moderation review.
                    </p>
                  </div>
                )}

                {/* Key stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-stone-200/60 text-xs">
                  <div>
                    <span className="text-stone-400 block font-medium">Category / Subject</span>
                    <strong className="text-stone-800 font-semibold">{selectedArticle.category}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-medium">Vocabulary Count</span>
                    <strong className="text-stone-800 font-semibold">{selectedArticle.wordCount || 0} words</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-medium">Reading Time</span>
                    <strong className="text-stone-800 font-semibold">{selectedArticle.readingTime || 1} min</strong>
                  </div>
                </div>

                {/* Manuscript Summary */}
                <div className="space-y-1 text-xs">
                  <span className="text-stone-400 font-bold uppercase tracking-wider block">
                    Scholastic Summary
                  </span>
                  <p className="text-stone-700 leading-relaxed italic bg-white p-3 rounded-lg border border-stone-150">
                    "{selectedArticle.summary}"
                  </p>
                </div>

                {/* Cover Image Preview */}
                {selectedArticle.coverImage && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Cover image preview:</span>
                    <div className="aspect-[16/6] rounded-xl overflow-hidden border border-stone-200 relative">
                      <img 
                        src={selectedArticle.coverImage} 
                        alt="Article Cover" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-150 pt-5">
                  <button
                    type="button"
                    onClick={() => onDeleteArticle(selectedArticle.id)}
                    className="px-3.5 py-2 hover:bg-red-50 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Draft</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {selectedArticle.status === 'Published' ? (
                      <button
                        type="button"
                        onClick={() => onSelectArticle(selectedArticle.id)}
                        className="px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <span>Open Focus Reader</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onEditDraft(selectedArticle)}
                        className="px-5 py-2.5 bg-[#523624] hover:bg-[#3d2517] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <span>Revise / Edit Manuscript</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[300px] border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-400 p-6 text-center">
                <BookOpen className="w-12 h-12 stroke-1 text-stone-300 mb-3 animate-pulse" />
                <h4 className="font-semibold text-stone-800 text-sm">No Manuscript Selected</h4>
                <p className="text-xs text-stone-400 mt-1 max-w-xs">
                  Select a student manuscript draft or pending entry on the left column to view extensive details.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PUBLISHED WORKS */}
      {activeTab === 'published' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div>
              <h4 className="text-xs font-bold text-stone-800">
                Your Published Scholastic Works
              </h4>
              <p className="text-[10px] text-stone-500 mt-0.5">
                Review and read all of your publications accepted into impactED's permanent digital archive.
              </p>
            </div>

            {/* Filter selection */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-semibold uppercase tracking-wider">
                Type:
              </span>
              <select
                value={publishTypeFilter}
                onChange={(e) => setPublishTypeFilter(e.target.value as any)}
                className="bg-white border border-stone-200 rounded-lg p-1.5 font-semibold text-stone-700 focus:outline-hidden"
              >
                <option value="all">All Types</option>
                <option value="article">Articles</option>
                <option value="essay">Essays</option>
                <option value="blog">Blogs</option>
              </select>
            </div>
          </div>

          {(() => {
            let list = publishedArticles;
            if (publishTypeFilter !== 'all') {
              list = list.filter(a => (a.type || 'article') === publishTypeFilter);
            }

            if (list.length === 0) {
              return (
                <div className="text-center py-14 bg-white border border-stone-200 rounded-xl max-w-md mx-auto">
                  <FileText className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <h4 className="font-semibold text-stone-800 text-sm">No Published Publications</h4>
                  <p className="text-xs text-stone-500 italic mt-1 leading-relaxed px-6">
                    You do not currently have any published works in the scholastic archive classified under "{publishTypeFilter}".
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <AnimatePresence mode="popLayout">
                  {list.map(art => (
                    <motion.div 
                      key={art.id} 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 24 }}
                      className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col justify-between shadow-xs hover:border-[#523624]/30 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-sm tracking-wider ${
                            art.type === 'essay' ? 'bg-emerald-100 text-emerald-800' :
                            art.type === 'blog' ? 'bg-purple-100 text-purple-800' :
                            'bg-[#e2f1e6] text-[#134e29]'
                          }`}>
                            {art.type || 'article'}
                          </span>
                          
                          {/* Mini reactions row */}
                          <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono">
                            <span className="flex items-center gap-0.5" title="Grade Stamps">
                              ⭐ {stats.stampsCount}
                            </span>
                            <span className="flex items-center gap-0.5" title="Reactions">
                              👍 {Object.values(art.reactions || {}).reduce((s, v) => s + (v || 0), 0)}
                            </span>
                          </div>
                        </div>

                        <h5 className="font-productsans font-bold text-xs text-stone-900 truncate">
                          {art.title}
                        </h5>
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 italic">
                          "{art.summary}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-stone-100 pt-3 mt-3.5">
                        <span className="text-[9px] text-stone-450 font-mono">
                          {art.wordCount || 0} words • {art.readingTime || 1} min read
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectArticle(art.id)}
                            className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold rounded transition-colors cursor-pointer"
                          >
                            Read Paper
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => onDeleteArticle(art.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete publication"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 4: STUDY LIST / BOOKMARKS */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-[#fcfbf7] rounded-xl border border-[#d1cfc0]/70 p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-emerald-800 animate-pulse" />
              <h4 className="text-xs font-bold text-stone-800">
                Your Private Study Collection
              </h4>
            </div>
            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider hidden sm:inline">
              Securely curated reading collection
            </span>
          </div>

          {bookmarksList.length === 0 ? (
            <div className="text-center py-14 bg-white border border-dashed border-stone-200 rounded-xl max-w-md mx-auto">
              <Bookmark className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-500 font-serif italic">No scholastic papers bookmarked yet.</p>
              <p className="text-[10px] text-stone-400 mt-1.5 px-6 leading-relaxed">
                Click the bookmark icon on any student paper while reading in the Focus Reader to add pieces to this dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {bookmarksList.map(art => (
                  <motion.div 
                    key={art.id} 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4 }}
                    className="bg-white p-4 border border-stone-200 hover:border-emerald-600 rounded-xl shadow-xs flex flex-col justify-between group cursor-pointer transition-colors duration-200"
                    onClick={() => onSelectArticle(art.id)}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[9px] font-mono uppercase font-bold text-emerald-800 mb-1.5">
                        <span>{art.category}</span>
                        <span className="opacity-70">{art.readingTime} min read</span>
                      </div>
                      <h4 className="font-productsans font-bold text-sm text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                        {art.title}
                      </h4>
                      <p className="text-stone-500 text-xs font-serif line-clamp-2 mt-1 leading-relaxed">
                        {art.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-100 pt-2.5 mt-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-stone-100 text-stone-800 rounded flex items-center justify-center font-bold text-[8px]">
                          {art.authorName.charAt(0)}
                        </div>
                        <span className="text-[10px] font-semibold text-stone-700 truncate max-w-[120px]">
                          {art.authorName}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(art.id);
                        }}
                        className="text-[10px] text-red-600 hover:text-red-800 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DELETED WORKS */}
      {activeTab === 'deleted' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-[#fcfbf7] rounded-xl border border-[#d1cfc0]/70 p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-[#523624]" />
              <h4 className="text-xs font-bold text-stone-800">
                Your Deleted Scholastic Works
              </h4>
            </div>
            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider hidden sm:inline">
              Restore deleted publications to drafts or published works
            </span>
          </div>

          {deletedArticles.length === 0 ? (
            <div className="text-center py-14 bg-white border border-dashed border-stone-200 rounded-xl max-w-md mx-auto">
              <Trash2 className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-500 font-serif italic">Your Deleted Works folder is empty.</p>
              <p className="text-[10px] text-stone-400 mt-1.5 px-6 leading-relaxed">
                When you delete drafts or published manuscripts from your dashboard, they will be preserved here so you can restore them any time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {deletedArticles.map(art => (
                  <motion.div 
                    key={art.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-4 border border-red-100 hover:border-red-300 rounded-xl shadow-xs flex flex-col justify-between transition-colors duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[9px] font-mono uppercase font-bold text-red-700 mb-1.5">
                        <span>{art.category}</span>
                        <span>{art.type || 'article'}</span>
                      </div>
                      <h4 className="font-productsans font-bold text-sm text-stone-800 line-clamp-1">
                        {art.title}
                      </h4>
                      <p className="text-stone-500 text-xs font-serif line-clamp-2 mt-1 leading-relaxed">
                        {art.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-100 pt-2.5 mt-3.5">
                      <span className="text-[9px] text-stone-450 font-mono">
                        {art.wordCount || 0} words
                      </span>
                      {onRestoreArticle && (
                        <button
                          onClick={() => onRestoreArticle(art.id)}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-850 text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
