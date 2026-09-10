import React from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import GlareHover from './GlareHover';

interface HangingTeamCardsProps {
  adminProfiles: UserProfile[];
}

export default function HangingTeamCards({ adminProfiles }: HangingTeamCardsProps) {
  // Override with the exact requested team members to guarantee their display
  const teamList = [
    {
      uid: 'team-diya',
      email: 'khadkadiya1111@gmail.com',
      displayName: 'Diya Khadka',
      school: 'Founder | CEO',
      country: 'Nepal',
      bio: 'Diya Khadka is a recent high school graduate dedicated to exploring how research and policy can transform education in Nepal.',
      role: 'Founder',
      createdAt: Date.now(),
      badges: ['Founder', 'CEO']
    },
    {
      uid: 'team-bhanu',
      email: 'bhanubhaktabanjade@gmail.com',
      displayName: 'Bhanu Bhakta Banjade',
      school: 'Co-founder | Executive Director',
      country: 'Nepal',
      bio: 'Bhanu Banjade is a recent high school graduate dedicated to exploring the intersections of philosophy, education, and computer science through research and global collaboration.',
      role: 'Co-founder',
      createdAt: Date.now(),
      badges: ['Co-founder', 'Director']
    },
    {
      uid: 'team-pratham',
      email: 'dahalpratham02@gmail.com',
      displayName: 'Pratham Dahal',
      school: 'Content, Communication & Media Lead',
      country: 'Nepal',
      bio: 'An A-Level student and nation-representing musician, Pratham is a researcher whose work spans engineering, youth media, and education, united by a belief that students should help shape the systems they learn in.',
      role: 'Lead',
      createdAt: Date.now(),
      badges: ['Media Lead', 'Musician']
    }
  ];

  // Unique card styles customized for their actual roles, replicating the provided original design
  const CARD_STYLES = [
    {
      // Left Card: Sand/Beige Organizer Card (Diya Khadka)
      cardBg: 'bg-[#d0c8b8] text-stone-900 border-[#c2baa8]/60 shadow-[0_20px_40px_rgba(40,35,25,0.18)]',
      strapBg: 'bg-[#c2baa8]',
      strapTextColor: 'text-[#4e483b]',
      strapText: 'impactED. • impactED. • impactED. • impactED.',
      badgeTitle: 'Founder',
      badgeSubtitle: 'CEO • ACCESS ALL AREAS',
      accentColor: 'text-[#585244]',
      logoColor: 'text-stone-950',
      tagBg: 'bg-stone-900/10 text-stone-800 border-stone-900/10',
      lineStyle: 'border-stone-800/20'
    },
    {
      // Middle Card: Dark Graphite Speaker Card (Bhanu Bhakta Banjade)
      cardBg: 'bg-gradient-to-b from-[#202022] to-[#121214] text-white border-white/5 shadow-[0_25px_45px_rgba(0,0,0,0.35)]',
      strapBg: 'bg-[#181819] border-t border-stone-800',
      strapTextColor: 'text-stone-300',
      strapText: 'impactED. • impactED. • impactED. • impactED.',
      badgeTitle: 'Director',
      badgeSubtitle: 'EXECUTIVE • STAGE ACCESS',
      accentColor: 'text-stone-300',
      logoColor: 'text-white',
      tagBg: 'bg-white/10 text-stone-100 border-white/10',
      lineStyle: 'border-white/10'
    },
    {
      // Right Card: Light Grey/White Volunteer Card (Pratham Dahal)
      cardBg: 'bg-[#e6e6e8] text-[#1c1c1e] border-stone-300/40 shadow-[0_20px_40px_rgba(0,0,0,0.12)]',
      strapBg: 'bg-[#dddddf]',
      strapTextColor: 'text-stone-500',
      strapText: 'impactED. • impactED. • impactED. • impactED.',
      badgeTitle: 'Lead',
      badgeSubtitle: 'GUEST & MEDIA AREA',
      accentColor: 'text-stone-600',
      logoColor: 'text-stone-900',
      tagBg: 'bg-stone-900/5 text-stone-800 border-stone-900/10',
      lineStyle: 'border-stone-400/20'
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row items-stretch justify-center gap-12 lg:gap-8 xl:gap-14 py-16 px-4 max-w-6xl mx-auto overflow-visible select-none">
      {teamList.map((member, idx) => {
        const style = CARD_STYLES[idx];
        
        return (
          <motion.div
            key={member.uid || `team-card-${idx}`}
            className="relative flex flex-col items-center w-full max-w-[290px] mx-auto overflow-visible group"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* LANYARD TEXTILE STRAP */}
            <div className="relative w-7 h-28 flex flex-col items-center overflow-visible z-10">
              <div className={`w-6 h-28 ${style.strapBg} rounded-t-sm shadow-md flex items-center justify-center relative overflow-hidden border-x border-black/5`}>
                {/* Textile weave effect (fine repeating diagonal pattern) */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[size:3px_3px] bg-[position:0_0,1.5px_1.5px] opacity-[0.03]" />
                
                {/* Vertical Text written on the strap, identical to original picture design */}
                <div className={`absolute bottom-3 top-1 text-[7.5px] font-display font-black italic tracking-tighter whitespace-nowrap ${style.strapTextColor} [writing-mode:vertical-lr] text-center select-none overflow-hidden h-24`}>
                  {style.strapText}
                </div>
              </div>
              
              {/* Strap fold line / shadow representation */}
              <div className="absolute bottom-0 w-6 h-[1px] bg-black/20" />
            </div>

            {/* HIGH-POLISHED METAL BUCKLE, D-RING & CLASP CONNECTORS */}
            <div className="relative w-12 h-14 -mt-1 flex flex-col items-center z-20 overflow-visible">
              {/* Oval Metal D-Ring Loop */}
              <div className="w-10 h-6 border-[3px] border-stone-400 rounded-b-full bg-gradient-to-b from-stone-300 via-stone-400 to-stone-500 shadow-md relative flex items-center justify-center">
                {/* D-ring Inner void space */}
                <div className="w-[28px] h-[14px] bg-[#fdfcf0] rounded-b-full absolute top-0 border-t border-stone-500" />
                {/* Metal Highlights */}
                <div className="absolute inset-0 w-full h-[1.5px] bg-white/50 top-[1px] rounded-full" />
              </div>

              {/* Swivel Bolt Pivot Joint */}
              <div className="w-2.5 h-3 bg-gradient-to-r from-stone-400 via-stone-200 to-stone-500 border-x border-stone-400 shadow-xs relative z-10" />
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-stone-100 via-stone-300 to-stone-500 border border-stone-400 shadow-xs flex items-center justify-center relative z-20">
                {/* Tiny rivet center */}
                <div className="w-1.5 h-1.5 rounded-full bg-stone-500 shadow-inner" />
              </div>

              {/* Metallic Snap Trigger Hook Clasp (Curved Wire Overlapping Card punch hole) */}
              <div className="relative w-4 h-8 flex justify-center -mt-0.5 overflow-visible z-30">
                {/* Main thick metallic clasp hook arm */}
                <div className="w-3.5 h-7 rounded-b-md border-[2.5px] border-stone-400 border-t-0 bg-transparent absolute top-0 flex items-end justify-center shadow-xs">
                  <div className="w-full h-1/2 bg-gradient-to-b from-stone-300 to-stone-500 absolute bottom-0 rounded-b-xs" />
                </div>
                {/* Left side spring lever trigger clip detail */}
                <div className="w-[2px] h-5 bg-gradient-to-b from-stone-200 to-stone-400 absolute left-[-1.5px] top-1 rounded-full shadow-xs" />
                {/* Clasp highlight */}
                <div className="w-[1.5px] h-4 bg-white/70 absolute right-[2px] top-1.5 rounded-full" />
              </div>
            </div>

            {/* THE LANYARD PASS BADGE CARD */}
            <motion.div
              className={`w-[270px] h-[415px] -mt-1.5 rounded-[20px] relative border ${style.cardBg} transition-all duration-500 ease-out hover:-translate-y-2.5 hover:scale-[1.045] hover:shadow-[0_32px_64px_rgba(0,0,0,0.32)] overflow-hidden`}
              style={{ transformOrigin: "top center" }}
              whileHover={{ 
                rotate: idx === 0 ? -1.5 : idx === 1 ? 0 : 1.5
              }}
            >
              <GlareHover
                glareColor="#ffffff"
                glareOpacity={0.3}
                glareAngle={-30}
                glareSize={300}
                transitionDuration={800}
                playOnce={false}
                className="w-full h-full p-6 flex flex-col justify-between relative rounded-[20px]"
              >
                {/* Backlight shine layer for cards */}
                <div className="absolute inset-0 rounded-[20px] bg-gradient-to-tr from-white/0 via-white/[0.04] to-white/[0.15] pointer-events-none" />

                {/* Card Punch Hole - situated at top center */}
                <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[14px] h-[14px] rounded-full bg-[#18181a]/25 border border-black/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] z-10 flex items-center justify-center">
                  {/* Card material thickness edge indicator */}
                  <div className="w-full h-full rounded-full border-[1.5px] border-white/10 pointer-events-none" />
                </div>

                {/* CARD CONTENTS: TOP LEVEL (BRANDING & NUMERIC SYMBOL) */}
                <div className="flex items-center justify-between mt-3">
                  {/* elegant custom logo matching the picture font styling */}
                  <span className={`font-display font-black italic tracking-tighter text-sm ${style.logoColor}`}>
                    impactED.
                  </span>
                  
                  {/* Numeric symbol on right, identical to the photo "1." */}
                  <span className="font-mono text-xs font-bold opacity-30 tracking-widest">
                    {idx + 1}.
                  </span>
                </div>

                {/* CARD CONTENTS: MIDDLE MAIN METRIC & DETAILS */}
                <div className="flex flex-col flex-grow justify-center py-2">
                  <div className="space-y-2.5">
                    {/* Event/Publishing Details Block */}
                    <div className="space-y-0.5">
                      <p className={`text-[10px] font-mono tracking-widest uppercase font-bold ${style.accentColor}`}>
                        Scholastic Editorial Board
                      </p>
                      <h4 className="font-productsans font-black text-2xl leading-none tracking-tight">
                        {member.displayName}
                      </h4>
                      <p className="text-[10px] font-mono opacity-80 select-all font-semibold tracking-tight break-all">
                        {member.email}
                      </p>
                    </div>

                    {/* Divider line exactly replicating the photo */}
                    <div className={`border-t ${style.lineStyle} w-full`} />

                    {/* Credentials / Institution / Biography details */}
                    <div className="space-y-1.5">
                      <div>
                        <p className={`text-[8px] font-mono uppercase font-extrabold tracking-wider ${style.accentColor}`}>
                          Affiliation
                        </p>
                        <p className="text-[10.5px] font-sans font-bold opacity-90 leading-tight">
                          {member.school}
                        </p>
                      </div>

                      {member.country && (
                        <div>
                          <p className={`text-[8px] font-mono uppercase font-extrabold tracking-wider ${style.accentColor}`}>
                            Representing
                          </p>
                          <p className="text-[10.5px] font-sans font-bold opacity-90 flex items-center gap-1 leading-tight">
                            🇳🇵 {member.country}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className={`text-[8px] font-mono uppercase font-extrabold tracking-wider ${style.accentColor}`}>
                          Academic Bio
                        </p>
                        <p className="text-[10px] font-serif leading-normal italic opacity-85 line-clamp-3">
                          "{member.bio}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD CONTENTS: BOTTOM MAJOR BRUTALIST STATUS TEXT */}
                <div className="pt-4 border-t border-black/5 flex flex-col justify-end">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <h3 className="font-display font-black text-3xl tracking-tight leading-none">
                      {style.badgeTitle}
                    </h3>
                    <span className="font-mono text-[9px] opacity-40">twnty.de</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] uppercase tracking-widest font-extrabold opacity-75">
                      {style.badgeSubtitle}
                    </span>
                    <span className="font-mono text-[9px] font-bold opacity-30">{idx + 1}.</span>
                  </div>
                </div>
              </GlareHover>
            </motion.div>

            {/* PHYSICAL CARD SHADOW - projected onto backing plane for massive 3D depth */}
            <div className="absolute bottom-[-18px] w-[82%] h-4 rounded-full bg-stone-900/10 blur-md pointer-events-none transition-all duration-700 ease-out group-hover:scale-x-95 group-hover:opacity-40" />
          </motion.div>
        );
      })}
    </div>
  );
}
