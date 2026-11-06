import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileText, Send, Save } from 'lucide-react';
import { Article, CATEGORIES, UserProfile } from '../types';
import { firebaseService } from '../firebaseService';
import { calculateReadingTime, DEFAULT_WORDS_PER_MINUTE } from '../utils/readingTime';

export interface WritingPrompt {
  id: string;
  title: string;
  description: string;
  example: string;
  category: string;
}

export const WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: 'opinions',
    title: 'Opinions & Perspectives',
    description: 'Your thoughts, arguments, beliefs, and ideas about education, student life, society, or anything worth discussing.',
    example: 'Is a university degree still worth it?',
    category: 'Opinion & Editorial',
  },
  {
    id: 'college-life',
    title: 'College & Student Life',
    description: 'The everyday reality of being a student — friendships, campus culture, independence, pressure, failures, and unexpected experiences.',
    example: 'Things nobody told me about starting college.',
    category: 'Campus Life',
  },
  {
    id: 'learning',
    title: 'Learning & Education',
    description: 'How you learn, what works, what doesn’t, your classroom experiences, teachers, examinations, and different approaches to education.',
    example: 'What makes a teacher truly memorable?',
    category: 'Career & College',
  },
  {
    id: 'global-issues',
    title: 'Global Issues & Society',
    description: 'Your thoughts on issues affecting young people and communities — inequality, climate change, conflict, culture, technology, and social change.',
    example: 'How does where you’re born shape your opportunities?',
    category: 'Global Issues',
  },
  {
    id: 'future',
    title: 'Skills, Careers & Future',
    description: 'Career ambitions, personal development, entrepreneurship, skills, work experiences, and figuring out what comes next.',
    example: 'What school doesn’t teach you about working life.',
    category: 'Career & College',
  },
  {
    id: 'personal-stories',
    title: 'Personal Stories & Experiences',
    description: 'Personal moments, challenges, achievements, lessons, mistakes, and experiences that shaped the way you see the world.',
    example: 'The experience that changed how I think about education.',
    category: 'Arts & Culture',
  },
  {
    id: 'technology',
    title: 'Technology & Innovation',
    description: 'AI, digital learning, the internet, emerging technologies, new ideas, and how innovation is changing education and everyday life.',
    example: 'Is AI making students better learners or more dependent?',
    category: 'Science & Tech',
  },
  {
    id: 'creativity',
    title: 'Creativity & Culture',
    description: 'Art, books, music, language, traditions, identity, creative work, and the cultural experiences that influence how we learn and live.',
    example: 'What my culture taught me that my classroom never did.',
    category: 'Arts & Culture',
  },
];

interface GuidedWritingPageProps {
  currentUser: UserProfile;
  initialPromptId: string;
  onClose: () => void;
  onSubmitSuccess: () => void;
  onDraftSaved: () => void;
}

const EMPTY_REACTIONS = { great: 0, like: 0, heart: 0, wow: 0 };
const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80';

