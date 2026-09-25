import React, { useState } from 'react';
import { 
  ArrowRight, 
  Globe, 
  Instagram, 
  Twitter, 
  Facebook, 
  ShieldCheck, 
  BookOpen, 
  Check, 
  X,
  Sparkles,
  Lock
} from 'lucide-react';

interface EditorialFooterProps {
  onSelectCategory?: (category: string) => void;
  onScrollToFeed: () => void;
  loading?: boolean;
}

export const EditorialFooter: React.FC<EditorialFooterProps> = ({
  onSelectCategory: _onSelectCategory,
  onScrollToFeed,
  loading: _loading = false,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeModal, setActiveModal] = useState<'honor' | 'privacy' | 'terms' | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed(true);
    try {
      localStorage.setItem('scholastic_newsletter_subscriber', email);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <footer 
      id="editorial-footer"
      className="bg-gradient-to-b from-[#2d1e16] via-[#1d130d] to-[#0d0a08] text-[#ded6c7] border-t border-[#422c20] relative overflow-hidden selection:bg-[#523624] selection:text-[#fcdcb6]"
    >
      {/* Subtle vignette / texture background accent */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-45 mix-blend-soft-light"
        style={{
          backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(205, 155, 105, 0.14) 0%, rgba(50, 30, 20, 0.2) 50%, transparent 80%)'
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 pt-10 sm:pt-14 pb-6 flex flex-col items-center">
        
        {/* 1. TOP CREST & FOUNDING CITATION */}
        <div className="flex flex-col items-center select-none text-center">
          {/* Scholastic Silhouette / Crest Icon */}
          <div className="w-7 h-7 flex items-center justify-center text-[#c5bba8] hover:text-[#eee9df] transition-colors mb-1">
            <svg 
              viewBox="0 0 48 48" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 stroke-current"
              strokeWidth="1.8"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {/* Classical Academic Laurels & Torch Silhouette */}
              <path d="M24 6V30" />
              <path d="M19 14C17 19 18 24 24 30C30 24 31 19 29 14" />
              <path d="M24 30V42" />
              <path d="M17 42H31" />
              {/* Laurel left */}
              <path d="M14 18C11 22 11 28 15 32C17 34 20 35 24 35" strokeDasharray="1 3" />
              {/* Laurel right */}
              <path d="M34 18C37 22 37 28 33 32C31 34 28 35 24 35" strokeDasharray="1 3" />
              {/* Star of scholarship */}
              <circle cx="24" cy="6" r="2.5" fill="currentColor" />
            </svg>
          </div>

          {/* Founding subtitle */}
          <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[#938b7e] font-semibold">
            EST. 2024 — STUDENT SCHOLARSHIP ARCHIVE
          </span>
        </div>

        {/* 2. HERO TITLE: 'impactED' (MATCHING BRAND HEADER STYLING) */}
        <div className="w-full text-center my-3 sm:my-4 select-none">
          <h2 
            className="font-display font-bold italic tracking-tighter text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem] text-[#fcdcb6] hover:text-amber-200 transition-colors drop-shadow-sm leading-none cursor-default"
          >
            impactED
          </h2>
        </div>

        {/* 3. EDITORIAL STATEMENT SUBTITLE */}
        <div className="text-center max-w-xl mx-auto space-y-1 mb-4 sm:mb-5 px-4">
          <p className="font-serif italic text-xs sm:text-sm md:text-base text-[#b0a797] font-normal leading-relaxed">
            We share student scholarship when there is something worth discovering.
          </p>
          <p className="font-sans text-[11px] text-[#7d7465] max-w-md mx-auto leading-relaxed">
            Continuous academic learning, global community bonds, and peer-moderated student voices.
          </p>
        </div>

        {/* 4. NEWSLETTER / UPDATES INPUT */}
        <div className="w-full max-w-sm mx-auto mb-5 sm:mb-6">
          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="relative group">
              <div className="relative flex items-center border-b border-[#3d352b] focus-within:border-[#ded6c7] group-hover:border-[#574c3e] transition-colors pb-1.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER YOUR EMAIL"
                  required
                  className="w-full bg-transparent text-center text-xs font-mono tracking-[0.22em] text-[#eee9df] placeholder:text-[#696153] uppercase outline-none px-6 py-0.5 transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to scholarly digest"
                  className="absolute right-1 text-[#8f8677] hover:text-[#ded6c7] hover:translate-x-0.5 transition-all p-0.5 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            <div className="p-2.5 bg-[#1e1b17] border border-[#3b3227] text-center space-y-0.5 rounded-none animate-fade-in">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#fcdcb6] flex items-center justify-center gap-1.5 font-bold">
                <Check className="w-3 h-3 text-emerald-400" />
                Subscription Confirmed
              </p>
              <p className="text-[10px] text-[#938b7e] font-serif">
                You will receive periodic curated dispatches of peer-reviewed student research.
              </p>
            </div>
          )}
        </div>

        {/* 5. MINIMALIST SOCIAL & COMMUNITY ICONS */}
        <div className="flex items-center justify-center gap-5 sm:gap-6 mb-7 sm:mb-8 text-[#857c6e] select-none">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook Community"
            className="hover:text-[#ded6c7] hover:scale-110 transition-all p-0.5"
          >
            <Facebook className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Gallery"
            className="hover:text-[#ded6c7] hover:scale-110 transition-all p-0.5"
          >
            <Instagram className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X / Twitter Feed"
            className="hover:text-[#ded6c7] hover:scale-110 transition-all p-0.5"
          >
            <Twitter className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://impactedglobal.xyz"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="impactED Global Portal"
            className="hover:text-[#ded6c7] hover:scale-110 transition-all p-0.5"
            title="impactED Global Website"
          >
            <Globe className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onScrollToFeed}
            aria-label="Jump to article feed"
            className="hover:text-[#ded6c7] hover:scale-110 transition-all p-0.5 cursor-pointer"
            title="Browse Student Articles"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6. BOTTOM BAR */}
        <div className="w-full border-t border-[#26211c] pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.14em] text-[#7d7465]">
          
          {/* Left: Cookie / Terms / Privacy / Honor & Trust */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 order-2 md:order-1">
            <button 
              onClick={() => setActiveModal('terms')} 
              className="hover:text-[#ded6c7] transition-colors cursor-pointer"
            >
              Terms
            </button>
            <button 
              onClick={() => setActiveModal('privacy')} 
              className="hover:text-[#ded6c7] transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <button 
              onClick={() => setActiveModal('honor')} 
              className="hover:text-[#ded6c7] transition-colors cursor-pointer"
            >
              Honor Code
            </button>
            <span className="hidden sm:inline text-[#4a4237]">•</span>
            <span className="inline-flex items-center gap-1 text-[8.5px] bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 font-mono uppercase tracking-wider font-semibold">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
              Under 18 Safe Platform
            </span>
            <span className="hidden lg:inline text-[#4a4237]">•</span>
            <span className="hidden lg:inline text-[#665e52]">Academic License 2.0</span>
          </div>

          {/* Center: Copyright Statement */}
          <div className="text-center order-1 md:order-2 text-[#999081]">
            <p>2026 © impactED STUDENT PUBLISHING GROUP. ALL RIGHTS RESERVED.</p>
          </div>
        </div>

      </div>

      {/* MODAL: HONOR CODE & GUIDELINES / PRIVACY DIALOG */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-[#191613] text-[#ded6c7] border border-[#3d3328] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-5 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#332b22] pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h3 className="font-display font-bold text-lg sm:text-xl text-[#eee9df]">
                  {activeModal === 'honor' && 'Community Honor Code & Academic Integrity'}
                  {activeModal === 'privacy' && "Author Privacy & Children's Safety Policy"}
                  {activeModal === 'terms' && 'Publication Terms & Student Ownership'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[#857c6e] hover:text-[#eee9df] p-1.5 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs sm:text-sm text-[#b5ad9e] leading-relaxed max-h-[60vh] overflow-y-auto pr-2 font-serif">
              {activeModal === 'honor' && (
                <>
                  <p>
                    <strong>1. Original Student Authorship:</strong> Every submission published on the Scholastic Archive must represent the student's authentic intellectual inquiry, primary source engagement, and critical thinking.
                  </p>
                  <p>
                    <strong>2. Verifiable Citations:</strong> All external quotes, scientific facts, historical accounts, and statistical data must be cited through standard academic practices (MLA, APA, or Chicago).
                  </p>
                  <p>
                    <strong>3. Constructive Peer Commentary:</strong> Reviews, grade stamps, and editorial remarks must uphold respectful academic discourse aimed at elevating student authors.
                  </p>
                  <p>
                    <strong>4. Zero Plagiarism Tolerance:</strong> Automated screening and faculty moderators uphold rigorous authenticity checks on all drafts.
                  </p>
                </>
              )}

              {activeModal === 'privacy' && (
                <>
                  <p>
                    <strong>Under 18 Protection:</strong> In compliance with global child protection guidelines and COPPA standards, student authors may elect to publish using pseudonyms, initialed surnames, or approved classroom identifiers.
                  </p>
                  <p>
                    <strong>Data Minimization:</strong> We do not sell student information, profile reading habits for commercial advertising, or distribute contact info to third parties.
                  </p>
                  <p>
                    <strong>Parental and School Rights:</strong> Authorized teachers and guardians can request prompt redactions, corrections, or unpublishing of student content at any time.
                  </p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p>
                    <strong>Author Retains Copyright:</strong> All student writers retain complete intellectual property ownership of their manuscripts, poems, essays, and creative investigations.
                  </p>
                  <p>
                    <strong>Non-Exclusive Educational License:</strong> By publishing on the Scholastic Archive, authors grant the community an open, non-exclusive educational license to read, archive, and cite their research.
                  </p>
                  <p>
                    <strong>No Commercial Monetization:</strong> The platform operates as a non-profit educational publication initiative.
                  </p>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#332b22] pt-4 flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#7d7465] uppercase tracking-wider">
                impactED Scholastic Governance
              </span>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-[#2a241e] hover:bg-[#3d3328] text-[#fcdcb6] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default EditorialFooter;
