import React from 'react';
import { motion } from 'motion/react';
import { Article, ReactionType, UserProfile, getStudentStats } from '../types';
import { BookOpen, Calendar, Globe, ThumbsUp, Heart, Star, Sparkles, MessageSquare, Bookmark } from 'lucide-react';
import TiltedCard from './TiltedCard';

interface ArticleCardProps {
  key?: string | number;
  article: Article;
  onSelect: (id: string) => void;
  onReact?: (articleId: string, reaction: ReactionType) => void;
  articles?: Article[];
  currentUser?: UserProfile | null;
  onToggleBookmark?: (articleId: string) => void;
  isBookmarked?: boolean;
}

export default function ArticleCard({ 
  article, 
  onSelect, 
  onReact, 
  articles = [], 
  currentUser,
  onToggleBookmark,
  isBookmarked = false
}: ArticleCardProps) {
  // Format long date to elegant readable text
  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalReactions = Object.values(article.reactions || {}).reduce((a, b) => a + b, 0);

  // Category specific pastel color pairings
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Science & Tech': return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60';
      case 'Poetry & Creative Writing': return 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-700/60';
      case 'Opinion & Editorial': return 'bg-[#1a1a1a] dark:bg-[#382f28] text-[#fdfcf0] dark:text-[#fcdcb6] border-[#1a1a1a] dark:border-[#524438]';
      case 'Arts & Culture': return 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-700/60';
      case 'Global Issues': return 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700/60';
      case 'Campus Life': return 'bg-teal-100 dark:bg-teal-950/80 text-teal-900 dark:text-teal-300 border-teal-300 dark:border-teal-700/60';
      default: return 'bg-stone-100 dark:bg-[#25201b] text-stone-800 dark:text-stone-300 border-stone-300 dark:border-[#423930]';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        opacity: { duration: 0.35 },
        y: { type: 'spring', stiffness: 280, damping: 24 }
      }}
      className="h-full"
    >
      <TiltedCard
        rotateAmplitude={12}
        scaleOnHover={1.05}
        showMobileWarning={false}
        showTooltip={false}
        className="h-full flex flex-col"
      >
        <article 
          className="bg-white dark:bg-[#1a1714] rounded-xl border border-stone-300/80 dark:border-[#383129] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_28px_-6px_rgba(82,54,36,0.12)] dark:hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col justify-between h-full group transition-all duration-300"
        >
      
      {/* Clickable Card Body wrapper */}
      <div className="cursor-pointer" onClick={() => onSelect(article.id)}>
        
        {/* Cover Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 dark:bg-[#141210] border-b border-stone-200 dark:border-[#383129]">
          <img 
            src={article.coverImage || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
          {/* Subtle gold ribbon or category pill */}
          <div className="absolute top-3 left-3 pr-10 flex flex-col gap-1.5 items-start max-w-[75%]">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border shadow-sm ${getCategoryColor(article.category)}`}>
              {article.category}
            </span>
            {article.status !== 'Published' && (
              <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border shadow-md font-mono ${
                article.status === 'Draft' 
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600' 
                  : article.status === 'Submitted'
                  ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700 animate-pulse'
                  : article.status === 'Revision Requested'
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-red-100 dark:bg-red-950/80 text-red-900 dark:text-red-300 border-red-300 dark:border-red-700'
              }`}>
                {article.status === 'Draft' && '📝 Draft'}
                {article.status === 'Submitted' && '🕒 Under Review'}
                {article.status === 'Revision Requested' && '⚠️ Revision Req'}
                {article.status === 'Rejected' && '❌ Rejected'}
              </span>
            )}
          </div>

          {/* Bookmark Button Overlay */}
          {currentUser && onToggleBookmark && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(article.id);
              }}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-md border transition-all hover:scale-110 active:scale-95 cursor-pointer z-10 ${
                isBookmarked
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white/80 dark:bg-stone-900/80 border-stone-300/50 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white hover:bg-white dark:hover:bg-stone-900'
              }`}
              title={isBookmarked ? "Saved in Reading List" : "Bookmark Article"}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}

        </div>

        {/* Content Details */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500 dark:text-stone-400 font-sans mb-3 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(article.createdAt)}
              </span>
              <span className="w-1 h-1 bg-stone-300 dark:bg-stone-600 rounded-full" />
              <span className="flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-400 uppercase text-[10px] tracking-wide">
                <Globe className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                {article.authorCountry}
              </span>
            </div>

            {article.status !== 'Published' && (
              <div className="mb-3 px-2.5 py-1.5 bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-800 dark:text-amber-300 font-medium font-sans">
                🛡️ <span className="font-bold">Author Preview Only:</span> This submission is private and only visible to you and platform moderators.
              </div>
            )}

            {/* Title */}
            <h3 className="font-productsans font-bold text-xl text-stone-900 dark:text-[#eee9df] line-clamp-2 leading-tight group-hover:text-emerald-800 dark:group-hover:text-amber-300 transition-colors mb-2.5">
              {article.title}
            </h3>

            {/* Summary description */}
            <p className="text-stone-600 dark:text-[#b5ac9d] text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4 font-serif">
              {article.summary}
            </p>
          </div>

          {/* Tags & Metrics Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 dark:border-[#383129] pt-3 mt-auto">
            <div className="flex flex-wrap gap-1">
              {article.tags.map(tag => (
                <span key={tag} className="text-[10px] bg-stone-100 dark:bg-[#25201b] text-stone-600 dark:text-[#b5ac9d] px-2 py-0.5 rounded border border-stone-200 dark:border-[#383129] font-mono font-medium">
                  #{tag}
                </span>
              ))}
            </div>
            
            <span className="text-[9px] text-stone-400 dark:text-stone-500 font-mono bg-stone-50 dark:bg-[#141210] border border-stone-200/50 dark:border-[#383129] px-2 py-0.5 rounded">
              {article.wordCount || 0} words • {article.readingTime || 1} min read
            </span>
          </div>

        </div>

      </div>

      {/* Footer containing Author details and Reaction Stamps */}
      <div className="px-5 py-4 bg-[#fdfcf0]/40 dark:bg-[#161311] border-t border-stone-200 dark:border-[#383129] flex items-center justify-between">
        
        {/* Author Bio/Credits */}
        <div className="flex items-center gap-2">
          {/* Small school initials badge */}
          <div className="w-7 h-7 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/30 rounded flex items-center justify-center font-bold text-[10px] font-display">
            {article.authorName.charAt(0)}
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-stone-800 dark:text-[#eee9df] leading-none">{article.authorName}</span>
            </div>
            <span className="text-[9px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5 max-w-[140px] font-sans">{article.authorSchool}</span>
          </div>
        </div>

        {/* Reaction Stamp Aggregate Summary */}
        <div className="flex items-center gap-3">
          
          {/* Comments Count */}
          <div className="flex items-center gap-1 text-slate-500 dark:text-stone-400 text-xs font-semibold" title={`${article.commentsCount || 0} comments`}>
            <MessageSquare className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
            <span>{article.commentsCount || 0}</span>
          </div>

          {/* Reactions Total Badge */}
          {totalReactions > 0 && (
            <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span>{totalReactions} reacts</span>
            </div>
          )}

        </div>

      </div>

        </article>
      </TiltedCard>
    </motion.div>
  );
}
