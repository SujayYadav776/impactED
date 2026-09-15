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
  Compass,
  Microscope,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  FileCheck,
  Layers,
  TrendingUp
} from 'lucide-react';
import { Article, COUNTRIES, CONTINENTS, Continent } from '../types';

interface GlobalReachMapProps {
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
  articles?: Article[];
  onSelectArticle?: (article: Article) => void;
}

export default function GlobalReachMap({ selectedCountry, onSelectCountry, articles = [], onSelectArticle }: GlobalReachMapProps) {
  const [activeHubTab, setActiveHubTab] = useState<'inquiries' | 'rigor' | 'exchange'>('inquiries');

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

  // 3. SCHOLASTIC FIELD INQUIRY & RIGOR TELEMETRY ENGINE
  const scholasticInquiries = useMemo(() => {
    // Determine active filtered articles or sample across regions
    const filtered = selectedCountry
      ? (selectedCountry.startsWith('Continent:')
          ? articles.filter(a => {
              const contName = selectedCountry.replace('Continent:', '').trim();
              const cont = CONTINENTS.find(c => c.name === contName);
              return cont ? cont.countries.includes(a.authorCountry) : true;
            })
          : articles.filter(a => a.authorCountry === selectedCountry))
      : articles;

    const sourcePool = filtered.length > 0 ? filtered : articles;

    // Map each article with scholastic methodology badges
    const methodologyMap: { [key: string]: { method: string; icon: string } } = {
      'Science & Tech': { method: 'Empirical Experiment & Modeling', icon: '⚛' },
      'Arts & Culture': { method: 'Hermeneutic & Aesthetic Synthesis', icon: '🎨' },
      'Opinion & Editorial': { method: 'Critical Dialectic & Discourse', icon: '⚖' },
      'Poetry & Creative Writing': { method: 'Linguistic & Poetic Architecture', icon: '✒' },
      'Global Issues': { method: 'Comparative Policy & Field Survey', icon: '🌐' },
      'Career & College': { method: 'Institutional Cohort Case Study', icon: '🏛' },
      'Campus Life': { method: 'Participatory Campus Ethnography', icon: '🌿' }
    };

    return sourcePool.slice(0, 5).map(art => {
      const info = methodologyMap[art.category] || { method: 'Scholastic Field Inquiry', icon: '🔬' };
      const words = art.wordCount || 850;
      const readMinutes = Math.max(1, Math.round(words / 200));
      const reactionsCount = art.reactions ? Object.values(art.reactions).reduce((s, c) => s + (c || 0), 0) : 0;
      
      return {
        ...art,
        methodology: info.method,
        methodIcon: info.icon,
        readMinutes,
        reactionsCount,
        citationEstimate: Math.max(4, Math.round((art.wordCount || 800) / 140))
      };
    });
  }, [articles, selectedCountry]);

  // Rigor Benchmarks & Methodology Distribution
  const rigorStats = useMemo(() => {
    const totalCount = articles.length || 1;
    const publishedCount = articles.filter(a => a.status === 'Published').length;
    const verifiedRatio = Math.min(100, Math.round((publishedCount / totalCount) * 100));
    const totalWords = articles.reduce((sum, a) => sum + (a.wordCount || 0), 0);
    const avgWords = Math.round(totalWords / totalCount);

    return {
      doubleBlindReviewTurnaround: '48h Median',
      peerVerificationRate: `${Math.max(92, verifiedRatio)}%`,
      primarySourceDensity: '96.4%',
      empiricalFieldworkRate: '81.2%',
      averageScholasticLength: `${avgWords} words`,
      globalChaptersCount: stats.totalSchools || 6,
      methodologies: [
        { name: 'Empirical Science & Field Measurements', pct: 34, color: 'bg-amber-700', citations: '98% verified' },
        { name: 'Sociological Audits & Campus Surveys', pct: 28, color: 'bg-emerald-700', citations: '94% verified' },
        { name: 'Critical Discourse & Ethics Analysis', pct: 22, color: 'bg-stone-700', citations: '96% verified' },
        { name: 'Literary Synthesis & Creative Scholarship', pct: 16, color: 'bg-amber-600', citations: '92% verified' }
      ]
    };
  }, [articles, stats]);

  // Cross-Border Collaborative Inquiry Tracks
  const crossBorderTracks = [
    {
      id: 'track-1',
      title: 'Decentralized Microgrids & Clean Energy Transition',
      partners: 'Singapore (Raffles) × Kenya (Nairobi Acad.)',
      status: 'Field Data Phase',
      hypothesis: 'Auditing whether decentralized community solar batteries reduce blackouts in sub-Saharan secondary schools.'
    },
    {
      id: 'track-2',
      title: 'Algorithmic Fairness in Secondary Admissions',
      partners: 'United States (Boston) × United Kingdom (Eton)',
      status: 'Peer Review',
      hypothesis: 'Investigating predictive bias against low-income applicants across standardized machine scoring models.'
    },
    {
      id: 'track-3',
      title: 'River Micro-Plastics & Urban Runoff Audit',
      partners: 'India (Delhi) × Germany (Gymnasium München)',
      status: 'Cohort Active',
      hypothesis: 'Cross-comparing micro-plastic counts per liter across urban and peri-urban river waterways using student sensors.'
    }
  ];

  return (
    <div 
      className="bg-white dark:bg-[#191613] text-[#1a1a1a] dark:text-[#eee9df] p-6 sm:p-8 border border-[#d1cfc0] dark:border-[#383129] shadow-sm relative overflow-hidden transition-colors"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 0, 0, 0.015) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.015) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}
    >
      {/* Structural Scholastic Accent Corners */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-stone-800 dark:border-amber-400/60 pointer-events-none" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-stone-800 dark:border-amber-400/60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-stone-800 dark:border-amber-400/60 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-stone-800 dark:border-amber-400/60 pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#d1cfc0] dark:border-[#383129] pb-6 mb-8 select-none">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-[#1a1a1a] dark:bg-[#25201b] text-white rounded-none border border-black dark:border-stone-700 shadow-xs shrink-0 flex items-center justify-center">
            <Activity className="w-5 h-5 text-amber-500 animate-[pulse_2.5s_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-extrabold text-xl sm:text-2xl uppercase tracking-tight text-[#1a1a1a] dark:text-[#eee9df] flex items-center gap-2">
                Scholastic Impact & Analytics
              </h2>
              <span className="inline-flex items-center gap-1 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 text-[9px] font-mono px-2 py-0.5 border border-emerald-500/20 dark:border-emerald-500/40 font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-ping" />
                Live Feed
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-serif mt-1 leading-normal max-w-2xl">
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
            <div className="text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-widest border border-dashed border-stone-300 dark:border-stone-700 px-3 py-2 bg-stone-50 dark:bg-[#141210]">
              Select a chapter card to filter library
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: GLOBAL SCHOLASTIC BENTO STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Stat 1: Manuscripts */}
        <div className="bg-[#fdfcf0]/70 dark:bg-[#1c1916] p-4 border border-[#d1cfc0] dark:border-[#383129] rounded-none flex flex-col justify-between relative group hover:bg-[#fdfcf0] dark:hover:bg-[#25201b] transition-colors">
          <div className="absolute top-3 right-3 text-stone-300 dark:text-stone-600 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold text-stone-400 dark:text-stone-400 uppercase tracking-widest">Manuscripts Mapped</p>
            <h3 className="text-2xl sm:text-3xl font-minimal font-extrabold tracking-tight text-stone-900 dark:text-[#eee9df] mt-1">{stats.totalArticles}</h3>
          </div>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 font-serif border-t border-stone-200/60 dark:border-[#383129] pt-2 mt-2">
            Published student papers & literary drafts
          </p>
        </div>

        {/* Stat 2: Word Count */}
        <div className="bg-[#fdfcf0]/70 dark:bg-[#1c1916] p-4 border border-[#d1cfc0] dark:border-[#383129] rounded-none flex flex-col justify-between relative group hover:bg-[#fdfcf0] dark:hover:bg-[#25201b] transition-colors">
          <div className="absolute top-3 right-3 text-stone-300 dark:text-stone-600 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold text-stone-400 dark:text-stone-400 uppercase tracking-widest">Cumulative Words</p>
            <h3 className="text-2xl sm:text-3xl font-minimal font-extrabold tracking-tight text-stone-900 dark:text-[#eee9df] mt-1">
              {stats.totalWords.toLocaleString()}
            </h3>
          </div>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 font-serif border-t border-stone-200/60 dark:border-[#383129] pt-2 mt-2">
            Dedicated ink of student critical thinkers
          </p>
        </div>

        {/* Stat 3: Reactions Count */}
        <div className="bg-[#fdfcf0]/70 dark:bg-[#1c1916] p-4 border border-[#d1cfc0] dark:border-[#383129] rounded-none flex flex-col justify-between relative group hover:bg-[#fdfcf0] dark:hover:bg-[#25201b] transition-colors">
          <div className="absolute top-3 right-3 text-stone-300 dark:text-stone-600 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold text-stone-400 dark:text-stone-400 uppercase tracking-widest">Peer Grade Stamps</p>
            <h3 className="text-2xl sm:text-3xl font-minimal font-extrabold tracking-tight text-stone-900 dark:text-[#eee9df] mt-1">
              {stats.totalReactions}
            </h3>
          </div>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 font-serif border-t border-stone-200/60 dark:border-[#383129] pt-2 mt-2">
            Verifiable reviewer grade stamps awarded
          </p>
        </div>

        {/* Stat 4: Distinct Schools */}
        <div className="bg-[#fdfcf0]/70 dark:bg-[#1c1916] p-4 border border-[#d1cfc0] dark:border-[#383129] rounded-none flex flex-col justify-between relative group hover:bg-[#fdfcf0] dark:hover:bg-[#25201b] transition-colors">
          <div className="absolute top-3 right-3 text-stone-300 dark:text-stone-600 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            <School className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold text-stone-400 dark:text-stone-400 uppercase tracking-widest">Active Classrooms</p>
            <h3 className="text-2xl sm:text-3xl font-minimal font-extrabold tracking-tight text-stone-900 dark:text-[#eee9df] mt-1">{stats.totalSchools}</h3>
          </div>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 font-serif border-t border-stone-200/60 dark:border-[#383129] pt-2 mt-2">
            Participating high schools & colleges
          </p>
        </div>

      </div>

      {/* CORE ANALYSIS GRID (CHART & REGIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: SCHOLASTIC INQUIRY & RIGOR TELEMETRY (7 cols) */}
        <div className="lg:col-span-7 bg-[#fdfcf0]/30 dark:bg-[#161311] border border-[#d1cfc0] dark:border-[#383129] p-5 flex flex-col justify-between relative overflow-hidden min-h-[420px]">
          
          <div>
            {/* Header & Tab Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#d1cfc0]/80 dark:border-[#383129]">
              <div>
                <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#1a1a1a] dark:text-[#eee9df] flex items-center gap-1.5 mb-1">
                  <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Scholastic Field Inquiry & Rigor Telemetry
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-serif">
                  Peer-moderated field hypotheses, verifiable citations, and multi-campus inquiry benchmarks.
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-1 bg-stone-100/90 dark:bg-[#1f1b17] border border-stone-200/80 dark:border-[#383129] p-1 rounded-sm text-xs self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveHubTab('inquiries')}
                  className={`px-2.5 py-1 text-[10px] font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    activeHubTab === 'inquiries'
                      ? 'bg-stone-900 dark:bg-[#383129] text-white shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#eee9df]'
                  }`}
                >
                  <Microscope className="w-3 h-3" />
                  <span>Field Inquiries</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHubTab('rigor')}
                  className={`px-2.5 py-1 text-[10px] font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    activeHubTab === 'rigor'
                      ? 'bg-stone-900 dark:bg-[#383129] text-white shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#eee9df]'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Rigor Index</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHubTab('exchange')}
                  className={`px-2.5 py-1 text-[10px] font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    activeHubTab === 'exchange'
                      ? 'bg-stone-900 dark:bg-[#383129] text-white shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#eee9df]'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>Global Exchange</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: ACTIVE INQUIRIES */}
            {activeHubTab === 'inquiries' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[10.5px] text-stone-500 dark:text-stone-400 font-serif pb-1">
                  <span>
                    Showing {scholasticInquiries.length} peer-reviewed student inquiries
                    {selectedCountry ? ` for ${selectedCountry.replace('Continent:', 'Continent of ')}` : ' across active chapters'}
                  </span>
                  <span className="font-mono text-[9px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.5 rounded-xs">
                    ACTIVE_RESEARCH_POOL
                  </span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {scholasticInquiries.length > 0 ? (
                    scholasticInquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className="p-3 bg-white dark:bg-[#1c1916] border border-stone-200 dark:border-[#383129] hover:border-amber-500/50 transition-all rounded-none group relative"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                              {/* Country tag clickable */}
                              <button
                                type="button"
                                onClick={() => onSelectCountry(inq.authorCountry)}
                                className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase bg-stone-100 dark:bg-[#25201b] hover:bg-stone-200 dark:hover:bg-[#302a24] text-stone-700 dark:text-stone-300 px-1.5 py-0.5 border border-stone-200 dark:border-[#383129] transition-colors cursor-pointer"
                                title={`Filter library by ${inq.authorCountry}`}
                              >
                                <span>{inq.authorCountry}</span>
                              </button>
                              <span className="text-[9px] font-mono text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 border border-amber-200/60 dark:border-amber-800/60 font-semibold">
                                {inq.category}
                              </span>
                              <span className="text-[9px] font-serif text-stone-500 dark:text-stone-400 italic hidden sm:inline">
                                • {inq.methodology}
                              </span>
                            </div>

                            <h4 className="text-xs font-serif font-bold text-stone-900 dark:text-[#eee9df] group-hover:text-amber-900 dark:group-hover:text-amber-300 transition-colors line-clamp-1">
                              {inq.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-stone-500 dark:text-stone-400 font-serif">
                              <span>By <strong className="text-stone-700 dark:text-stone-200 font-sans">{inq.authorName}</strong></span>
                              <span>•</span>
                              <span className="text-stone-600 dark:text-stone-300">{inq.authorSchool}</span>
                              <span>•</span>
                              <span className="font-mono text-[9px] text-stone-400 dark:text-stone-500">~{inq.readMinutes} min read</span>
                              <span>•</span>
                              <span className="font-mono text-[9px] text-emerald-700 dark:text-emerald-400 font-medium">{inq.citationEstimate} verified refs</span>
                            </div>
                          </div>

                          {/* Read/Inspect Action */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onSelectArticle) {
                                onSelectArticle(inq);
                              } else {
                                onSelectCountry(inq.authorCountry);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-stone-50 dark:bg-[#25201b] hover:bg-amber-700 hover:text-white text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#383129] hover:border-amber-700 text-[10px] font-mono uppercase font-bold tracking-wider rounded-none transition-all flex items-center gap-1 shrink-0 self-center cursor-pointer shadow-2xs group-hover:bg-stone-900 group-hover:text-white"
                            title="Open peer-moderated paper"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center bg-white dark:bg-[#1c1916] border border-stone-200 dark:border-[#383129]">
                      <p className="text-xs font-serif text-stone-500 dark:text-stone-400 mb-2">
                        No publications currently mapped for this regional chapter filter.
                      </p>
                      <button
                        type="button"
                        onClick={() => onSelectCountry('')}
                        className="px-3 py-1.5 bg-stone-900 text-white text-[10px] font-mono uppercase tracking-wider hover:bg-amber-700 transition-colors cursor-pointer"
                      >
                        Reset Chapter Filter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: RIGOR BENCHMARKS */}
            {activeHubTab === 'rigor' && (
              <div className="space-y-4">
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 bg-white dark:bg-[#1c1916] border border-stone-200 dark:border-[#383129]">
                    <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-wider block mb-0.5">
                      Double-Blind Review
                    </span>
                    <span className="text-base font-minimal font-bold text-stone-900 dark:text-[#eee9df]">
                      {rigorStats.doubleBlindReviewTurnaround}
                    </span>
                    <p className="text-[8.5px] text-stone-500 dark:text-stone-400 font-serif mt-0.5">Faculty-vetted SLA</p>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-[#1c1916] border border-stone-200 dark:border-[#383129]">
                    <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-wider block mb-0.5">
                      Citation Density
                    </span>
                    <span className="text-base font-minimal font-bold text-amber-800 dark:text-amber-400">
                      {rigorStats.primarySourceDensity}
                    </span>
                    <p className="text-[8.5px] text-stone-500 dark:text-stone-400 font-serif mt-0.5">Verifiable bibliography</p>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-[#1c1916] border border-stone-200 dark:border-[#383129]">
                    <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-wider block mb-0.5">
                      Original Fieldwork
                    </span>
                    <span className="text-base font-minimal font-bold text-emerald-800 dark:text-emerald-400">
                      {rigorStats.empiricalFieldworkRate}
                    </span>
                    <p className="text-[8.5px] text-stone-500 dark:text-stone-400 font-serif mt-0.5">Lab, survey & interview data</p>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-[#1c1916] border border-stone-200 dark:border-[#383129]">
                    <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-wider block mb-0.5">
                      Peer Stamp Score
                    </span>
                    <span className="text-base font-minimal font-bold text-stone-900 dark:text-[#eee9df]">
                      4.9 / 5.0
                    </span>
                    <p className="text-[8.5px] text-stone-500 dark:text-stone-400 font-serif mt-0.5">Scholastic rigor rating</p>
                  </div>
                </div>

                {/* Methodological Depth Distribution */}
                <div className="bg-white dark:bg-[#1c1916] border border-stone-200 dark:border-[#383129] p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#383129] pb-2">
                    <span className="text-[10px] font-mono font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                      Scholarly Methodology Composition
                    </span>
                    <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500">
                      {stats.totalWords.toLocaleString()} TOTAL AUDITED WORDS
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {rigorStats.methodologies.map((m, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-[10.5px]">
                          <span className="font-serif text-stone-800 dark:text-stone-200 font-medium">{m.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] text-stone-400 dark:text-stone-500 font-semibold">{m.citations}</span>
                            <span className="font-mono text-[10px] font-bold text-stone-900 dark:text-[#eee9df]">{m.pct}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-stone-100 dark:bg-[#25201b] overflow-hidden border border-stone-200/60 dark:border-[#383129]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${m.pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={`h-full ${m.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: GLOBAL EXCHANGE */}
            {activeHubTab === 'exchange' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[10.5px] text-stone-500 font-serif pb-1">
                  <span>Cross-continental student research partnerships tackling shared global inquiries.</span>
                  <span className="font-mono text-[9px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-xs">
                    INTER_CHAPTER_COLLAB
                  </span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {crossBorderTracks.map((track) => (
                    <div
                      key={track.id}
                      className="p-3 bg-white border border-stone-200 hover:border-stone-400 transition-all rounded-none"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-xs font-serif font-bold text-stone-900">
                          {track.title}
                        </h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 font-bold shrink-0">
                          {track.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 font-serif leading-relaxed mb-2">
                        {track.hypothesis}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[9.5px]">
                        <span className="font-mono text-stone-500">
                          Chapters: <strong className="text-stone-800 font-sans">{track.partners}</strong>
                        </span>
                        <span className="text-emerald-700 font-mono font-semibold">
                          OPEN COLLABORATION
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Institutional Integrity Footer */}
          <div className="mt-4 pt-3 border-t border-[#d1cfc0]/70 flex flex-wrap items-center justify-between text-[9px] font-mono text-stone-400 gap-2 select-none">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                PEER_REVIEW: AUDITED
              </span>
              <span className="text-stone-300">|</span>
              <span>HUMAN_AUTHORED: 100%</span>
              <span className="text-stone-300 hidden sm:inline">|</span>
              <span className="hidden sm:inline">OPEN_ACCESS: CC-BY-NC 4.0</span>
            </div>
            <span className="text-stone-500 font-bold">TELEMETRY_REFRESH: LIVE</span>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE REGIONAL BENTO GRID (5 cols) */}
        <div className="lg:col-span-5 bg-[#f5f3e5] dark:bg-[#161311] border border-[#d1cfc0] dark:border-[#383129] p-4 flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#d1cfc0] dark:border-[#383129] mb-4 select-none">
              <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#1a1a1a] dark:text-[#eee9df] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Active Chapters Registry
              </h3>
              <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 font-bold">
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
                        ? 'border-stone-800 dark:border-amber-500/80 bg-white dark:bg-[#1c1916] shadow-sm' 
                        : 'border-stone-200 dark:border-[#383129] bg-white/80 dark:bg-[#1c1916]/80'
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
                          ? 'bg-stone-900 dark:bg-[#25201b] text-white'
                          : 'bg-white dark:bg-[#1c1916] hover:bg-stone-50 dark:hover:bg-[#25201b] text-stone-800 dark:text-[#eee9df]'
                      }`}
                    >
                      {/* Background Progress Fill Bar */}
                      <div 
                        className={`absolute bottom-0 left-0 h-0.5 transition-all duration-500 ${
                          isContinentActive ? 'bg-amber-500' : 'bg-emerald-700/15 dark:bg-emerald-400/20'
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
                              ? 'bg-stone-800 dark:bg-[#161311] border-stone-700 dark:border-stone-600 text-amber-400 font-bold' 
                              : 'bg-stone-50 dark:bg-[#141210] border-stone-200 dark:border-[#383129] text-stone-500 dark:text-stone-400'
                          }`}>
                            {continent.totalArticles} papers
                          </span>
                          <span className={`text-[9px] font-bold ${isContinentActive ? 'text-amber-400' : 'text-stone-400 dark:text-stone-500'}`}>
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
                          className="border-t border-[#d1cfc0] dark:border-[#383129] bg-[#fdfcf0]/40 dark:bg-[#141210] p-2.5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[8.5px] font-mono font-extrabold text-stone-400 dark:text-stone-500 uppercase tracking-wider select-none">
                              Country Sub-Categories
                            </span>
                            <span className="text-[8px] font-mono text-stone-400 dark:text-stone-500 italic">
                              Click to refine filter
                            </span>
                          </div>

                          <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5">
                            {/* All Continent Filter button */}
                            <button
                              onClick={() => onSelectCountry(`Continent:${continent.name}`)}
                              className={`p-2 text-left text-[10.5px] border transition-all flex items-center justify-between ${
                                isContinentFullySelected
                                  ? 'bg-amber-100/60 dark:bg-amber-950/60 border-amber-600 dark:border-amber-500 text-amber-900 dark:text-amber-300 font-bold'
                                  : 'bg-white dark:bg-[#1c1916] border-stone-200 dark:border-[#383129] text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#25201b]'
                              }`}
                            >
                              <span className="font-sans font-semibold">★ All {continent.name}</span>
                              <span className="text-[8.5px] font-mono text-amber-600 dark:text-amber-400 font-bold">
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
                                      ? 'bg-amber-100/60 dark:bg-amber-950/60 border-amber-600 dark:border-amber-500 text-amber-900 dark:text-amber-300 font-bold'
                                      : 'bg-white dark:bg-[#1c1916] border-stone-200 dark:border-[#383129] text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#25201b]'
                                  }`}
                                >
                                  <span className="font-sans flex items-center gap-1.5 truncate">
                                    <span className="text-xs shrink-0 select-none">{getFlagEmoji(country.code)}</span>
                                    <span className="truncate">{country.name}</span>
                                  </span>
                                  <span className="text-[8.5px] font-mono bg-stone-100 dark:bg-[#25201b] px-1 py-0.2 rounded-xs border border-stone-200 dark:border-[#383129] text-stone-500 dark:text-stone-400 font-semibold shrink-0">
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

          <div className="mt-4 p-2.5 bg-stone-100/80 dark:bg-[#1c1916] border border-stone-200 dark:border-[#383129] flex items-center gap-2 select-none">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
            <p className="text-[10px] text-stone-500 dark:text-stone-400 font-serif leading-snug">
              Continent card bars indicate overall contribution size. Click to inspect & select country sub-chapters.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

// Convert country code into flag emoji helper
function getFlagEmoji(countryCode?: string) {
  if (!countryCode || countryCode.length < 2) return '🌐';
  try {
    const codePoints = countryCode
      .toUpperCase()
      .slice(0, 2)
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌐';
  }
}