export default function GuidedWritingPage({
  currentUser,
  initialPromptId,
  onClose,
  onSubmitSuccess,
  onDraftSaved,
}: GuidedWritingPageProps) {
  const initialPrompt = WRITING_PROMPTS.find((prompt) => prompt.id === initialPromptId) || WRITING_PROMPTS[0];
  const [selectedPrompt, setSelectedPrompt] = useState(initialPrompt);
  const [title, setTitle] = useState(initialPrompt.example);
  const [content, setContent] = useState('');
  const [titleWasEdited, setTitleWasEdited] = useState(false);
  const [draftId] = useState(() => `draft-${crypto.randomUUID()}`);
  const [isSaving, setIsSaving] = useState(false);
  const [pledgeOriginal, setPledgeOriginal] = useState(false);
  const [pledgeCite, setPledgeCite] = useState(false);
  const [pledgeGuidelines, setPledgeGuidelines] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  const readingStats = useMemo(
    () => calculateReadingTime(content, DEFAULT_WORDS_PER_MINUTE),
    [content]
  );

  const selectPrompt = (prompt: WritingPrompt) => {
    setSelectedPrompt(prompt);
    if (!titleWasEdited) {
      setTitle(prompt.example);
    }
  };

  const createArticle = (status: Article['status']): Article => ({
    id: draftId,
    title: title.trim() || 'Untitled Draft',
    summary: content.trim().replace(/^[#*`>\s-]+/gm, '').slice(0, 220) || 'No summary yet.',
    content: content.trim(),
    category: CATEGORIES.includes(selectedPrompt.category) ? selectedPrompt.category : CATEGORIES[0],
    tags: [selectedPrompt.title],
    authorId: currentUser.uid,
    authorName: currentUser.displayName,
    authorSchool: currentUser.school || '',
    authorCountry: currentUser.country || '',
    status,
    type: 'essay',
    coverImage: DEFAULT_COVER_IMAGE,
    reactions: EMPTY_REACTIONS,
    createdAt: Date.now(),
    readingTime: readingStats.minutes,
    wordCount: readingStats.wordCount,
    commentsCount: 0,
  });

  const saveDraft = async () => {
    if (!title.trim() && !content.trim()) {
      setFeedback({ message: 'Add a title or start writing before saving your draft.', isError: true });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      await firebaseService.saveArticle(createArticle('Draft'));
      onDraftSaved();
      setFeedback({ message: 'Draft saved to your portfolio.', isError: false });
    } catch (error) {
      console.error('Failed to save guided writing draft:', error);
      setFeedback({ message: 'Could not save your draft. Please check your connection and try again.', isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  const submitForReview = async () => {
    if (!title.trim() || !content.trim()) {
      setFeedback({ message: 'Add a title and write something before submitting for review.', isError: true });
      return;
    }

    if (!pledgeOriginal || !pledgeCite || !pledgeGuidelines) {
      setFeedback({ message: 'Please confirm all three community and authorship guidelines before submitting.', isError: true });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      await firebaseService.saveArticle(createArticle('Submitted'));
      onSubmitSuccess();
    } catch (error) {
      console.error('Failed to submit guided writing for review:', error);
      setFeedback({ message: 'Could not submit your work. Please check your connection and try again.', isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#f6f1e7] dark:bg-[#141210] px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={onClose}
          className="font-platform-sans mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#7c7061] transition-colors hover:text-[#c1502e] dark:text-[#c7bbaa] dark:hover:text-[#f1a184]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to ImpactED
        </button>

        <div className="mb-6">
          <p className="font-platform-sans text-xs font-bold uppercase tracking-[0.16em] text-[#c1502e] dark:text-[#f1a184]">
            Guided writing
          </p>
          <h1 className="font-platform-serif mt-2 text-3xl font-medium tracking-tight text-[#2b241c] dark:text-[#f4ede2] sm:text-4xl">
            Find a question. Tell your story.
          </h1>
          <p className="font-platform-sans mt-3 max-w-3xl text-sm leading-relaxed text-[#7c7061] dark:text-[#c7bbaa]">
            Choose a prompt on the left for inspiration, then write in your own words. Your draft stays private until you submit it for review.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-5">
            <div className="rounded-3xl border border-[#e1d8c6] bg-[#faf7f2] p-4 shadow-sm dark:border-[#3b332b] dark:bg-[#1c1814] sm:p-5">
              <h2 className="font-platform-serif mb-1 text-xl font-bold text-[#2b241c] dark:text-[#f4ede2]">
                Questions to explore
              </h2>
              <p className="font-platform-sans mb-4 text-xs leading-relaxed text-[#7c7061] dark:text-[#c7bbaa]">
                Pick one to use as your starting point. You can change your direction at any time.
              </p>
              <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1 lg:max-h-[calc(100vh-330px)]">
                {WRITING_PROMPTS.map((prompt, index) => {
                  const isSelected = prompt.id === selectedPrompt.id;
                  return (
                    <button
                      type="button"
                      key={prompt.id}
                      aria-pressed={isSelected}
                      onClick={() => selectPrompt(prompt)}
                      className={`w-full rounded-2xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c1502e] ${
                        isSelected
                          ? 'border-[#c1502e] bg-[#fceee9] dark:border-[#e57554] dark:bg-[#49291e]/60'
                          : 'border-[#e1d8c6] bg-white hover:border-[#c9bfab] dark:border-[#3b332b] dark:bg-[#211d18] dark:hover:border-[#695745]'
                      }`}
                    >
                      <span className="font-platform-sans flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider text-[#7c7061] dark:text-[#c7bbaa]">
                        <span>{String(index + 1).padStart(2, '0')} · {prompt.title}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-[#c1502e] dark:text-[#f1a184]" aria-hidden="true" />}
                      </span>
                      <span className="font-platform-sans mt-2 block text-sm leading-relaxed text-[#2b241c] dark:text-[#f4ede2]">
                        {prompt.example}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-[#e1d8c6] bg-[#faf7f2] p-5 shadow-sm dark:border-[#3b332b] dark:bg-[#1c1814] sm:p-7">
              <div className="mb-5 flex items-start gap-3 border-b border-[#e1d8c6] pb-5 dark:border-[#3b332b]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fceee9] text-[#c1502e] dark:bg-[#49291e] dark:text-[#f1a184]">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-platform-sans text-xs font-bold uppercase tracking-wider text-[#c1502e] dark:text-[#f1a184]">
                    {selectedPrompt.title}
                  </p>
                  <p className="font-platform-sans mt-1 text-xs leading-relaxed text-[#7c7061] dark:text-[#c7bbaa]">
                    {selectedPrompt.description}
                  </p>
                </div>
              </div>

              <label htmlFor="guided-writing-title" className="font-platform-sans mb-2 block text-xs font-bold uppercase tracking-wider text-[#7c7061] dark:text-[#c7bbaa]">
                Title
              </label>
              <input
                id="guided-writing-title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setTitleWasEdited(true);
                }}
                maxLength={180}
                placeholder="Give your piece a title"
                className="font-platform-serif mb-5 w-full rounded-xl border border-[#e1d8c6] bg-white px-4 py-3 text-lg font-semibold text-[#2b241c] outline-none transition focus:border-[#c1502e] focus:ring-2 focus:ring-[#c1502e]/15 dark:border-[#3b332b] dark:bg-[#211d18] dark:text-[#f4ede2] dark:focus:border-[#e57554]"
              />

              <label htmlFor="guided-writing-content" className="font-platform-sans mb-2 block text-xs font-bold uppercase tracking-wider text-[#7c7061] dark:text-[#c7bbaa]">
                Your writing
              </label>
              <textarea
                id="guided-writing-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Start wherever you are. There are no perfect words required — just something worth sharing."
                className="font-platform-sans min-h-[360px] w-full resize-y rounded-xl border border-[#e1d8c6] bg-white px-4 py-4 text-base leading-relaxed text-[#2b241c] outline-none transition placeholder:text-[#a99e89] focus:border-[#c1502e] focus:ring-2 focus:ring-[#c1502e]/15 dark:border-[#3b332b] dark:bg-[#211d18] dark:text-[#f4ede2] dark:placeholder:text-[#807565] dark:focus:border-[#e57554] sm:min-h-[470px]"
              />

              <div className="font-platform-sans mt-2 flex justify-between text-xs text-[#7c7061] dark:text-[#c7bbaa]">
                <span>{readingStats.wordCount.toLocaleString()} words</span>
                <span>{readingStats.displayString}</span>
              </div>

              <div className="mt-6 rounded-2xl border border-[#e1d8c6] bg-[#f6f1e7] p-4 dark:border-[#3b332b] dark:bg-[#211d18]">
                <p className="font-platform-sans mb-3 text-xs font-bold uppercase tracking-wider text-[#2b241c] dark:text-[#f4ede2]">
                  Before you submit
                </p>
                <div className="space-y-2.5">
                  {[
                    { checked: pledgeOriginal, setChecked: setPledgeOriginal, label: 'This is my original work and reflects my own thinking.' },
                    { checked: pledgeCite, setChecked: setPledgeCite, label: 'I have attributed quotations, statistics, and other sources.' },
                    { checked: pledgeGuidelines, setChecked: setPledgeGuidelines, label: 'I will follow the community, academic, and safety guidelines.' },
                  ].map(({ checked, setChecked, label }) => (
                    <label key={label} className="font-platform-sans flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-[#7c7061] dark:text-[#c7bbaa]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-[#c9bfab] accent-[#c1502e] focus:ring-[#c1502e]"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {feedback && (
                <p
                  role="status"
                  className={`font-platform-sans mt-4 rounded-xl px-4 py-3 text-sm ${
                    feedback.isError
                      ? 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200'
                      : 'bg-[#edf2e8] text-[#576449] dark:bg-[#293321] dark:text-[#dfe9d7]'
                  }`}
                >
                  {feedback.message}
                </p>
              )}

              <div className="mt-5 flex flex-col-reverse gap-3 border-t border-[#e1d8c6] pt-5 dark:border-[#3b332b] sm:flex-row sm:items-center sm:justify-between">
                <p className="font-platform-sans text-xs text-[#7c7061] dark:text-[#c7bbaa]">
                  Submissions go to moderators for review before publication.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={saveDraft}
                    disabled={isSaving}
                    className="font-platform-sans inline-flex items-center justify-center gap-2 rounded-xl border border-[#e1d8c6] bg-white px-4 py-2.5 text-sm font-bold text-[#2b241c] transition-colors hover:bg-[#f6f1e7] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#3b332b] dark:bg-[#211d18] dark:text-[#f4ede2] dark:hover:bg-[#30281f]"
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    {isSaving ? 'Saving…' : 'Save draft'}
                  </button>
                  <button
                    type="button"
                    onClick={submitForReview}
                    disabled={isSaving}
                    className="font-platform-sans inline-flex items-center justify-center gap-2 rounded-xl bg-[#c1502e] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#a03818] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    {isSaving ? 'Submitting…' : 'Submit for review'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <p className="font-platform-serif mt-8 text-center text-base italic text-[#7c7061] dark:text-[#c7bbaa] sm:text-lg">
          No perfect words required. No single subject to follow. Just something worth sharing.
        </p>
      </div>
    </div>
  );
}
