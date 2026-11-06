import type { ReactNode } from 'react';
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Globe2,
  HeartHandshake,
  PenLine,
  ShieldCheck,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Article } from '../types';
import { WRITING_PROMPTS } from './GuidedWritingPage';
import GlobalPerspectiveGlobe from './GlobalPerspectiveGlobe';

interface LandingSectionsProps {
  articles: Article[];
  onStartGuidedWriting: (promptId: string) => void;
  librarySection: ReactNode;
  teamSection: ReactNode;
};

const values = [
  {
    icon: PenLine,
    title: 'Original student work',
    description: 'Submissions should reflect the student’s own research and authentic scholarship.',
  },
  {
    icon: BookOpen,
    title: 'Credit your sources',
    description: 'Attribute quotations, statistics, and other source material with academic citations.',
  },
  {
    icon: HeartHandshake,
    title: 'Respectful exchange',
    description: 'Comments and peer feedback should uphold constructive academic discussion.',
  },
  {
    icon: ShieldCheck,
    title: 'Student ownership',
    description: 'Authors retain copyright; publication grants the community a non-exclusive educational license.',
  },
];

const faqs = [
  {
    question: 'What can I submit?',
    answer: 'The writing form supports essays, blogs, and articles. Choose a subject category and share original student work.',
  },
  {
    question: 'Does submitting publish my work right away?',
    answer: 'No. A submission is marked for review and moderation before it can be published.',
  },
  {
    question: 'Can I save my work and finish it later?',
    answer: 'Yes. The writing form includes a Save Draft option so you can return to your work.',
  },
  {
    question: 'Who owns my writing?',
    answer: 'Authors retain copyright. The publication terms provide the community a non-exclusive educational license to read, archive, and cite published work.',
  },
  {
    question: 'What should I check before submitting?',
    answer: 'The submission form asks you to confirm original authorship, proper attribution, and respectful community and safety guidelines.',
  },
];

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl mb-10 sm:mb-12">
      <h2 className="font-platform-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#2b241c] dark:text-[#f4ede2] mb-4">
        {title}
      </h2>
      {description && (
        <p className="font-platform-sans text-base sm:text-lg text-[#7c7061] dark:text-[#c7bbaa] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  key?: string | number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingSections({
  articles,
  onStartGuidedWriting,
  librarySection,
  teamSection,
}: LandingSectionsProps) {
  const publishedArticles = articles.filter((article) => article.status === 'Published');
  const countriesRepresented = new Set(
    publishedArticles.map((article) => article.authorCountry.trim()).filter(Boolean)
  ).size;
  const totalWords = publishedArticles.reduce((total, article) => total + (article.wordCount || 0), 0);

  return (
    <>
      <section id="insights-section" className="scroll-mt-24 border-y border-[#e1d8c6] dark:border-[#3b332b] bg-[#f6f1e7] dark:bg-[#191613] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            <div className="order-2 lg:order-1 lg:col-span-6">
              <Reveal>
                <SectionHeading title="A growing collection of student perspectives." />
              </Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: 'Published pieces', value: publishedArticles.length.toLocaleString(), icon: BookOpen },
                  { label: 'Countries', value: countriesRepresented.toLocaleString(), icon: Globe2 },
                  { label: 'Words shared', value: totalWords.toLocaleString(), icon: PenLine },
                ].map(({ label, value, icon: Icon }, index) => (
                  <Reveal key={label} delay={index * 0.08} className="h-full">
                  <article className="h-full rounded-2xl border border-[#e1d8c6] dark:border-[#3b332b] bg-[#faf7f2] dark:bg-[#211d18] p-4 sm:p-5 shadow-sm">
                    <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[#fceee9] dark:bg-[#49291e] text-[#c1502e] dark:text-[#f1a184]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <p className="font-platform-sans text-[10px] font-bold uppercase tracking-wider text-[#7c7061] dark:text-[#c7bbaa]">{label}</p>
                    <p className="font-platform-serif mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-[#2b241c] dark:text-[#f4ede2]">{value}</p>
                  </article>
                  </Reveal>
                ))}
              </div>
            </div>
            <Reveal className="order-1 lg:order-2 lg:col-span-6">
              <GlobalPerspectiveGlobe articles={articles} />
            </Reveal>
          </div>
        </div>
      </section>

      {librarySection}

      <section id="topics-section" className="scroll-mt-24 relative isolate overflow-hidden border-b border-[#e1d8c6] dark:border-[#3b332b] bg-[#faf7f2] dark:bg-[#141210] py-20 sm:py-28">
        <svg className="pointer-events-none absolute -right-32 top-12 -z-10 h-[28rem] w-[28rem] text-[#c1502e]/[0.07] dark:text-[#e57554]/[0.08]" viewBox="0 0 400 400" fill="none" aria-hidden="true">
          <circle cx="200" cy="200" r="118" stroke="currentColor" strokeWidth="1" />
          <circle cx="200" cy="200" r="158" stroke="currentColor" strokeWidth="1" strokeDasharray="2 8" />
          <path d="M66 248c54-100 117-149 188-147 47 1 77 30 82 66 8 52-41 90-91 74-43-14-55-56-32-82 20-23 56-23 76-5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="304" cy="105" r="5" fill="currentColor" />
        </svg>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <Reveal className="mb-12 grid gap-8 lg:mb-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="font-platform-sans mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#a03818] dark:text-[#f1a184]">The question is yours</p>
              <h2 className="font-platform-serif max-w-3xl text-5xl font-medium leading-[1.03] tracking-tight text-[#2b241c] dark:text-[#f4ede2] sm:text-6xl lg:text-7xl">
                What Can <span className="italic text-[#a03818] dark:text-[#f1a184]">You</span> Share?
              </h2>
            </div>
            <div className="border-l border-[#d8cbbb] pl-5 dark:border-[#494035] lg:col-span-5 lg:mb-1 lg:ml-auto lg:max-w-md">
              <p className="font-platform-sans text-base leading-relaxed text-[#6f6356] dark:text-[#c7bbaa] sm:text-lg">
                Your perspective doesn’t need a category to matter. Start with what you’ve seen, questioned, learned, or lived—and follow the thought wherever it goes.
              </p>
              <p className="font-platform-serif mt-4 text-sm italic text-[#a03818] dark:text-[#f1a184]">Eight starting points. No wrong door.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {WRITING_PROMPTS.map((prompt, index) => (
              <Reveal key={prompt.id} delay={(index % 4) * 0.07} className="h-full">
              <button
                type="button"
                onClick={() => onStartGuidedWriting(prompt.id)}
                className={`group relative flex h-full min-h-[19rem] flex-col overflow-hidden rounded-3xl border border-[#e1d8c6] p-5 text-left shadow-[0_3px_12px_-10px_rgba(43,36,28,0.5)] transition-all duration-200 hover:-translate-y-1 hover:border-[#c1502e] hover:shadow-[0_16px_30px_-20px_rgba(43,36,28,0.4)] dark:border-[#3b332b] dark:hover:border-[#e57554] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c1502e] sm:p-6 ${
                  index % 4 === 1
                    ? 'bg-[#f1f3eb] dark:bg-[#202319]'
                    : index % 4 === 3
                      ? 'bg-[#f5eee4] dark:bg-[#211d18]'
                      : 'bg-white dark:bg-[#1c1814]'
                }`}
              >
                <span className="font-platform-serif block text-[1.35rem] font-semibold leading-snug text-[#2b241c] dark:text-[#f4ede2]">
                  {prompt.title}
                </span>
                <span className="font-platform-sans mt-3 block text-sm leading-relaxed text-[#716659] dark:text-[#c7bbaa]">
                  {prompt.description}
                </span>
                <span className="font-platform-serif mt-auto block pt-6 text-sm italic leading-relaxed text-[#a03818] dark:text-[#f1a184]">
                  “{prompt.example}”
                </span>
                <span className="font-platform-sans mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#2b241c] dark:text-[#f4ede2]">
                  Follow this thought
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </button>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 flex flex-col gap-5 border-t border-[#d8cbbb] pt-6 dark:border-[#494035] sm:flex-row sm:items-center sm:justify-between">
            <p className="font-platform-serif max-w-2xl text-xl font-medium italic leading-relaxed text-[#2b241c] dark:text-[#f4ede2] sm:text-2xl">
              No perfect words required. No single subject to follow. Just something worth sharing.
            </p>
            <button
              type="button"
              onClick={() => onStartGuidedWriting(WRITING_PROMPTS[0].id)}
              className="font-platform-sans inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-[#c1502e]/40 px-5 py-2.5 text-sm font-bold text-[#a03818] transition-colors hover:border-[#c1502e] hover:bg-[#fceee9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c1502e] dark:border-[#e57554]/40 dark:text-[#f1a184] dark:hover:border-[#e57554] dark:hover:bg-[#49291e] sm:self-auto"
            >
              Start with a blank page
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </Reveal>
        </div>
      </section>

      <section id="how-to-share" className="scroll-mt-24 relative isolate overflow-hidden border-b border-[#e1d8c6] bg-[linear-gradient(125deg,#241a17_0%,#3b251f_48%,#54402f_100%)] py-20 dark:border-[#3b332b] sm:py-28">
        <svg className="pointer-events-none absolute -right-20 -top-32 -z-10 h-[38rem] w-[38rem] text-[#f6f1e7]/[0.09]" viewBox="0 0 500 500" fill="none" aria-hidden="true">
          <circle cx="250" cy="250" r="130" stroke="currentColor" />
          <circle cx="250" cy="250" r="180" stroke="currentColor" strokeDasharray="3 9" />
          <circle cx="250" cy="250" r="225" stroke="currentColor" />
          <path d="M73 331c66-112 143-167 232-163 59 3 98 39 96 85-2 57-58 91-107 65-42-23-44-71-15-94 24-19 60-13 75 10" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="400" cy="166" r="5" fill="currentColor" />
        </svg>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
          <Reveal className="mb-12 grid gap-8 lg:mb-16 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="font-platform-sans mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#f1a184]">A small beginning is still a beginning</p>
              <h2 className="font-platform-serif max-w-4xl text-4xl font-medium leading-[1.05] tracking-tight text-[#faf7f2] sm:text-5xl lg:text-6xl">
                Your experience. Your words. <span className="italic text-[#f1a184]">Your perspective.</span>
              </h2>
            </div>
            <p className="font-platform-sans text-base leading-relaxed text-[#e1d8c6]/80 dark:text-[#e1d8c6]/80 lg:col-span-4 lg:pb-1">
              No polished thesis required. Start with one honest thought; you can shape it, save it, and send it when it feels ready.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 divide-y divide-[#f6f1e7]/20 border-y border-[#f6f1e7]/20 md:grid-cols-3 md:divide-x md:divide-y-0">
            {[
              {
                number: '01',
                title: 'Choose a subject and format',
                description: 'Select a publication type and a category that fits the ideas you want to explore.',
              },
              {
                number: '02',
                title: 'Write and save your work',
                description: 'Build your piece in the editor. You can save a draft and come back to it later.',
              },
              {
                number: '03',
                title: 'Submit for review',
                description: 'Confirm the authorship, citation, and community guidelines in the honor pledge, then submit for moderation.',
              },
            ].map((step, index) => (
              <Reveal key={step.number} delay={index * 0.1}>
              <article key={step.number} className={`relative flex min-h-64 flex-col px-5 py-7 sm:px-8 sm:py-9 md:px-7 lg:px-10 ${index > 0 ? 'md:pl-9' : 'md:pl-0'}`}>
                <span className="font-platform-serif text-6xl font-medium leading-none text-[#f1a184] sm:text-7xl">{step.number}</span>
                <h3 className="font-platform-serif mt-7 text-xl font-semibold text-[#faf7f2] sm:text-2xl">{step.title}</h3>
                <p className="font-platform-sans mt-3 max-w-sm text-sm leading-relaxed text-[#e1d8c6]/75">{step.description}</p>
                <span className="font-platform-sans mt-auto pt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f1a184]">
                  {index === 0 ? 'Begin anywhere' : index === 1 ? 'Keep what you write' : 'Reviewed before publication'}
                </span>
              </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="values-section" className="scroll-mt-24 border-b border-[#e1d8c6] dark:border-[#3b332b] bg-[#faf7f2] dark:bg-[#141210] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <Reveal className="lg:col-span-4">
              <h2 className="font-platform-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#2b241c] dark:text-[#f4ede2]">
                A community built on respect.
              </h2>
              <p className="font-platform-sans mt-4 text-base leading-relaxed text-[#7c7061] dark:text-[#c7bbaa]">
                The platform’s honor code and publication terms set expectations for student scholarship, thoughtful exchange, and author ownership.
              </p>
              <div className="mt-6 rounded-2xl border border-[#e1d8c6] dark:border-[#3b332b] bg-[#f6f1e7] dark:bg-[#211d18] p-5">
                <span className="font-platform-sans block text-xs font-bold uppercase tracking-wider text-[#2b241c] dark:text-[#f4ede2]">Guiding principle</span>
                <p className="font-platform-serif mt-2 text-sm italic leading-relaxed text-[#7c7061] dark:text-[#c7bbaa]">
                  Student scholarship should be original, attributed, and shared with care.
                </p>
              </div>
            </Reveal>
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {values.map(({ icon: Icon, title, description }, index) => (
                <Reveal key={title} delay={index * 0.07}>
                <article key={title} className="rounded-2xl border border-[#e1d8c6] dark:border-[#3b332b] bg-white dark:bg-[#1c1814] p-5 sm:p-6">
                  <span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${
                    index % 2 === 0
                      ? 'bg-[#fceee9] text-[#c1502e] dark:bg-[#49291e] dark:text-[#f1a184]'
                      : 'bg-[#edf2e8] text-[#576449] dark:bg-[#293321] dark:text-[#b6c8a4]'
                  }`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-platform-serif text-lg font-bold text-[#2b241c] dark:text-[#f4ede2]">{title}</h3>
                  <p className="font-platform-sans mt-2 text-sm leading-relaxed text-[#7c7061] dark:text-[#c7bbaa]">{description}</p>
                </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {teamSection}

      <section id="faq-section" className="scroll-mt-24 bg-[#f6f1e7] dark:bg-[#191613] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <Reveal className="mb-10 text-center">
            <h2 className="font-platform-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#2b241c] dark:text-[#f4ede2]">
              Frequently asked questions
            </h2>
            <p className="font-platform-sans mt-4 text-base text-[#7c7061] dark:text-[#c7bbaa]">
              A few practical details about writing and sharing work on impactED.
            </p>
          </Reveal>
          <div className="space-y-3">
            {faqs.map(({ question, answer }, index) => (
              <Reveal key={question} delay={index * 0.05}>
              <details className="group rounded-2xl border border-[#e1d8c6] dark:border-[#3b332b] bg-[#faf7f2] dark:bg-[#211d18] p-5 sm:p-6 open:shadow-sm">
                <summary className="font-platform-serif flex cursor-pointer list-none items-center justify-between gap-4 text-base sm:text-lg font-bold text-[#2b241c] dark:text-[#f4ede2]">
                  {question}
                  <ArrowDown className="h-5 w-5 shrink-0 text-[#7c7061] transition-transform group-open:rotate-180 dark:text-[#c7bbaa]" aria-hidden="true" />
                </summary>
                <p className="font-platform-sans mt-4 border-t border-[#e1d8c6] dark:border-[#3b332b] pt-4 text-sm leading-relaxed text-[#7c7061] dark:text-[#c7bbaa]">
                  {answer}
                </p>
              </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contribute-section" className="scroll-mt-24 border-t border-[#e1d8c6] bg-[#faf7f2] py-16 dark:border-[#3b332b] dark:bg-[#141210] sm:py-20">
        <Reveal className="mx-auto max-w-5xl px-4 sm:px-8">
          <div className="relative isolate overflow-hidden rounded-3xl border border-[#8e533c]/35 bg-[linear-gradient(125deg,#241a17_0%,#3b251f_38%,#75432f_72%,#3a3528_100%)] px-6 py-10 text-center text-[#f6f1e7] shadow-[0_24px_70px_-30px_rgba(74,38,25,0.65)] sm:px-12 sm:py-14">
            <svg aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-25" viewBox="0 0 960 420" preserveAspectRatio="xMidYMid slice" fill="none">
              <circle cx="142" cy="240" r="52" stroke="#F6C8A8" />
              <circle cx="142" cy="240" r="39" stroke="#F6C8A8" strokeOpacity=".6" />
              <ellipse cx="142" cy="240" rx="52" ry="19" transform="rotate(-32 142 240)" stroke="#DFE9D7" />
              <path d="M-65 330C105 194 208 422 392 298S665 112 1028 210" stroke="#F6C8A8" />
              <path d="M72 38C225 132 324 -2 498 82S767 184 936 46" stroke="#DFE9D7" strokeOpacity=".65" />
              <circle cx="806" cy="112" r="3" fill="#DFE9D7" />
              <circle cx="690" cy="335" r="2.5" fill="#F6C8A8" />
            </svg>
            <div className="pointer-events-none absolute -right-28 -top-36 -z-10 h-96 w-96 rounded-full bg-[#e57554]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-48 -left-20 -z-10 h-96 w-96 rounded-full bg-[#7a8b69]/20 blur-3xl" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#f6f1e7]/90">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#b6c8a4]" aria-hidden="true" />
                Open to student submissions
              </span>
              <h2 className="font-platform-serif mt-5 text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
                Your perspective belongs in the conversation.
              </h2>
              <p className="font-platform-sans mt-4 text-base leading-relaxed text-[#f6f1e7]/75 sm:text-lg">
                Start a new piece in impactED’s writing editor. You can save a draft before submitting it for review.
              </p>
              <button
                type="button"
                onClick={() => onStartGuidedWriting(WRITING_PROMPTS[0].id)}
                className="font-platform-sans mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#c1502e] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#a03818] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <PenLine className="h-4 w-4" aria-hidden="true" />
                Start writing
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
