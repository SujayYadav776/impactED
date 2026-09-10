import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Article, UserProfile, CATEGORIES, ReactionType, getStudentStats, CONTINENTS, SiteStats } from './types';
import { firebaseService } from './firebaseService';

// Import Components
import GreenboardHero from './components/GreenboardHero';
import GlobalReachMap from './components/GlobalReachMap';
import ArticleCard from './components/ArticleCard';
import CommentSection from './components/CommentSection';
import ArticleEditor from './components/ArticleEditor';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import AcademicDashboard from './components/AcademicDashboard';
import ReadingStreakTracker from './components/ReadingStreakTracker';
import AcademicReader from './components/AcademicReader';
import HangingTeamCards from './components/HangingTeamCards';
import Loader from './components/Loader';
// @ts-ignore
import emptyLibraryImg from './assets/images/empty_library_1783953130670.jpg';
// @ts-ignore
import scholarHatLogo from './assets/images/impacted_infinity_logo_1785162114538.jpg';

import { 
  BookOpen, 
  Search, 
  PlusCircle, 
  ShieldAlert, 
  LogOut, 
  ChevronLeft, 
  Sparkles, 
  ThumbsUp, 
  Heart, 
  Star, 
  Globe, 
  Award, 
  Clock, 
  BookOpenCheck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  User,
  Bookmark,
  Users,
  ArrowRight,
  Trash2,
  FileText,
  MoreVertical,
  X
} from 'lucide-react';

