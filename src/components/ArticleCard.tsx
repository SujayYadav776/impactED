import React from 'react';
import { motion } from 'motion/react';
import { Article, ReactionType, UserProfile, getStudentStats } from '../types';
import { Globe, Bookmark, ArrowUpRight } from 'lucide-react';

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
      <article
          className="overflow-hidden rounded-3xl border border-[#e1d8c6] bg-white shadow-[0_4px_16px_-12px_rgba(43,36,28,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_32px_-20px_rgba(43,36,28,0.45)] dark:border-[#3b332b] dark:bg-[#1c1814] flex h-full flex-col group"
        >
      
      {/* Clickable Card Body wrapper */}
      <div className="cursor-pointer" onClick={() => onSelect(article.id)}>
        
        {/* Cover Image */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-3xl bg-[#f1ece2] dark:bg-[#141210] border-b border-[#e1d8c6] dark:border-[#383129]">
          <img 
            src={article.coverImage || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'} 
            alt={article.title}
            className="w-full h-full object-cover saturate-[0.82] group-hover:scale-[1.03] group-hover:saturate-100 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
          {/* Subtle gold ribbon or category pill */}
          <div className="absolute top-3 left-3 pr-10 flex flex-col gap-1.5 items-start max-w-[75%]">
            <span className="rounded-full text-[9px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 border border-white/60 bg-[#faf7f2]/95 text-[#49382c] shadow-sm backdrop-blur-sm dark:border-[#3b332b] dark:bg-[#1c1814]/95 dark:text-[#eee9df]">
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
              className={`absolute top-3 right-3 rounded-full p-2 backdrop-blur-md shadow-md border transition-all hover:scale-110 active:scale-95 cursor-pointer z-10 ${
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
        <div className="p-5 flex-1 flex flex-col">
          <div>
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#8b7b68] dark:text-[#b6a894] font-sans mb-4 font-medium">
              <span className="flex items-center gap-1.5">
                {formatDate(article.createdAt)}
              </span>
              <span className="w-1 h-1 bg-[#c4b8a7] dark:bg-[#665a4d] rounded-full" />
              <span className="flex items-center gap-1 font-bold text-[#576449] dark:text-[#b6c8a4] uppercase text-[9px] tracking-[0.12em]">
                <Globe className="w-3 h-3" />
                {article.authorCountry}
              </span>
            </div>

            {article.status !== 'Published' && (
              <div className="mb-3 rounded-xl px-2.5 py-1.5 bg-[#f6f1e7] border border-[#e1d8c6] text-[10px] text-[#8b4a2d] dark:bg-[#211d18] dark:border-[#3b332b] dark:text-[#f1a184] font-medium font-sans">
                🛡️ <span className="font-bold">Author Preview Only:</span> This submission is private and only visible to you and platform moderators.
              </div>
            )}

            {/* Title */}
            <h3 className="font-platform-serif font-semibold text-[1.35rem] text-[#2b241c] dark:text-[#f4ede2] line-clamp-2 leading-snug group-hover:text-[#a03818] dark:group-hover:text-[#f1a184] transition-colors mb-2.5">
              {article.title}
            </h3>

            {/* Summary description */}
            <p className="text-[#716659] dark:text-[#c7bbaa] text-xs sm:text-sm line-clamp-3 leading-relaxed mb-5 font-platform-sans">
              {article.summary}
            </p>
          </div>

        </div>

      </div>

      {/* Author details */}
      <div className="px-5 py-4 bg-[#f6f1e7]/60 dark:bg-[#211d18] border-t border-[#e1d8c6] dark:border-[#3b332b] flex items-center justify-between">
        
        {/* Author Bio/Credits */}
        <div className="flex items-center gap-2">
          {/* Small school initials badge */}
          <div className="w-8 h-8 rounded-full bg-[#edf2e8] dark:bg-[#293321] text-[#576449] dark:text-[#b6c8a4] border border-[#d8dfce] dark:border-[#414c38] flex items-center justify-center font-platform-serif font-semibold text-sm">
            {article.authorName.charAt(0)}
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-[#2b241c] dark:text-[#f4ede2] leading-none">{article.authorName}</span>
            </div>
            <span className="text-[9px] text-[#8b7b68] dark:text-[#b6a894] line-clamp-1 mt-0.5 max-w-[140px] font-sans">{article.authorSchool}</span>
          </div>
          <span className="sr-only">Open article</span>
          <div className="ml-1 flex items-center text-[#a03818] dark:text-[#f1a184] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

      </div>

      </article>
    </motion.div>
  );
}
