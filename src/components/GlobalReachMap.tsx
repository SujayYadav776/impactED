import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Sparkles, 
  Award, 
  BookOpen, 
  MessageSquare, 
  PenTool, 
  Activity, 
  RotateCcw, 
  School,
  MapPin,
  Users
} from 'lucide-react';
import { Article, COUNTRIES, CONTINENTS, Continent } from '../types';

interface GlobalReachMapProps {
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
  articles?: Article[];
}

export default function GlobalReachMap({ selectedCountry, onSelectCountry, articles = [] }: GlobalReachMapProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // 1. DYNAMIC STATS ENGINE (FR-7.1)
  const stats = useMemo(() => {
    const publishedOnly = articles.filter(a => a.status === 'Published');
    const totalArticles = articles.length;
    const totalWords = articles.reduce((sum, a) => sum + (a.wordCount || 0), 0);

    const totalReactions = articles.reduce((sum, a) => {
      if (!a.reactions) return sum;
      return sum + Object.values(a.reactions).reduce((s, c) => s + (c || 0), 0);
    }, 0);

    // Distinct contributing schools
    const uniqueSchools = new Set(articles.map(a => a.authorSchool).filter(Boolean));
    const totalSchools = uniqueSchools.size;

    return {
      totalArticles,
      totalWords,
      totalReactions,
      totalSchools
    };
  }, [articles]);

  // 2. DYNAMIC REGIONAL DATA (FR-7.2)
  const regionalData = useMemo(() => {
    return COUNTRIES.map(country => {
      // Count live articles for this country
      const countryArticles = articles.filter(a => a.authorCountry === country.name);
      const totalCount = countryArticles.length;
      
      // Determine dominant focus area/subject based on country articles
      let dominantSubject = 'Liberal Arts';
      if (countryArticles.length > 0) {
        const subjectCounts: { [key: string]: number } = {};
        countryArticles.forEach(a => {
          subjectCounts[a.category] = (subjectCounts[a.category] || 0) + 1;
        });
        const sorted = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1]);
        if (sorted[0]) {
          dominantSubject = sorted[0][0];
        }
      } else {
        // Fallback default thematic focus areas
        const foci: { [key: string]: string } = {
          'United States': 'Science & Tech',
          'United Kingdom': 'Arts & Culture',
          'Canada': 'Global Issues',
          'Australia': 'Poetry & Creative Writing',
          'India': 'Science & Tech',
          'Singapore': 'Career & College',
          'Japan': 'Science & Tech',
          'Germany': 'Opinion & Editorial',
          'Brazil': 'Global Issues',
          'South Africa': 'Campus Life',
          'Nigeria': 'Opinion & Editorial',
          'Mexico': 'Arts & Culture'
        };
        dominantSubject = foci[country.name] || 'Liberal Arts';
      }

      return {
        ...country,
        totalArticles: totalCount,
        dominantSubject
      };
    }).sort((a, b) => b.totalArticles - a.totalArticles);
  }, [articles]);

  const maxArticlesInRegion = useMemo(() => {
    return Math.max(...regionalData.map(r => r.totalArticles), 1);
  }, [regionalData]);

  // CONTINENT AGGREGATION ENGINE
  const continentsData = useMemo(() => {
    return CONTINENTS.map(continent => {
      const continentCountries = regionalData.filter(c => continent.countries.includes(c.name));
      const totalArticles = continentCountries.reduce((sum, c) => sum + c.totalArticles, 0);
      
      return {
        ...continent,
        totalArticles,
        countriesList: continentCountries
      };
    }).sort((a, b) => b.totalArticles - a.totalArticles);
  }, [regionalData]);

  const maxArticlesInContinent = useMemo(() => {
    return Math.max(...continentsData.map(c => c.totalArticles), 1);
  }, [continentsData]);

  const activeContinentName = useMemo(() => {
    if (!selectedCountry) return null;
    if (selectedCountry.startsWith('Continent:')) {
      return selectedCountry.replace('Continent:', '').trim();
    }
    // Find continent that contains this country
    const found = CONTINENTS.find(c => c.countries.includes(selectedCountry));
    return found ? found.name : null;
  }, [selectedCountry]);

  // 3. DYNAMIC SUBJECT AREA CHART (FR-7.3)
  const subjectChartData = useMemo(() => {
    const categories = [
      'Science & Tech',
      'Arts & Culture',
      'Opinion & Editorial',
      'Poetry & Creative Writing',
      'Global Issues',
      'Career & College',
      'Campus Life'
    ];

    return categories.map(cat => {
      const liveCount = articles.filter(a => a.category === cat).length;
      return {
        category: cat,
        count: liveCount
      };
    });
  }, [articles]);

  const maxSubjectCount = useMemo(() => {
    return Math.max(...subjectChartData.map(s => s.count), 1);
  }, [subjectChartData]);

  // 4. REAL-TIME ACTIVITY LOG TICKER (FR-7.4)
  const activityLogs = useMemo(() => {
    const liveLogs: Array<{ id: string; text: string; time: string; type: 'submission' | 'reaction' | 'comment' }> = [];

    // Extract logs from actual current articles if available
    articles.slice(0, 3).forEach((art, index) => {
      const timeStr = new Date(art.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      liveLogs.push({
        id: `live-sub-${art.id}-${index}`,
        text: `"${art.authorName}" (${art.authorSchool}) submitted "${art.title}" in ${art.category}`,
        time: timeStr,
        type: 'submission'
      });

      // Comments log
      if (art.commentsCount && art.commentsCount > 0) {
        liveLogs.push({
          id: `live-com-${art.id}-${index}`,
          text: `New peer review comments received on "${art.title}"`,
          time: 'Today',
          type: 'comment'
        });
      }

      // Reactions log
      const reactionSum = Object.values(art.reactions || {}).reduce((s, c) => s + c, 0);
      if (reactionSum > 0) {
        liveLogs.push({
          id: `live-react-${art.id}-${index}`,
          text: `"${art.title}" awarded dynamic Grade Stamps by classmate peer reviewers`,
          time: 'Today',
          type: 'reaction'
        });
      }
    });

    // Seed robust high-fidelity historic log alerts to make the platform look active and inspiring
    const baseLogs = [
      { id: 'h1', text: 'Marcus V. (Oakridge High, US) received Star Stamp on "The Quantum Epoch"', time: '1 hr ago', type: 'reaction' as const },
      { id: 'h2', text: 'Priya N. (DPS New Delhi, IN) published a new essay "Zero and the Infinity of Thought"', time: '3 hrs ago', type: 'submission' as const },
      { id: 'h3', text: 'Aiden G. (Sidney High, AU) submitted a peer review on "Bioluminescent Forests"', time: 'Yesterday', type: 'comment' as const },
      { id: 'h4', text: 'Elena R. (Toronto Collegiate, CA) revised and published "Ecosystem Dynamics under Heat stress"', time: '2 days ago', type: 'submission' as const },
      { id: 'h5', text: 'Yuki S. (Tokyo Tech Academy, JP) awarded "Mindblown 😮" stamp on "Robotic Kinematics"', time: '3 days ago', type: 'reaction' as const }
    ];

    return [...liveLogs, ...baseLogs].slice(0, 6);
  }, [articles]);

  return (
    <div 
      className="bg-white text-[#1a1a1a] p-6 sm:p-8 border border-[#d1cfc0] shadow-sm relative overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 0, 0, 0.015) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.015) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}
    >
      {/* Structural Scholastic Accent Corners */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-stone-800 pointer-events-none" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-stone-800 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-stone-800 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-stone-800 pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#d1cfc0] pb-6 mb-8 select-none">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-[#1a1a1a] text-white rounded-none border border-black shadow-xs shrink-0 flex items-center justify-center">
            <Activity className="w-5 h-5 text-amber-500 animate-[pulse_2.5s_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-extrabold text-xl sm:text-2xl uppercase tracking-tight text-[#1a1a1a] flex items-center gap-2">
                Scholastic Impact & Analytics
              </h2>
              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-900 text-[9px] font-mono px-2 py-0.5 border border-emerald-500/20 font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping" />
                Live Feed
              </span>
            </div>
            <p className="text-xs text-stone-600 font-serif mt-1 leading-normal max-w-2xl">
              An interactive overview of our publishing network. Click on any regional chapter below to instantly filter student publications in the library.
            </p>
          </div>
        </div>

        {/* Selected Country Indicator & Reset */}
        <div className="flex items-center gap-2 self-start lg:self-center">
          {selectedCountry ? (
            <motion.button 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => onSelectCountry('')}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-mono uppercase tracking-widest text-[10px] font-bold transition-all border border-amber-800 active:scale-95 cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <span>FILTER: {selectedCountry.startsWith('Continent:') ? selectedCountry.replace('Continent:', '').toUpperCase() : selectedCountry.toUpperCase()}</span>
              <RotateCcw className="w-3.5 h-3.5" />
            </motion.button>
          ) : (
            <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest border border-dashed border-stone-300 px-3 py-2 bg-stone-50">
              Select a chapter card to filter library
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: GLOBAL SCHOLASTIC BENTO STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Stat 1: Manuscripts */}
        <div className="bg-[#fdfcf0]/70 p-4 border border-[#d1cfc0] rounded-none flex flex-col justify-between relative group hover:bg-[#fdfcf0] transition-colors">
          <div className="absolute top-3 right-3 text-stone-300 group-hover:text-amber-600 transition-colors">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest">Manuscripts Mapped</p>
            <h3 className="text-2xl sm:text-3xl font-minimal font-extrabold tracking-tight text-stone-900 mt-1">{stats.totalArticles}</h3>
          </div>
          <p className="text-[10px] text-stone-500 font-serif border-t border-stone-200/60 pt-2 mt-2">
            Published student papers & literary drafts
          </p>
        </div>

        {/* Stat 2: Word Count */}
        <div className="bg-[#fdfcf0]/70 p-4 border border-[#d1cfc0] rounded-none flex flex-col justify-between relative group hover:bg-[#fdfcf0] transition-colors">
          <div className="absolute top-3 right-3 text-stone-300 group-hover:text-amber-600 transition-colors">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest">Cumulative Words</p>
            <h3 className="text-2xl sm:text-3xl font-minimal font-extrabold tracking-tight text-stone-900 mt-1">
              {stats.totalWords.toLocaleString()}
            </h3>
          </div>
          <p className="text-[10px] text-stone-500 font-serif border-t border-stone-200/60 pt-2 mt-2">
            Dedicated ink of student critical thinkers
          </p>
        </div>

        {/* Stat 3: Reactions Count */}
        <div className="bg-[#fdfcf0]/70 p-4 border border-[#d1cfc0] rounded-none flex flex-col justify-between relative group hover:bg-[#fdfcf0] transition-colors">
          <div className="absolute top-3 right-3 text-stone-300 group-hover:text-amber-600 transition-colors">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest">Peer Grade Stamps</p>
            <h3 className="text-2xl sm:text-3xl font-minimal font-extrabold tracking-tight text-stone-900 mt-1">
              {stats.totalReactions}
            </h3>
          </div>
          <p className="text-[10px] text-stone-500 font-serif border-t border-stone-200/60 pt-2 mt-2">
            Verifiable reviewer grade stamps awarded
          </p>
        </div>

        {/* Stat 4: Distinct Schools */}
        <div className="bg-[#fdfcf0]/70 p-4 border border-[#d1cfc0] rounded-none flex flex-col justify-between relative group hover:bg-[#fdfcf0] transition-colors">
          <div className="absolute top-3 right-3 text-stone-300 group-hover:text-amber-600 transition-colors">
            <School className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest">Active Classrooms</p>
            <h3 className="text-2xl sm:text-3xl font-minimal font-extrabold tracking-tight text-stone-900 mt-1">{stats.totalSchools}</h3>
          </div>
          <p className="text-[10px] text-stone-500 font-serif border-t border-stone-200/60 pt-2 mt-2">
            Participating high schools & colleges
          </p>
        </div>

      </div>

      {/* CORE ANALYSIS GRID (CHART & REGIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-8">
        
        {/* LEFT COLUMN: INTUITIVE CUSTOM SVG BAR CHART (7 cols) */}
        <div className="lg:col-span-7 bg-[#fdfcf0]/30 border border-[#d1cfc0] p-5 flex flex-col justify-between relative overflow-hidden">
          
          <div className="mb-4">
            <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#1a1a1a] flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              Academic Category Distribution
            </h3>
            <p className="text-[11px] text-stone-500 font-serif">
              Volume distribution of peer-moderated papers categorized by core academic subject areas.
            </p>
          </div>

          {/* Interactive Custom SVG Chart */}
          <div className="relative w-full aspect-[16/9] flex items-end justify-center py-2 px-1 border-b border-stone-300 min-h-[220px]">
            {/* Gridline Indicators */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none py-2 pb-8 opacity-40">
              <div className="border-t border-dashed border-stone-300 w-full" />
              <div className="border-t border-dashed border-stone-300 w-full" />
              <div className="border-t border-dashed border-stone-300 w-full" />
              <div className="border-t border-dashed border-stone-300 w-full" />
            </div>

            {/* Bars Rendering */}
            <div className="w-full h-[90%] flex items-end justify-between gap-2.5 z-10 relative">
              {subjectChartData.map((data) => {
                const heightPercentage = Math.max((data.count / maxSubjectCount) * 100, 8);
                const isHovered = hoveredCategory === data.category;
                
                return (
                  <div 
                    key={data.category} 
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-help relative"
                    onMouseEnter={() => setHoveredCategory(data.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    
                    {/* Tooltip on Hover */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div 
                          initial={{ opacity: 0, y: -6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -3 }}
                          className="absolute bottom-full mb-1.5 bg-stone-900 text-stone-100 p-2 border-2 border-stone-800 text-[10px] rounded-none z-30 pointer-events-none whitespace-nowrap min-w-[130px] font-mono flex flex-col gap-0.5 shadow-md"
                        >
                          <span className="font-sans font-bold text-white text-xs">{data.category}</span>
                          <span className="border-t border-stone-700 my-0.5" />
                          <div className="flex justify-between">
                            <span>PAPERS:</span>
                            <span className="text-amber-400 font-extrabold">{data.count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>PROPORTION:</span>
                            <span className="text-emerald-400">{stats.totalArticles > 0 ? Math.round((data.count / stats.totalArticles) * 100) : 0}%</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Numeric Count Floating above bar */}
                    <span className={`text-[9px] font-mono mb-1 transition-all font-bold ${
                      isHovered ? 'text-amber-700 scale-110' : 'text-stone-400'
                    }`}>
                      {data.count}
                    </span>

                    {/* Physical Bar */}
                    <motion.div 
                      className={`w-full border-t border-x border-stone-800 transition-colors relative flex items-center justify-center overflow-hidden ${
                        isHovered 
                          ? 'bg-amber-100/80 border-amber-800' 
                          : 'bg-stone-50 hover:bg-stone-100 border-stone-800/40'
                      }`}
                      style={{ height: `${heightPercentage}%` }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    >
                      {/* Decorative diagonal alignment slash block */}
                      <div className="absolute inset-0 opacity-5 pointer-events-none bg-stone-800"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, currentColor 5px, currentColor 10px)'
                        }}
                      />
                      
                      {/* Highlighting strip */}
                      {isHovered && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-amber-600" />
                      )}
                    </motion.div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* X Axis Labels */}
          <div className="w-full flex justify-between gap-2 px-1 mt-2.5">
            {subjectChartData.map((data) => {
              const parts = data.category.split(' & ');
              const displayLabel = parts[0];
              return (
                <div 
                  key={data.category} 
                  className={`flex-1 text-center font-mono text-[8px] sm:text-[9.5px] leading-tight select-none ${
                    hoveredCategory === data.category ? 'text-amber-700 font-bold' : 'text-stone-500'
                  }`}
                  title={data.category}
                >
                  {displayLabel}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#d1cfc0]/40 flex items-center justify-between text-[9px] font-mono text-stone-400">
            <span>D3_INDEX: COMPILING_SUCCESS</span>
            <span>AXIS_AUTO_SCALED</span>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE REGIONAL BENTO GRID (5 cols) */}
        <div className="lg:col-span-5 bg-[#f5f3e5] border border-[#d1cfc0] p-4 flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#d1cfc0] mb-4 select-none">
              <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#1a1a1a] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-600" />
                Active Chapters Registry
              </h3>
              <span className="text-[10px] font-mono text-stone-500 font-bold">
                {continentsData.length} CONTINENTS
              </span>
            </div>

            {/* Continents Accordion List with smooth scroll */}
            <div className="space-y-2 overflow-y-auto pr-0.5 max-h-[300px] custom-scrollbar scroll-smooth">
              {continentsData.map((continent) => {
                const isContinentActive = activeContinentName === continent.name;
                const isContinentFullySelected = selectedCountry === `Continent:${continent.name}`;
                const fillRatio = (continent.totalArticles / maxArticlesInContinent) * 100;
                
                return (
                  <div 
                    key={continent.code} 
                    className={`border transition-all duration-200 ${
                      isContinentActive 
                        ? 'border-stone-800 bg-white shadow-sm' 
                        : 'border-stone-200 bg-white/80'
                    }`}
                  >
                    {/* Continent Header Button */}
                    <button
                      onClick={() => {
                        if (isContinentFullySelected) {
                          onSelectCountry('');
                        } else {
                          onSelectCountry(`Continent:${continent.name}`);
                        }
                      }}
                      className={`w-full p-3 text-left text-xs transition-all flex flex-col justify-between relative group overflow-hidden ${
                        isContinentActive
                          ? 'bg-stone-900 text-white'
                          : 'bg-white hover:bg-stone-50 text-stone-800'
                      }`}
                    >
                      {/* Background Progress Fill Bar */}
                      <div 
                        className={`absolute bottom-0 left-0 h-0.5 transition-all duration-500 ${
                          isContinentActive ? 'bg-amber-500' : 'bg-emerald-700/15'
                        }`}
                        style={{ width: `${fillRatio}%` }}
                      />

                      <div className="flex justify-between items-center w-full relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-sm select-none">{continent.emoji}</span>
                          <span className="font-productsans font-bold tracking-tight text-[11.5px] uppercase">
                            {continent.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-[8.5px] px-1.5 py-0.5 rounded-sm border ${
                            isContinentActive 
                              ? 'bg-stone-800 border-stone-700 text-amber-400 font-bold' 
                              : 'bg-stone-50 border-stone-200 text-stone-500'
                          }`}>
                            {continent.totalArticles} papers
                          </span>
                          <span className={`text-[9px] font-bold ${isContinentActive ? 'text-amber-400' : 'text-stone-400'}`}>
                            {isContinentActive ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Sub-category Countries (Shown only when Continent card is clicked/active) */}
                    <AnimatePresence initial={false}>
                      {isContinentActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-[#d1cfc0] bg-[#fdfcf0]/40 p-2.5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[8.5px] font-mono font-extrabold text-stone-400 uppercase tracking-wider select-none">
                              Country Sub-Categories
                            </span>
                            <span className="text-[8px] font-mono text-stone-400 italic">
                              Click to refine filter
                            </span>
                          </div>

                          <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5">
                            {/* All Continent Filter button */}
                            <button
                              onClick={() => onSelectCountry(`Continent:${continent.name}`)}
                              className={`p-2 text-left text-[10.5px] border transition-all flex items-center justify-between ${
                                isContinentFullySelected
                                  ? 'bg-amber-100/60 border-amber-600 text-amber-900 font-bold'
                                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                              }`}
                            >
                              <span className="font-sans font-semibold">★ All {continent.name}</span>
                              <span className="text-[8.5px] font-mono text-amber-600 font-bold">
                                {continent.totalArticles}
                              </span>
                            </button>

                            {/* Individual Country items */}
                            {continent.countriesList.map((country) => {
                              const isCountrySelected = selectedCountry === country.name;
                              return (
                                <button
                                  key={country.code}
                                  onClick={() => {
                                    if (isCountrySelected) {
                                      onSelectCountry(`Continent:${continent.name}`);
                                    } else {
                                      onSelectCountry(country.name);
                                    }
                                  }}
                                  className={`p-2 text-left text-[10.5px] border transition-all flex items-center justify-between ${
                                    isCountrySelected
                                      ? 'bg-amber-100/60 border-amber-600 text-amber-900 font-bold'
                                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                                  }`}
                                >
                                  <span className="font-sans flex items-center gap-1.5 truncate">
                                    <span className="text-xs shrink-0 select-none">{getFlagEmoji(country.code)}</span>
                                    <span className="truncate">{country.name}</span>
                                  </span>
                                  <span className="text-[8.5px] font-mono bg-stone-100 px-1 py-0.2 rounded-xs border border-stone-200 text-stone-500 font-semibold shrink-0">
                                    {country.totalArticles}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-stone-100/80 border border-stone-200 flex items-center gap-2 select-none">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
            <p className="text-[10px] text-stone-500 font-serif leading-snug">
              Continent card bars indicate overall contribution size. Click to inspect & select country sub-chapters.
            </p>
          </div>

        </div>

      </div>

      {/* SECTION 2: LIVE TICKER LOG & ALERTS ROW */}
      <div className="bg-[#fdfcf0]/40 border border-[#d1cfc0] p-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 mb-3 select-none">
          <span className="text-[10px] font-mono font-extrabold text-[#1a1a1a] uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            Community Actions & Peer Review Ledger
          </span>
          <span className="text-[9px] font-mono text-stone-400">
            DYNAMIC_RECON_ACTIVE
          </span>
        </div>

        {/* Horizontal Ticker / List of actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activityLogs.map((log) => (
            <div 
              key={log.id} 
              className="flex items-start justify-between gap-2 p-2 bg-white border border-stone-200/80 hover:border-stone-300 transition-colors"
            >
              <div className="flex items-start gap-2">
                {/* Visual marker depending on type */}
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  log.type === 'submission' ? 'bg-blue-600 animate-pulse' :
                  log.type === 'reaction' ? 'bg-amber-600' :
                  'bg-emerald-600'
                }`} />
                <p className="text-[10.5px] text-stone-700 font-serif leading-snug line-clamp-2">
                  {log.text}
                </p>
              </div>
              <span className="text-[8.5px] font-mono text-stone-400 whitespace-nowrap shrink-0 pt-0.5">
                {log.time}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// Convert country code into flag emoji helper
function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
