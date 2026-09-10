import React from 'react';
import { ArrowRight, Heart, Award, BookOpen, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Article } from '../types';
import SpecularButton from './SpecularButton';
// @ts-ignore
import scholarlyChallengesImg from '../assets/images/scholarly_challenges_1783955263991.jpg';

interface GreenboardHeroProps {
  articles?: Article[];
  onSelectArticle?: (id: string) => void;
  onWriteEssay?: () => void;
}

export default function GreenboardHero({
  articles = [],
  onSelectArticle = () => {},
  onWriteEssay = () => {}
}: GreenboardHeroProps) {
  // Compute real dynamic statistics from existing articles
  const publishedArticles = articles.filter(a => a.status === 'Published');
  const totalPublishedCount = publishedArticles.length;
  
  // Extract participating countries
  const uniqueCountriesCount = new Set(articles.map(a => a.authorCountry)).size || 5;
  
  // Compute unique scholars
  const uniqueScholarsCount = new Set(articles.map(a => a.authorId)).size || 5;
  
  // Find featured student papers
  const featuredArticle = publishedArticles[0] || {
    id: 'sample-1',
    title: 'Climate Resilience in Rural Infrastructure',
    category: 'Science & Tech',
    authorName: 'Alex Mercer',
    coverImage: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=600'
  };

  const secondArticle = publishedArticles[1] || {
    id: 'sample-2',
    title: 'Monologues of a Lost City & Poetic ruins',
    category: 'Arts & Culture',
    authorName: 'Sanjay Kumar',
    coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600'
  };

  return (
    <div 
      className="relative overflow-hidden bg-[#fdfcf0] py-16 px-4 sm:px-6 lg:px-8 select-none"
      style={{
        background: 'radial-gradient(circle at 50% 30%, rgba(82, 54, 36, 0.06) 0%, rgba(58, 33, 19, 0.25) 45%, rgba(38, 19, 10, 0.52) 75%, rgba(22, 11, 5, 0.72) 100%)'
      }}
    >
      {/* Dynamic Fading Grid overlay: colored warm espresso lines that fade near center and seamlessly fade out at the bottom */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-100"
        style={{
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
        }}
      >
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(61, 37, 23, 0.38) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(61, 37, 23, 0.38) 1px, transparent 1px)
            `,
            backgroundSize: '36px 36px',
            maskImage: 'radial-gradient(ellipse at 50% 30%, transparent 12%, rgba(0, 0, 0, 0.25) 38%, black 60%, rgba(0, 0, 0, 0.8) 75%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, transparent 12%, rgba(0, 0, 0, 0.25) 38%, black 60%, rgba(0, 0, 0, 0.8) 75%, transparent 100%)'
          }}
        />
      </div>

      {/* Decorative ambient glowing espresso halos at the far outer edges */}
      <div className="absolute top-0 left-0 -translate-x-1/2 translate-y-1/4 w-[450px] h-[450px] bg-[#3a2012]/35 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 translate-x-1/2 translate-y-1/4 w-[450px] h-[450px] bg-[#3a2012]/35 rounded-full blur-[100px] pointer-events-none" />

      {/* Centered Main Hero Text Area */}
      <div className="max-w-4xl mx-auto text-center space-y-6 relative z-20 mb-10 lg:mb-4">
        <h1 className="text-[32px] sm:text-[43px] lg:text-[43px] font-display font-medium text-[#111111] tracking-tight leading-[47.2px] max-w-3xl mx-auto">
          A global student-led initiative collecting <br className="hidden sm:inline" />
          <span className="font-serif italic font-normal text-[#111111]">authentic, unfiltered stories</span> from learners around the world.
        </h1>
        
        <p className="text-stone-600 font-sans text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          impactED is a youth-led global education initiative turning lived educational experiences and discrepancies into meaningful reformations.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <SpecularButton
            size="lg"
            radius={9999}
            tint="#fcdcb6"
            tintOpacity={0.04}
            blur={0}
            textColor="#ffffff"
            lineColor="#fcdcb6"
            baseColor="#141414"
            intensity={1}
            shineSize={14}
            shineFade={45}
            thickness={1.5}
            speed={0.35}
            followMouse
            proximity={250}
            autoAnimate={false}
            onClick={() => {
              console.log('clicked');
              onWriteEssay?.();
            }}
          >
            Get Started
          </SpecularButton>
        </div>
      </div>

      {/* Bento Collage Grid with Product Sans Font */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 mt-1.5 lg:-mt-[90px] relative z-10 font-productsans">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 lg:items-end items-stretch">
          
          {/* Column 1: Card 1 (Dark Espresso folder-tab) & Card 2 (Let them be heard) */}
          <div className="flex flex-col space-y-4 font-productsans lg:translate-y-0 transition-all duration-500">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 22,
                opacity: { duration: 0.35 },
                y: { type: 'spring', stiffness: 280, damping: 24 }
              }}
              onClick={() => {
                const librarySection = document.getElementById('library-section');
                if (librarySection) librarySection.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col group cursor-pointer"
            >
              {/* Folder Tab top-left */}
              <div className="h-6 bg-[#4a2e1b] rounded-t-xl w-24 flex items-center justify-center self-start text-[9px] text-[#fcdcb6] font-mono tracking-widest uppercase font-bold">
                ARCHIVE
              </div>
              {/* Card body */}
              <div className="bg-[#4a2e1b] rounded-b-2xl rounded-tr-2xl p-5 flex flex-col justify-between min-h-[200px] h-full shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="white" strokeWidth="1.5" />
                    <path d="M0,62 Q25,42 50,62 T100,62" fill="none" stroke="white" strokeWidth="1.5" />
                  </svg>
                </div>
                
                <div className="relative z-10">
                  <span className="text-4xl font-productsans font-black text-[#fcdcb6] block">
                    {totalPublishedCount}
                  </span>
                  <p className="text-[10.5px] text-stone-100 leading-relaxed mt-3 font-productsans font-normal opacity-90">
                    Scholastic peer-reviewed papers authored and reviewed by student leaders across {uniqueCountriesCount} participating nations.
                  </p>
                </div>

                <div className="relative z-10 flex items-center justify-between mt-4">
                  <span className="text-[10.5px] text-stone-200 font-bold tracking-wider uppercase font-productsans">Explore papers</span>
                  <div className="w-7 h-7 rounded-full bg-[#fcdcb6] flex items-center justify-center text-[#4a2e1b] hover:scale-110 transition-transform shrink-0">
                    <ArrowRight className="w-4 h-4 -rotate-45" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Let them be heard */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 22,
                delay: 0.05,
                opacity: { duration: 0.35 },
                y: { type: 'spring', stiffness: 280, damping: 24 }
              }}
              onClick={onWriteEssay}
              className="bg-[#141414] rounded-2xl p-5 flex flex-col justify-between min-h-[180px] h-full shadow-sm hover:bg-[#1a1a1a] transition-colors duration-300 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-[#fcdcb6] shrink-0 group-hover:scale-105 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </div>
              <div className="space-y-1.5">
                <p className="text-[#fcdcb6] text-[10px] font-mono tracking-widest uppercase font-bold">Write & Share</p>
                <p className="text-white text-[13px] font-productsans font-semibold leading-snug">
                  Let student voices be heard globally
                </p>
                <p className="text-stone-400 text-[10px] font-productsans">
                  Submit your research paper to join the academic circle.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Column 2: Card 3 (Health Image folder-tab) - Hidden on mobile */}
          <div className="hidden md:flex flex-col lg:translate-y-0 font-productsans transition-all duration-500">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 22,
                delay: 0.1,
                opacity: { duration: 0.35 },
                y: { type: 'spring', stiffness: 280, damping: 24 }
              }}
              onClick={() => onSelectArticle(featuredArticle.id)}
              className="flex flex-col group cursor-pointer"
            >
              {/* Folder Tab top-left */}
              <div className="h-6 bg-[#7b5033] rounded-t-xl px-4 flex items-center justify-center self-start text-[10px] text-[#fcdcb6] font-productsans font-semibold tracking-wider">
                {featuredArticle.category}
              </div>
              {/* Card body with image */}
              <div 
                className="rounded-b-2xl rounded-tr-2xl h-[290px] shadow-sm relative overflow-hidden flex flex-col justify-end p-5 bg-cover bg-center"
                style={{ 
                  backgroundImage: `linear-gradient(to top, rgba(82, 54, 36, 0.95) 0%, rgba(82, 54, 36, 0.3) 50%, rgba(0,0,0,0) 100%), url('${featuredArticle.coverImage}')` 
                }}
              >
                <div className="relative z-10 space-y-1.5">
                  <p className="text-white text-[13px] font-productsans leading-snug font-bold">
                    {featuredArticle.title}
                  </p>
                  <p className="text-[10px] text-stone-300 font-productsans">
                    By {featuredArticle.authorName}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] text-[#fcdcb6] font-bold uppercase tracking-widest font-productsans">Featured Study</span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                      <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Column 3: Card 4 (Join 5000+ Donate) */}
          <div className="flex flex-col lg:translate-y-0 font-productsans transition-all duration-500">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 22,
                delay: 0.15,
                opacity: { duration: 0.35 },
                y: { type: 'spring', stiffness: 280, damping: 24 }
              }}
              onClick={onWriteEssay}
              className="flex flex-col group cursor-pointer"
            >
              <div className="bg-[#f2e6d8] rounded-2xl p-5 flex flex-col justify-between h-[190px] shadow-xs text-center border border-[#e2d6c8]">
                <div className="my-auto">
                  <h4 className="text-[#141414] text-[16px] font-productsans font-bold leading-snug">
                    Join {uniqueScholarsCount} <br /> Active Scholars
                  </h4>
                  <p className="text-[10px] text-stone-600 font-productsans mt-1">
                    Share research, exchange peer feedback, and earn recognition.
                  </p>
                </div>
                
                <div className="flex items-center justify-between border-t border-stone-400/20 pt-3">
                  <span className="text-[10px] text-stone-700 font-bold uppercase tracking-wider font-productsans">Write blog</span>
                  <div className="w-7 h-7 rounded-full bg-[#141414] flex items-center justify-center text-white hover:scale-110 transition-transform">
                    <ArrowRight className="w-4 h-4 -rotate-45" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Column 4: Card 5 (Education Image folder-tab) - Hidden on mobile */}
          <div className="hidden md:flex flex-col lg:translate-y-0 font-productsans transition-all duration-500">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 22,
                delay: 0.2,
                opacity: { duration: 0.35 },
                y: { type: 'spring', stiffness: 280, damping: 24 }
              }}
              onClick={() => onSelectArticle(secondArticle.id)}
              className="flex flex-col group cursor-pointer"
            >
              {/* Folder Tab top-left */}
              <div className="h-6 bg-[#634e40] rounded-t-xl px-4 flex items-center justify-center self-start text-[10px] text-[#fcdcb6] font-productsans font-semibold tracking-wider">
                {secondArticle.category}
              </div>
              {/* Card body with image */}
              <div 
                className="rounded-b-2xl rounded-tr-2xl h-[290px] shadow-sm relative overflow-hidden flex flex-col justify-end p-5 bg-cover bg-center"
                style={{ 
                  backgroundImage: `linear-gradient(to top, rgba(40, 30, 24, 0.95) 0%, rgba(40, 30, 24, 0.3) 50%, rgba(0,0,0,0) 100%), url('${secondArticle.coverImage}')` 
                }}
              >
                <div className="relative z-10 space-y-1.5">
                  <p className="text-white text-[13px] font-productsans leading-snug font-bold">
                    {secondArticle.title}
                  </p>
                  <p className="text-[10px] text-stone-300 font-productsans">
                    By {secondArticle.authorName}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] text-[#fcdcb6] font-bold uppercase tracking-widest font-productsans">Global Voice</span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                      <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Column 5: Card 6 (Golden Sand illustration) & Card 7 (Academic standard) */}
          <div className="flex flex-col space-y-4 font-productsans lg:translate-y-0 transition-all duration-500">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 22,
                delay: 0.25,
                opacity: { duration: 0.35 },
                y: { type: 'spring', stiffness: 280, damping: 24 }
              }}
              onClick={onWriteEssay}
              className="flex flex-col group cursor-pointer"
            >
              {/* Folder Tab top-left */}
              <div className="h-6 bg-[#fcdcb6] rounded-t-xl w-24 flex items-center justify-center self-start text-[9px] text-[#4a2e1b] font-mono tracking-widest uppercase font-bold">
                PUBLISH
              </div>
              {/* Card body with grayscale image */}
              <div className="bg-[#fcdcb6] rounded-b-2xl rounded-tr-2xl p-5 flex flex-col justify-between h-[210px] shadow-sm relative overflow-hidden">
                {/* Grayscale hand-reaching image with mix-blend-multiply to tint warm */}
                <div className="absolute inset-0 opacity-95 mix-blend-multiply pointer-events-none">
                  <img 
                    src={scholarlyChallengesImg} 
                    alt="Active Scholarly Writing" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover contrast-105 brightness-105"
                  />
                </div>
                
                {/* Wavy layout overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#fcdcb6]/40 to-transparent pointer-events-none" />

                <div className="relative z-10">
                  {/* Kept clear for image representation */}
                </div>

                <div className="relative z-10 flex items-center justify-between mt-auto">
                  <span className="text-[10.5px] text-[#4a2e1b] font-bold tracking-wider uppercase font-productsans">Submit Manuscript</span>
                  <div className="w-7 h-7 rounded-full bg-[#4a2e1b] flex items-center justify-center text-[#fcdcb6] hover:scale-110 transition-transform">
                    <ArrowRight className="w-4 h-4 -rotate-45" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 7: Scholastic Community */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 22,
                delay: 0.3,
                opacity: { duration: 0.35 },
                y: { type: 'spring', stiffness: 280, damping: 24 }
              }}
              className="bg-[#3d2517] rounded-2xl p-5 flex flex-col justify-between h-[190px] shadow-sm hover:bg-[#482e1d] transition-colors duration-300 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#fcdcb6]/10 border border-[#fcdcb6]/20 flex items-center justify-center text-[#fcdcb6] shrink-0 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[#fcdcb6] text-[10px] font-mono tracking-widest uppercase font-bold">Academic Standard</p>
                <p className="text-white text-[13px] font-productsans font-semibold leading-snug">
                  Scholarly Honor Code & Integrity
                </p>
                <p className="text-stone-300 text-[10px] font-productsans">
                  Every paper undergoes a peer-evaluated quality check.
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
