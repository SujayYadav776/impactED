import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { UserProfile } from '../types';

interface HangingTeamCardsProps {
  adminProfiles: UserProfile[];
}

interface TeamMember {
  uid: string;
  displayName: string;
  role: string;
  bio: string;
  initials: string;
  email: string;
  image?: string;
}

const teamList: TeamMember[] = [
  {
    uid: 'team-diya',
    displayName: 'Diya Khadka',
    role: 'Founder & CEO',
    bio: 'Diya Khadka is a recent high school graduate dedicated to exploring how research and policy can transform education in Nepal.',
    initials: 'DK',
    email: 'khadkadiya1111@gmail.com',
  },
  {
    uid: 'team-bhanu',
    displayName: 'Bhanu Bhakta Banjade',
    role: 'Co-founder & Executive Director',
    bio: 'Bhanu Banjade is a recent high school graduate dedicated to exploring the intersections of philosophy, education, and computer science through research and global collaboration.',
    initials: 'BB',
    email: 'bhanubhaktabanjade@gmail.com',
  },
  {
    uid: 'team-pratham',
    displayName: 'Baibhav Shrestha',
    role: 'Tech Director',
    bio: 'Baibhav Shrestha is an undergraduate student and a web developer building digital platforms and exploring emerging technologies to solve real-world problems.',
    initials: 'BS',
    email: 'baibhavstha77@gmail.com',
  },
];

const cardTones = [
  'from-[#f2ded2] to-[#e9c5b2] dark:from-[#442a22] dark:to-[#30201b]',
  'from-[#e2e8d9] to-[#cbd6be] dark:from-[#2b3527] dark:to-[#20291f]',
  'from-[#efe3cb] to-[#dfc9a7] dark:from-[#413522] dark:to-[#2c2419]',
];

export default function HangingTeamCards({ adminProfiles: _adminProfiles }: HangingTeamCardsProps) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3">
      {teamList.map((member, index) => (
        <motion.article
          key={member.uid}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-[#e1d8c6] bg-[#fffdf8] shadow-[0_14px_38px_-26px_rgba(43,36,28,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_-25px_rgba(43,36,28,0.42)] dark:border-[#3b332b] dark:bg-[#1c1814]"
        >
          <div className={`relative isolate aspect-[1.2/1] overflow-hidden rounded-b-[1.5rem] bg-gradient-to-br ${cardTones[index]}`}>
            <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border border-white/35" />
            <div className="pointer-events-none absolute -right-2 -top-6 h-44 w-44 rounded-full border border-dashed border-white/35" />
            <div className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full border border-white/30" />
            <div className="pointer-events-none absolute left-[18%] top-[22%] h-2 w-2 rounded-full bg-white/80 shadow-[0_0_18px_6px_rgba(255,255,255,0.45)]" />
            {member.image ? (
              <img
                src={member.image}
                alt={member.displayName}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                <div className="absolute h-[72%] aspect-square rounded-full border border-white/35" />
                <div className="absolute h-[54%] aspect-square rounded-full border border-dashed border-white/45" />
                <span className="font-platform-serif relative flex h-28 w-28 items-center justify-center rounded-full border border-white/50 bg-white/25 text-4xl font-medium tracking-tight text-[#49382c] shadow-[inset_0_0_35px_rgba(255,255,255,0.25)] backdrop-blur-sm dark:text-[#f4ede2] sm:h-32 sm:w-32">
                  {member.initials}
                </span>
              </div>
            )}
            <span className="font-platform-serif absolute bottom-4 right-5 text-sm italic text-[#49382c]/65 dark:text-[#f4ede2]/70">
              0{index + 1}
            </span>
          </div>

          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <p className="font-platform-sans mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a03818] dark:text-[#f1a184]">
              {member.role}
            </p>
            <h3 className="font-platform-serif text-2xl font-semibold leading-tight tracking-tight text-[#2b241c] dark:text-[#f4ede2]">
              {member.displayName}
            </h3>
            <p className="font-platform-sans mt-1 break-all text-[10px] text-[#8b7b68] dark:text-[#b6a894]">
              {member.email}
            </p>
            <p className="font-platform-sans mt-3 text-sm leading-relaxed text-[#716659] dark:text-[#c7bbaa]">
              {member.bio}
            </p>

            <div className="mt-auto flex items-center justify-between gap-3 pt-6">
              <span className="font-platform-sans text-[9px] font-bold uppercase tracking-[0.14em] text-[#8b7b68] dark:text-[#b6a894]">
                impactED editorial team
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e1d8c6] text-[#a03818] transition-all group-hover:border-[#c1502e] group-hover:bg-[#c1502e] group-hover:text-white dark:border-[#3b332b] dark:text-[#f1a184] dark:group-hover:border-[#e57554] dark:group-hover:bg-[#e57554] dark:group-hover:text-[#211d18]" aria-hidden="true">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