export default function App() {
  // Session States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // App States
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [isDashboard, setIsDashboard] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [recentlyDeleted, setRecentlyDeleted] = useState<Article | null>(null);

  // Safe notifications and delete confirmation states
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
    action?: { label: string; onClick: () => void };
  } | null>(null);
  const [deleteConfirmArticle, setDeleteConfirmArticle] = useState<Article | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success', action?: { label: string; onClick: () => void }) => {
    setNotification({ message, type, action });
    setTimeout(() => {
      setNotification(prev => prev?.message === message ? null : prev);
    }, action ? 8000 : 4000);
  };
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  // Loaded and seed flag
  const [loading, setLoading] = useState(true);

  // Admin profiles showcase states
  const [adminProfiles, setAdminProfiles] = useState<UserProfile[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);

  // Reaction Animation trigger states
  const [animatingReaction, setAnimatingReaction] = useState<{ [id: string]: ReactionType | null }>({});

  // Dashboard Sub-Tab & Filter States
  const [dashboardTab, setDashboardTab] = useState<'submissions' | 'published'>('submissions');
  const [dashboardPublishTypeFilter, setDashboardPublishTypeFilter] = useState<'all' | 'essay' | 'blog' | 'article'>('all');

  // Reading Completion & Streak Tracker Trigger
  const [finishReadingTrigger, setFinishReadingTrigger] = useState<number>(0);

  // Site Analytics & Visits state
  const [siteStats, setSiteStats] = useState<SiteStats>({
    totalVisits: 0,
    totalActiveReaders: 0,
    weeklyReadingHours: 0,
    lastUpdated: Date.now()
  });

  // Mobile library expansion state (show 3 articles initially on mobile)
  const [isMobileLibraryExpanded, setIsMobileLibraryExpanded] = useState<boolean>(false);

  const handleFinishReading = (articleId: string) => {
    setFinishReadingTrigger(prev => prev + 1);
  };

  const handleSelectArticle = (id: string) => {
    setSelectedArticleId(id);
    setIsWriting(false);
    setIsAdminPortal(false);
    setIsDashboard(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    firebaseService.incrementArticleViews(id).then(() => {
      loadArticles();
    });
  };

  useEffect(() => {
    if (selectedArticleId) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [selectedArticleId]);

  useEffect(() => {
    // Initializing & Seeding DB
    const bootstrap = async () => {
      setLoading(true);
      try {
        await firebaseService.seedDatabaseIfEmpty();
        
        // Restore session if exists
        const savedUser = localStorage.getItem('impactED_current_user');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }

        const visitedStats = await firebaseService.recordVisit();
        setSiteStats(visitedStats);

        await loadArticles();
        await loadAdmins();
      } catch (err) {
        console.error("Failed to seed or boot:", err);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();

    const unsubscribeStats = firebaseService.subscribeToSiteStats((newStats) => {
      setSiteStats(newStats);
    });

    return () => unsubscribeStats();
  }, []);

  const loadArticles = async () => {
    try {
      const fetched = await firebaseService.getAllArticles();
      setArticles(fetched);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAdmins = async () => {
    setAdminsLoading(true);
    try {
      const fetched = await firebaseService.getAdminProfiles();
      setAdminProfiles(fetched);
    } catch (err) {
      console.error("Failed loading admin profiles:", err);
    } finally {
      setAdminsLoading(false);
    }
  };

  const handleAuthSuccess = (profile: UserProfile) => {
    setCurrentUser(profile);
    localStorage.setItem('impactED_current_user', JSON.stringify(profile));
    // If logging in as admin, swap straight to admin portal or reset
    if (profile.role === 'admin') {
      setIsAdminPortal(true);
      setIsWriting(false);
      setSelectedArticleId(null);
      setIsDashboard(false);
    } else {
      setIsDashboard(true);
      setIsWriting(false);
      setSelectedArticleId(null);
      setIsAdminPortal(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('impactED_current_user');
    setIsAdminPortal(false);
    setIsWriting(false);
    setSelectedArticleId(null);
    setIsDashboard(false);
  };

  // Reactions Handler (FR-5.1 - 5.5)
  const handleReact = async (articleId: string, type: ReactionType) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const art = articles.find(a => a.id === articleId);
    if (!art) return;

    // Trigger local animation
    setAnimatingReaction(prev => ({ ...prev, [articleId]: type }));
    setTimeout(() => {
      setAnimatingReaction(prev => ({ ...prev, [articleId]: null }));
    }, 800);

    // Initial reaction dictionary setup
    const userReacts = art.userReactions || {};
    const previousReaction = userReacts[currentUser.uid];

    const updatedReactions = { ...art.reactions };

    if (previousReaction === type) {
      // Toggle off
      updatedReactions[type] = Math.max(0, updatedReactions[type] - 1);
      delete userReacts[currentUser.uid];
    } else {
      // Toggle on / Change
      if (previousReaction) {
        // Remove prior count
        updatedReactions[previousReaction] = Math.max(0, updatedReactions[previousReaction] - 1);
      }
      updatedReactions[type] = (updatedReactions[type] || 0) + 1;
      userReacts[currentUser.uid] = type;
    }

    const updatedArticle = {
      ...art,
      reactions: updatedReactions,
      userReactions: userReacts
    };

    // Update list state instantly
    setArticles(prev => prev.map(a => a.id === articleId ? updatedArticle : a));

    try {
      await firebaseService.updateArticleReactions(articleId, updatedReactions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async (articleId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const updatedBookmarks = await firebaseService.toggleBookmark(currentUser.uid, articleId);
      const updatedUser: UserProfile = {
        ...currentUser,
        bookmarks: updatedBookmarks
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('impactED_current_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Failed toggling bookmark:", err);
    }
  };

  const getEnrichedArticles = () => {
    if (!currentUser || currentUser.role !== 'student') return articles;
    
    const hasDemo = articles.some(a => a.id === `demo-template-${currentUser.uid}`);
    if (hasDemo) {
      return articles;
    }
    
    const demoTemplate: Article = {
      id: `demo-template-${currentUser.uid}`,
      title: '🎓 Scholastic Demo Template: Research Paper Guidelines',
      summary: 'A standard sample template demonstrating how to formulate an academic manuscript with properly structured sections.',
      content: `### Scholastic Demo Template

Welcome to impactED! This is a demo template designed to guide your writing.

### Research Formulation
Begin with a clear research question that addresses an impactful issue in your local community or globally.

### Sectioning
1. **Introduction**: Introduce the problem and your thesis.
2. **Analysis**: Support your claims with evidence.
3. **Conclusion**: Propose action items.`,
      category: 'Science & Tech',
      tags: ['Demo', 'Template', 'Academic'],
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorSchool: currentUser.school,
      authorCountry: currentUser.country || 'United States',
      status: 'Published',
      type: 'article',
      coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
      reactions: { great: 5, like: 10, heart: 8, wow: 1 },
      createdAt: Date.now() - 24 * 3600 * 1000,
      readingTime: 2,
      wordCount: 120,
      commentsCount: 0
    };
    
    return [demoTemplate, ...articles];
  };

  const handleEditDraft = (art: Article) => {
    setEditingArticle(art);
    setIsWriting(true);
    setSelectedArticleId(null);
  };

  const handleDeleteArticle = (articleId: string) => {
    const enriched = getEnrichedArticles();
    const articleToDelete = enriched.find(a => a.id === articleId);
    if (!articleToDelete) return;
    setDeleteConfirmArticle(articleToDelete);
  };

  const executeDeleteArticle = async (article: Article) => {
    try {
      const updatedArticle: Article = {
        ...article,
        status: 'Deleted'
      };
      await firebaseService.saveArticle(updatedArticle);
      setDeleteConfirmArticle(null);
      setRecentlyDeleted(article);
      showNotification("🎉 Manuscript moved to Deleted Works tab!");
      loadArticles();
    } catch (err) {
      console.error("Failed to delete article:", err);
      showNotification("Failed to delete article. Please try again.", "error");
    }
  };

  const handleRestoreArticle = async (articleId: string) => {
    const enriched = getEnrichedArticles();
    const articleToRestore = enriched.find(a => a.id === articleId);
    if (!articleToRestore) return;

    try {
      const restoredArticle: Article = {
        ...articleToRestore,
        status: articleToRestore.id.startsWith('demo-template-') ? 'Published' : 'Draft'
      };
      await firebaseService.saveArticle(restoredArticle);
      showNotification("🎉 Manuscript restored successfully!");
      loadArticles();
    } catch (err) {
      console.error("Failed to restore article:", err);
      showNotification("Failed to restore article. Please try again.", "error");
    }
  };

  const handleUndoDelete = async () => {
    if (!recentlyDeleted) return;
    try {
      await firebaseService.saveArticle(recentlyDeleted);
      setRecentlyDeleted(null);
      showNotification("🎉 Manuscript restored successfully!");
      loadArticles();
    } catch (err) {
      console.error("Failed to restore article:", err);
      showNotification("Failed to restore article. Please try again.", "error");
    }
  };

  // Filter and Search computational query
  const filteredArticles = articles.filter(art => {
    // Only show published articles to non-admins on the homepage, or show user's own submissions
    const isAuthor = currentUser && art.authorId === currentUser.uid;
    const isPublic = art.status === 'Published';
    
    // For general browsing feed, exclude pending/rejected pieces unless they belong to current author
    if (!isPublic && !isAuthor && currentUser?.role !== 'admin') {
      return false;
    }

    const matchesSearch = 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory ? art.category === selectedCategory : true;
    const matchesCountry = (() => {
      if (!selectedCountry) return true;
      if (selectedCountry.startsWith('Continent:')) {
        const continentName = selectedCountry.replace('Continent:', '').trim();
        const continentObj = CONTINENTS.find(c => c.name === continentName);
        if (continentObj) {
          return continentObj.countries.includes(art.authorCountry);
        }
        return false;
      }
      return art.authorCountry === selectedCountry;
    })();

    return matchesSearch && matchesCategory && matchesCountry;
  });

  const activeArticle = getEnrichedArticles().find(a => a.id === selectedArticleId);

  // Smooth scroll to Library section
  const scrollToLibrary = (category?: string) => {
    if (category !== undefined) {
      setSelectedCategory(category);
    }
    setSelectedArticleId(null);
    setIsWriting(false);
    setIsAdminPortal(false);
    setIsDashboard(false);

    setTimeout(() => {
      const el = document.getElementById('library-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  };

  // Markdown renderer for student paper body (keeps it super elegant)
  const renderFormattedContent = (txt: string) => {
    return txt.split('\n').map((para, idx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith('###')) {
        return (
          <h4 key={idx} className="font-display font-bold text-lg sm:text-xl text-stone-900 mt-6 mb-3 border-b border-stone-100 pb-1.5 leading-snug">
            {trimmed.replace('###', '').trim()}
          </h4>
        );
      }
      if (trimmed.startsWith('##')) {
        return (
          <h3 key={idx} className="font-display font-bold text-xl sm:text-2xl text-stone-900 mt-8 mb-4 border-b border-stone-200 pb-2 leading-snug">
            {trimmed.replace('##', '').trim()}
          </h3>
        );
      }
      if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
        return (
          <li key={idx} className="text-stone-700 text-sm ml-5 list-disc pl-1 mb-2.5 leading-relaxed font-sans">
            {trimmed.substring(1).trim()}
          </li>
        );
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return (
          <p key={idx} className="font-semibold text-stone-900 text-sm my-4 font-sans leading-relaxed">
            {trimmed.replace(/\*\*/g, '').trim()}
          </p>
        );
      }
      // Blockquotes helper
      if (trimmed.startsWith('>')) {
        return (
          <blockquote key={idx} className="border-l-4 border-emerald-500 bg-emerald-500/5 px-4 py-3 rounded-r-lg text-stone-700 italic my-6 text-sm font-hand">
            {trimmed.replace('>', '').trim()}
          </blockquote>
        );
      }

      return (
        <p key={idx} className="text-stone-700 text-sm sm:text-md leading-relaxed mb-4.5 font-sans">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#fdfcf0] text-[#1a1a1a] font-sans flex flex-col justify-between">
      
      {/* GLOBAL ACADEMIC NAVBAR */}
      <header 
        className="border-b border-[#523624]/40 sticky top-0 z-40 text-stone-100 shadow-lg select-none relative"
        style={{
          background: 'radial-gradient(circle at 50% -20%, rgba(82, 54, 36, 0.98) 0%, rgba(58, 33, 19, 0.99) 55%, rgba(22, 11, 5, 1) 100%)'
        }}
      >
        {/* Dynamic Fading Grid overlay subtly carried on the navbar */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(252, 220, 182, 0.25) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(252, 220, 182, 0.25) 1px, transparent 1px)
            `,
            backgroundSize: '36px 36px'
          }}
        />

        <div className="w-full max-w-7xl lg:max-w-none mx-auto px-3 sm:px-6 lg:px-10 xl:px-12 h-16 flex items-center justify-between relative z-10 gap-2">
          
          {/* Logo Branding */}
          <div 
            onClick={() => scrollToLibrary()}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <img 
              src={scholarHatLogo} 
              alt="impactED Logo" 
              className="w-9 h-9 sm:w-10 sm:h-10 object-cover rounded-full border border-[#fcdcb6]/30 group-hover:rotate-6 transition-transform duration-300 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl sm:text-2xl italic tracking-tighter text-[#fcdcb6] group-hover:text-amber-200 transition-colors drop-shadow-xs">impactED</span>
              <span className="text-[8.5px] sm:text-[9px] uppercase tracking-[0.2em] text-[#fcdcb6]/80 font-bold leading-none hidden sm:inline">Student Publishing</span>
            </div>
          </div>

          {/* Navigation Controls - Desktop Version */}
          <div className="hidden md:flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            <ReadingStreakTracker 
              currentUser={currentUser}
              selectedArticleId={selectedArticleId}
              finishReadingTrigger={finishReadingTrigger}
              onExploreLibrary={() => scrollToLibrary()}
            />

            <button
              onClick={() => scrollToLibrary()}
              className="px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-sans uppercase tracking-widest font-semibold text-stone-200 hover:text-white transition-all cursor-pointer"
            >
              Library
            </button>

            {/* Student Dashboard Action */}
            {currentUser && currentUser.role === 'student' && (
              <button
                onClick={() => { setIsDashboard(true); setIsWriting(false); setSelectedArticleId(null); setIsAdminPortal(false); }}
                className={`px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-sans uppercase tracking-widest font-semibold transition-all ${
                  isDashboard ? 'text-[#fcdcb6] font-bold border-b-2 border-[#fcdcb6]' : 'text-stone-300 hover:text-[#fcdcb6]'
                }`}
              >
                <span>Academic </span>Dashboard
              </button>
            )}

            {/* Writer Action */}
            {currentUser && currentUser.role === 'student' && (
              <button
                onClick={() => { setIsWriting(true); setSelectedArticleId(null); setIsAdminPortal(false); setIsDashboard(false); setEditingArticle(null); }}
                className="px-2.5 sm:px-4 py-1.5 bg-[#fcdcb6] hover:bg-[#f8c992] text-[#3d2517] rounded-none text-[11px] sm:text-xs font-sans uppercase tracking-widest font-bold transition-all active:scale-95 flex items-center gap-1 shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Compose</span>
              </button>
            )}

            {/* Moderator Desk (Role check) */}
            {currentUser && currentUser.role === 'admin' && (
              <button
                onClick={() => { setIsAdminPortal(true); setIsWriting(false); setSelectedArticleId(null); setIsDashboard(false); }}
                className="px-2.5 sm:px-4 py-1.5 bg-[#fcdcb6] hover:bg-[#f8c992] text-[#3d2517] rounded-none text-[11px] sm:text-xs font-sans uppercase tracking-widest font-bold flex items-center gap-1 shadow-sm"
              >
                <BookOpenCheck className="w-3.5 h-3.5 text-[#3d2517]" />
                <span>Moderator Board</span>
              </button>
            )}

            {/* Session Management */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-3 border-l border-white/20 pl-2 sm:pl-4">
                <div className="flex flex-col text-right select-none">
                  <span className="text-[10.5px] font-bold text-stone-100 leading-tight">{currentUser.displayName}</span>
                  <span className="text-[9px] text-stone-300 line-clamp-1 max-w-[130px] leading-tight mt-0.5">{currentUser.school}</span>
                  
                  {currentUser.role === 'student' ? (
                    (() => {
                      const { publishedCount, stampsCount } = getStudentStats(currentUser.uid, currentUser.role, articles);
                      return (
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                          {/* Mini stats counters */}
                          <div className="flex items-center gap-1 border border-white/20 bg-black/20 p-0.5 rounded-sm">
                            <span title={`${publishedCount} Published Papers`} className="text-[8.5px] font-mono font-bold text-stone-200 px-1">
                              📝 {publishedCount}
                            </span>
                            <span className="w-px h-2.5 bg-white/20" />
                            <span title={`${stampsCount} Grade Stamps Received`} className="text-[8.5px] font-mono font-bold text-[#fcdcb6] px-1">
                              ⭐ {stampsCount}
                            </span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex items-center justify-end mt-1">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm text-[8.5px] font-mono font-extrabold uppercase border bg-amber-500/20 text-amber-200 border-amber-400/30 shadow-2xs">
                        🛡️ Moderator
                      </span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-stone-300 hover:text-red-300 rounded hover:bg-white/10 transition-colors shrink-0"
                  title="Log out of classroom profile"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-2.5 sm:px-4 py-1.5 bg-white/10 hover:bg-white/20 text-[#fcdcb6] border border-[#fcdcb6]/30 text-[11px] sm:text-xs font-sans uppercase tracking-widest font-bold transition-all active:scale-95"
              >
                Sign In
              </button>
            )}

          </div>

          {/* Mobile Streak & 3-Dot Options Trigger */}
          <div className="md:hidden flex items-center gap-1.5">
            <ReadingStreakTracker 
              currentUser={currentUser}
              selectedArticleId={selectedArticleId}
              finishReadingTrigger={finishReadingTrigger}
              onExploreLibrary={() => scrollToLibrary()}
            />
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-[#fcdcb6] hover:bg-white/10 rounded-lg transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
              title="Open menu options"
              aria-label="Open menu options"
            >
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>

        </div>

        {/* Mobile Slide-Over Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Overlay backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden"
              />

              {/* Slide Drawer Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed top-0 right-0 bottom-0 w-[290px] max-w-[85vw] bg-[#3a2215] border-l border-[#fcdcb6]/30 shadow-2xl z-50 p-5 flex flex-col justify-between md:hidden overflow-y-auto text-[#fdfcf0]"
              >
                <div className="space-y-5">
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                    <div className="flex items-center gap-2">
                      <img src={scholarHatLogo} alt="impactED Logo" className="w-7 h-7 rounded-full border border-[#fcdcb6]/40 object-cover" />
                      <span className="font-display font-bold italic text-lg text-[#fcdcb6]">impactED Menu</span>
                    </div>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* User Profile Card or Auth Prompt */}
                  {currentUser ? (
                    <div className="bg-black/30 rounded-xl p-3.5 border border-white/10 space-y-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#fcdcb6] text-[#3d2517] font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                          {currentUser.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm text-stone-100 truncate">{currentUser.displayName}</span>
                          <span className="text-[11px] text-stone-300 truncate">{currentUser.school}</span>
                        </div>
                      </div>

                      {currentUser.role === 'student' ? (
                        (() => {
                          const { publishedCount, stampsCount } = getStudentStats(currentUser.uid, currentUser.role, articles);
                          return (
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 text-stone-300 font-mono">
                              <span>📝 {publishedCount} Papers</span>
                              <span>⭐ {stampsCount} Stamps</span>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="pt-2 border-t border-white/10">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-200 border border-amber-400/30">
                            🛡️ Moderator Account
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 space-y-2 text-center">
                      <p className="text-xs text-stone-300 font-medium">Welcome to impactED Journal</p>
                      <button
                        onClick={() => { setIsAuthOpen(true); setIsMenuOpen(false); }}
                        className="w-full py-2 bg-[#fcdcb6] hover:bg-[#f8c992] text-[#3d2517] font-sans text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        Sign In / Register
                      </button>
                    </div>
                  )}

                  {/* Reading Streak Tracker */}
                  <div className="pt-1" id="header-streak-badge-mobile">
                    <ReadingStreakTracker 
                      currentUser={currentUser}
                      selectedArticleId={selectedArticleId}
                      finishReadingTrigger={finishReadingTrigger}
                      onExploreLibrary={() => { setIsMenuOpen(false); scrollToLibrary(); }}
                    />
                  </div>

                  {/* Navigation Links List */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#fcdcb6]/60 font-semibold px-1">Menu Options</span>
                    
                    <button
                      onClick={() => { scrollToLibrary(); setIsMenuOpen(false); }}
                      className="w-full text-left px-3.5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-100 font-sans text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-[#fcdcb6]" />
                      <span>Library Archives</span>
                    </button>

                    {currentUser && currentUser.role === 'student' && (
                      <button
                        onClick={() => { setIsDashboard(true); setIsWriting(false); setSelectedArticleId(null); setIsAdminPortal(false); setIsMenuOpen(false); }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg font-sans text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
                          isDashboard ? 'bg-[#fcdcb6] text-[#3d2517] font-bold shadow-xs' : 'bg-white/5 hover:bg-white/10 text-stone-100'
                        }`}
                      >
                        <Award className="w-4 h-4 text-[#fcdcb6]" />
                        <span>Academic Dashboard</span>
                      </button>
                    )}

                    {currentUser && currentUser.role === 'student' && (
                      <button
                        onClick={() => { setIsWriting(true); setSelectedArticleId(null); setIsAdminPortal(false); setIsDashboard(false); setEditingArticle(null); setIsMenuOpen(false); }}
                        className="w-full text-left px-3.5 py-2.5 rounded-lg bg-[#fcdcb6]/20 hover:bg-[#fcdcb6]/30 text-[#fcdcb6] font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors border border-[#fcdcb6]/30 cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Compose Paper</span>
                      </button>
                    )}

                    {currentUser && currentUser.role === 'admin' && (
                      <button
                        onClick={() => { setIsAdminPortal(true); setIsWriting(false); setSelectedArticleId(null); setIsDashboard(false); setIsMenuOpen(false); }}
                        className="w-full text-left px-3.5 py-2.5 rounded-lg bg-[#fcdcb6] text-[#3d2517] font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <BookOpenCheck className="w-4 h-4" />
                        <span>Moderator Board</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer Logout Action */}
                {currentUser && (
                  <div className="pt-4 border-t border-white/10 mt-6">
                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="w-full py-2.5 px-3 rounded-lg bg-red-950/50 hover:bg-red-900/70 border border-red-500/30 text-red-200 font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out Profile</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* CORE SCREEN ROUTING VIEWPORTS */}
      <main className="flex-1 w-full flex flex-col">

        {/* LOADING SHIMMER */}
        {loading ? (
          <div className="flex-1 min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-10 xl:px-12 text-center my-auto">
            <div className="flex flex-col items-center justify-center max-w-md mx-auto">
              <Loader />
              <p className="text-stone-600 text-sm font-sans font-medium tracking-wide">
                Opening textbooks and retrieving global manuscripts...
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* SCREEN 1: ARTICLE DETAILED READING VIEW */}
            {selectedArticleId && activeArticle ? (
              <AcademicReader
                activeArticle={activeArticle}
                articles={articles}
                currentUser={currentUser}
                onBack={() => setSelectedArticleId(null)}
                onReact={handleReact}
                onOpenAuth={() => setIsAuthOpen(true)}
                animatingReaction={animatingReaction}
                onToggleBookmark={handleToggleBookmark}
                onFinishReading={handleFinishReading}
              />
            ) :

            /* SCREEN 2: ARTICLE WRITING COMPILER DECK (FR-2) */
            isWriting && currentUser ? (
              <motion.div 
                key="writer"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="py-10 px-4 sm:px-6 lg:px-10 xl:px-12"
              >
                <ArticleEditor 
                  currentUser={currentUser} 
                  editingArticle={editingArticle}
                  onClose={() => { setIsWriting(false); setEditingArticle(null); }} 
                  onSubmitSuccess={() => { setIsWriting(false); setEditingArticle(null); loadArticles(); }}
                />
              </motion.div>
            ) :

            /* SCREEN 3: ADMINISTRATOR REVIEW CONTROL PORTAL (FR-3) */
            isAdminPortal && currentUser && currentUser.role === 'admin' ? (
              <motion.div 
                key="admin"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="py-10 px-4 sm:px-6 lg:px-10 xl:px-12"
              >
                <AdminPanel 
                  currentUser={currentUser} 
                  onRefreshFeed={() => loadArticles()} 
                  siteStats={siteStats}
                />
              </motion.div>
            ) :

            /* SCREEN 4: STUDENT SCHOLASTIC DASHBOARD */
            isDashboard && currentUser && currentUser.role === 'student' ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="py-10 px-4 sm:px-6 lg:px-10 xl:px-12"
              >
                <AcademicDashboard 
                  currentUser={currentUser}
                  articles={getEnrichedArticles()}
                  onSelectArticle={(id) => {
                    handleSelectArticle(id);
                  }}
                  onEditDraft={(art) => {
                    setEditingArticle(art);
                    setIsWriting(true);
                    setSelectedArticleId(null);
                    setIsAdminPortal(false);
                    setIsDashboard(false);
                  }}
                  onDeleteArticle={handleDeleteArticle}
                  onRestoreArticle={handleRestoreArticle}
                  onToggleBookmark={handleToggleBookmark}
                  onWriteEssay={() => {
                    setIsWriting(true);
                    setSelectedArticleId(null);
                    setIsAdminPortal(false);
                    setIsDashboard(false);
                    setEditingArticle(null);
                  }}
                />
              </motion.div>
            ) :

            /* SCREEN 5: HOMEPAGE Feed / Discover Desk */
            (
              <motion.div 
                key="homepage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pb-16 flex flex-col space-y-12 sm:space-y-16"
              >
                {/* Classroom Blackboard & Book Stack Hero (Full Bleed Edge-to-Edge) */}
                <GreenboardHero 
                  articles={articles}
                  onSelectArticle={handleSelectArticle}
                  onWriteEssay={() => {
                    if (!currentUser) {
                      setIsAuthOpen(true);
                    } else {
                      setIsWriting(true);
                      setSelectedArticleId(null);
                      setIsAdminPortal(false);
                      setEditingArticle(null);
                    }
                  }}
                />

                {/* Flex container for reordering Analytics and Article Feed on mobile */}
                <div className="flex flex-col space-y-12 sm:space-y-16">
                  {/* Global interactive Atlas Widget (Analytics Section) - Order 2 on mobile, Order 1 on desktop */}
                  <div className="order-2 md:order-1 px-4 sm:px-6 lg:px-10 xl:px-12">
                    <GlobalReachMap 
                      selectedCountry={selectedCountry} 
                      onSelectCountry={setSelectedCountry} 
                      articles={articles}
                    />
                  </div>

                  {/* Library Books Feed Filter bar & Complete Article Section - Order 1 on mobile, Order 2 on desktop */}
                  <div id="library-section" className="order-1 md:order-2 px-4 sm:px-6 lg:px-10 xl:px-12 space-y-6">
                    
                    {/* Filter bar card */}
                    <div className="bg-white rounded border border-[#d1cfc0] p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
                      
                      {/* Search query box */}
                      <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search essays, poems, student authors, or keywords..."
                          className="w-full bg-stone-50/60 border border-[#d1cfc0] rounded pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-800 shadow-inner text-[#1a1a1a]"
                        />
                      </div>

                      {/* Quick clear stats */}
                      {(selectedCategory || selectedCountry || searchQuery) && (
                        <button
                          onClick={() => { setSelectedCategory(''); setSelectedCountry(''); setSearchQuery(''); }}
                          className="text-stone-500 text-xs hover:text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Clear Filters</span>
                        </button>
                      )}

                    </div>

                    {/* Active Filtering indicators */}
                    {(selectedCountry || selectedCategory) && (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-sans uppercase tracking-wider">
                        <span>Currently filtering:</span>
                        {selectedCategory && (
                          <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-none font-bold">
                            Subject: {selectedCategory}
                          </span>
                        )}
                        {selectedCountry && (
                          <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-none font-bold">
                            Region: {selectedCountry}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Feed Grid (FR-4.1) */}
                    {filteredArticles.length > 0 ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          <AnimatePresence mode="popLayout">
                            {filteredArticles.map((art, artIndex) => (
                              <div 
                                key={art.id}
                                className={artIndex >= 3 && !isMobileLibraryExpanded ? "hidden md:block" : "block"}
                              >
                                <ArticleCard 
                                  article={art} 
                                  onSelect={handleSelectArticle}
                                  articles={articles}
                                  currentUser={currentUser}
                                  onToggleBookmark={handleToggleBookmark}
                                  isBookmarked={currentUser?.bookmarks?.includes(art.id) || false}
                                />
                              </div>
                            ))}
                          </AnimatePresence>
                        </div>

                        {/* Mobile View More / View Less Button */}
                        {filteredArticles.length > 3 && (
                          <div className="flex md:hidden justify-center pt-2">
                            <button
                              type="button"
                              onClick={() => setIsMobileLibraryExpanded(!isMobileLibraryExpanded)}
                              style={{ paddingTop: '11px', marginLeft: '1px', marginTop: '-30px' }}
                              className="px-5 pb-2.5 bg-white border border-[#d1cfc0] hover:border-emerald-700 text-[#1a1a1a] hover:text-emerald-900 text-xs font-mono font-bold uppercase tracking-wider rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                            >
                              <span>
                                {isMobileLibraryExpanded 
                                  ? "Show Less Articles" 
                                  : `View More Articles (${filteredArticles.length - 3} More)`}
                              </span>
                              {isMobileLibraryExpanded ? (
                                <ChevronUp className="w-4 h-4 text-emerald-800" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-emerald-800" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 px-6 bg-white rounded-none border border-[#d1cfc0] flex flex-col items-center justify-center space-y-4">
                        <div className="w-48 h-48 rounded-full overflow-hidden border border-[#d1cfc0]/60 bg-[#fdfcf0] p-1 shadow-inner relative group">
                          <img 
                            src={emptyLibraryImg} 
                            alt="No Publications Found" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="space-y-1 max-w-sm">
                          <h4 className="font-display font-bold text-[#1a1a1a] text-lg">No Student Publications Found</h4>
                          <p className="text-stone-500 text-xs leading-relaxed">
                            Try adjusting your filters, clearing your search query, or checking another participating region.
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Meet Our Team Section */}
                <div className="pt-8 pb-12 px-4 sm:px-6 lg:px-10 xl:px-12">
                  <div className="bg-[#fdfcf0]/40 rounded-3xl border border-[#d1cfc0]/70 p-8 md:p-12 shadow-xs overflow-visible">
                    <div className="text-center max-w-xl mx-auto mb-4">
                      <h3 className="font-display font-black text-3xl text-stone-900 tracking-tight flex items-center justify-center gap-2">
                        <Users className="w-7 h-7 text-emerald-800" />
                        Meet Our Team
                      </h3>
                      <p className="text-xs text-stone-500 font-serif italic mt-2">
                        Dedicated educators and academic curators guiding the voices of tomorrow's scholarship.
                      </p>
                    </div>

                    {adminsLoading ? (
                      <div className="text-center py-16">
                        <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <span className="text-xs text-stone-500 font-mono tracking-wider">Retrieving editorial board members...</span>
                      </div>
                    ) : (
                      <div className="overflow-visible">
                        <HangingTeamCards adminProfiles={adminProfiles} />
                      </div>
                    )}
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        )}

      </main>

      {/* GLOBAL ACADEMIC FOOTER */}
      <footer className="bg-[#fdfcf0] text-stone-700 border-t border-[#d1cfc0] font-sans mt-auto">
        {!loading && (
          <div className="py-12 px-6 sm:px-10 lg:px-12 border-b border-[#d1cfc0]">
            <div className="w-full max-w-7xl lg:max-w-none mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="space-y-3">
                <h4 className="text-[#1a1a1a] font-display italic font-bold text-lg">The Scholastic Archive</h4>
                <p className="text-xs leading-relaxed text-stone-600 max-w-xs">
                  Continuous academic learning, global community bonds, and peer-moderated student voices. Fusing the infinite pursuit of truth with real student papers.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-[#1a1a1a] font-sans uppercase tracking-widest font-bold text-xs">Academic Categories</h4>
                <ul className="text-xs space-y-1.5 grid grid-cols-2">
                  {CATEGORIES.map(cat => (
                    <li key={cat}>
                      <button 
                        onClick={() => scrollToLibrary(cat)}
                        className="hover:text-emerald-800 font-medium transition-colors cursor-pointer text-left"
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-[#1a1a1a] font-sans uppercase tracking-widest font-bold text-xs">Honor & Guidelines</h4>
                <ul className="text-xs space-y-1.5">
                  <li><span className="text-[10px] bg-emerald-500/10 text-emerald-900 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-semibold">Under 18 Safe Platform</span></li>
                  <li><span className="hover:text-emerald-800 font-medium cursor-pointer">Community Honor Code Guidelines</span></li>
                  <li><span className="hover:text-emerald-800 font-medium cursor-pointer">Privacy Policy & Children's safety</span></li>
                </ul>
                <div className="pt-2">
                  <button
                    onClick={() => scrollToLibrary()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#523624] hover:bg-[#3d2517] text-[#fcdcb6] rounded text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span>↑ Jump to Article Feed</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        <div className={`w-full max-w-7xl lg:max-w-none mx-auto ${loading ? 'py-4' : 'py-6'} px-6 sm:px-10 lg:px-12 text-center text-[11px] text-stone-500 font-sans flex flex-col sm:flex-row items-center justify-between gap-4`}>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <p>© 2026 impactED Student Publishing Group. All student authors retain full publication ownership of their articles.</p>
            <span className="hidden sm:inline text-stone-300">•</span>
            <a 
              href="https://impactedglobal.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#523624] hover:text-stone-900 font-bold underline underline-offset-2 transition-colors"
            >
              impactedglobal.xyz ↗
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] uppercase tracking-wider bg-stone-100 px-2 py-0.5 border border-[#d1cfc0]">Est. 2024</span>
            <p className="font-mono text-[9px]">PROJECT ID: peta-watch-85jvd (Firestore Active)</p>
          </div>
        </div>
      </footer>

      {/* Global Authentication Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />

      {/* Undo Delete Toast Popup */}
      <AnimatePresence>
        {recentlyDeleted && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[200] bg-stone-900 border border-stone-800 text-stone-100 px-5 py-4 shadow-2xl flex items-center gap-4 rounded-xl max-w-sm"
          >
            <div className="flex-1 text-left">
              <p className="text-xs font-mono uppercase font-bold tracking-wider text-emerald-500">Published Work Deleted</p>
              <p className="text-xs font-semibold truncate mt-1 text-stone-300">"{recentlyDeleted.title}"</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleUndoDelete}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-mono font-bold uppercase rounded-md shadow transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <span>Undo</span>
              </button>
              <button
                onClick={() => setRecentlyDeleted(null)}
                className="text-stone-500 hover:text-stone-300 p-1 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmArticle && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmArticle(null)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white border border-[#d1cfc0] rounded-2xl shadow-2xl p-6 max-w-md w-full text-left animate-fade-in"
            >
              <h3 className="font-sans font-bold text-base text-stone-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                <span>Confirm Manuscript Deletion</span>
              </h3>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                Are you sure you want to delete <strong className="text-stone-800 font-semibold">"{deleteConfirmArticle.title}"</strong>? It will be moved to your <span className="font-semibold text-[#523624]">Deleted Works</span> folder where you can restore it at any time.
              </p>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-100">
                <button
                  onClick={() => setDeleteConfirmArticle(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmArticle) {
                      executeDeleteArticle(deleteConfirmArticle);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification Popup */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 left-6 z-[200] border p-4 shadow-2xl flex items-center gap-3 rounded-xl max-w-sm ${
              notification.type === 'error' 
                ? 'bg-red-50 border-red-200 text-red-900' 
                : 'bg-white border-stone-200 text-stone-900'
            }`}
          >
            <div className="flex-1 text-left">
              <p className="text-[11px] font-semibold leading-relaxed">{notification.message}</p>
            </div>
            {notification.action && (
              <button
                onClick={() => {
                  notification.action?.onClick();
                  setNotification(null);
                }}
                className="px-2.5 py-1 bg-[#523624] hover:bg-[#3d2517] text-white text-[10px] font-bold uppercase rounded cursor-pointer"
              >
                {notification.action.label}
              </button>
            )}
            <button
              onClick={() => setNotification(null)}
              className="text-stone-400 hover:text-stone-600 text-xs font-bold font-sans px-1 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
