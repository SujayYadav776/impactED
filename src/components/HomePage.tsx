import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ChevronUp, RotateCcw, Search } from 'lucide-react';
import { Article, UserProfile } from '../types';
import ArticleCard from './ArticleCard';
import GreenboardHero from './GreenboardHero';
import HangingTeamCards from './HangingTeamCards';
import LandingSections from './LandingSections';
// @ts-ignore
import emptyLibraryImg from '../assets/images/empty_library_1783953130670.jpg';

interface HomePageProps {
  articles: Article[];
  currentUser: UserProfile | null;
  selectedCategory: string;
  searchQuery: string;
  isLibraryExpanded: boolean;
  adminProfiles: UserProfile[];
  adminsLoading: boolean;
  onSelectArticle: (id: string) => void;
  onWriteEssay: () => void;
  onStartGuidedWriting: (promptId: string) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
  onToggleLibrary: () => void;
  onToggleBookmark: (articleId: string) => void;
}

export default function HomePage({
  articles,
  currentUser,
  selectedCategory,
  searchQuery,
  isLibraryExpanded,
  adminProfiles,
  adminsLoading,
  onSelectArticle,
  onWriteEssay,
  onStartGuidedWriting,
  onSearchChange,
  onClearFilters,
  onToggleLibrary,
  onToggleBookmark
}: HomePageProps) {
  const filteredArticles = articles.filter((article) => {
    const isAuthor = currentUser && article.authorId === currentUser.uid;
    const isPublic = article.status === 'Published';

    if (!isPublic && !isAuthor && currentUser?.role !== 'admin') {
      return false;
    }

    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory ? article.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });
  const visibleArticles = isLibraryExpanded ? filteredArticles : filteredArticles.slice(0, 9);

  const librarySection = (
    <div id="library-section" className="px-4 sm:px-6 lg:px-10 xl:px-12 space-y-6">
      <div className="bg-white dark:bg-[#1c1814] rounded-3xl border border-[#d1cfc0] dark:border-[#3b332b] p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400 dark:text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search essays, poems, student authors, or keywords..."
            className="w-full bg-stone-50/60 dark:bg-[#141210] border border-[#d1cfc0] dark:border-[#3b332b] rounded-full pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-[#c1502e] dark:focus:ring-[#e57554] shadow-inner text-[#1a1a1a] dark:text-[#eee9df] placeholder:text-stone-400 dark:placeholder:text-stone-500"
          />
        </div>

        {(selectedCategory || searchQuery) && (
          <button
            onClick={onClearFilters}
            className="text-stone-500 dark:text-stone-400 text-xs hover:text-emerald-800 dark:hover:text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {selectedCategory && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-sans uppercase tracking-wider">
          <span>Currently filtering:</span>
          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 rounded-full font-bold">
            Subject: {selectedCategory}
          </span>
        </div>
      )}

      {filteredArticles.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {visibleArticles.map((article) => (
                <div key={article.id}>
                  <ArticleCard
                    article={article}
                    onSelect={onSelectArticle}
                    articles={articles}
                    currentUser={currentUser}
                    onToggleBookmark={onToggleBookmark}
                    isBookmarked={currentUser?.bookmarks?.includes(article.id) || false}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>

          {filteredArticles.length > 9 && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={onToggleLibrary}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-[#a03818] transition-colors hover:bg-[#f6f1e7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c1502e] dark:text-[#f1a184] dark:hover:bg-[#211d18]"
              >
                {isLibraryExpanded ? 'Show less' : 'View more'}
                {isLibraryExpanded ? (
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-white dark:bg-[#1c1814] rounded-3xl border border-[#d1cfc0] dark:border-[#3b332b] flex flex-col items-center justify-center space-y-4">
          <div className="w-48 h-48 rounded-full overflow-hidden border border-[#d1cfc0]/60 dark:border-[#3b332b] bg-[#fdfcf0] dark:bg-[#141210] p-1 shadow-inner relative group">
            <img
              src={emptyLibraryImg}
              alt="No Publications Found"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="font-display font-bold text-[#1a1a1a] dark:text-[#eee9df] text-lg">No Student Publications Found</h4>
            <p className="text-stone-500 dark:text-stone-400 text-xs leading-relaxed">
              Try adjusting your filters, clearing your search query, or checking another participating region.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const teamSection = (
    <section className="relative isolate overflow-hidden border-y border-[#e1d8c6] bg-[#faf7f2] px-4 py-16 dark:border-[#3b332b] dark:bg-[#191613] sm:px-6 sm:py-20 lg:px-10 xl:px-12">
      <svg className="pointer-events-none absolute -right-32 top-0 h-[34rem] w-[34rem] text-[#c1502e]/[0.07] dark:text-[#e57554]/[0.08]" viewBox="0 0 400 400" fill="none" aria-hidden="true">
        <circle cx="200" cy="200" r="118" stroke="currentColor" />
        <circle cx="200" cy="200" r="158" stroke="currentColor" strokeDasharray="2 8" />
        <path d="M66 248c54-100 117-149 188-147 47 1 77 30 82 66 8 52-41 90-91 74-43-14-55-56-32-82 20-23 56-23 76-5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="304" cy="105" r="5" fill="currentColor" />
      </svg>
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 grid gap-5 sm:mb-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h2 className="font-platform-serif text-4xl font-medium tracking-tight text-[#2b241c] dark:text-[#f4ede2] sm:text-5xl">
              Meet our team<span className="italic text-[#a03818] dark:text-[#f1a184]">.</span>
            </h2>
          </div>
          <p className="font-platform-sans max-w-md text-sm leading-relaxed text-[#716659] dark:text-[#c7bbaa] lg:col-span-5 lg:ml-auto">
            A student-led editorial team making room for thoughtful work, new questions, and voices from around the world.
          </p>
        </div>

        {adminsLoading ? (
          <div className="border-y border-[#e1d8c6] py-12 text-center dark:border-[#3b332b]">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#a03818] border-t-transparent dark:border-[#f1a184] dark:border-t-transparent" />
            <span className="font-platform-sans text-xs tracking-wide text-[#8b7b68] dark:text-[#b6a894]">Retrieving editorial board members...</span>
          </div>
        ) : (
          <HangingTeamCards adminProfiles={adminProfiles} />
        )}
      </div>
    </section>
  );

  return (
    <motion.div
      key="homepage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col"
    >
      <GreenboardHero
        articles={articles}
        onSelectArticle={onSelectArticle}
        onWriteEssay={onWriteEssay}
      />

      <LandingSections
        articles={articles}
        onStartGuidedWriting={onStartGuidedWriting}
        librarySection={librarySection}
        teamSection={teamSection}
      />
    </motion.div>
  );
}
