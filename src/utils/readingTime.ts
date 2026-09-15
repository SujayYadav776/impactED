/**
 * Utility for calculating reading time and word metrics for student publications and manuscripts.
 */

export interface ReadingTimeResult {
  /** Total number of words in content */
  wordCount: number;
  /** Estimated reading time in full minutes (rounded up to nearest minute, min 1 for non-empty text) */
  minutes: number;
  /** Exact fractional minutes */
  exactMinutes: number;
  /** Estimated total seconds */
  seconds: number;
  /** Human-readable display string, e.g. "3 min read" or "< 1 min read" */
  displayString: string;
  /** Detailed breakdown text, e.g. "350 words • ~2 min read" */
  detailedStats: string;
  /** Reading pace speed descriptor: 'Quick Read' | 'Standard Read' | 'In-depth Paper' | 'Extensive Manuscript' */
  readCategory: string;
}

/** Average adult and high-school scholastic reading speed in words per minute */
export const DEFAULT_WORDS_PER_MINUTE = 200;

/**
 * Calculates estimated reading time based on word count as the student writes.
 * Standard scholastic reading speed is ~200 WPM (words per minute).
 *
 * @param content - The raw article content (text or markdown)
 * @param wordsPerMinute - Average reading speed in words per minute (default: 200)
 * @returns ReadingTimeResult with word count, estimated minutes, seconds, and formatted labels
 */
export function calculateReadingTime(
  content: string,
  wordsPerMinute: number = DEFAULT_WORDS_PER_MINUTE
): ReadingTimeResult {
  if (!content || typeof content !== 'string') {
    return {
      wordCount: 0,
      minutes: 0,
      exactMinutes: 0,
      seconds: 0,
      displayString: '0 min read',
      detailedStats: '0 words • 0 min read',
      readCategory: 'Quick Read',
    };
  }

  // Strip markdown formatting symbols and whitespace artifacts to get pure text
  const cleanText = content
    .replace(/```[\s\S]*?```/g, ' ') // code blocks
    .replace(/`.*?`/g, ' ')           // inline code
    .replace(/!\[.*?\]\(.*?\)/g, ' ') // images
    .replace(/\[.*?\]\(.*?\)/g, ' ')  // links
    .replace(/^[#*`>\s-]+/gm, ' ')    // markdown headers, blockquotes, bullets
    .trim();

  if (!cleanText) {
    return {
      wordCount: 0,
      minutes: 0,
      exactMinutes: 0,
      seconds: 0,
      displayString: '0 min read',
      detailedStats: '0 words • 0 min read',
      readCategory: 'Quick Read',
    };
  }

  // Split on any whitespace sequence
  const words = cleanText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Reading time calculations
  const exactMinutes = wordCount / wordsPerMinute;
  const seconds = Math.round(exactMinutes * 60);
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

  // Determine reading category
  let readCategory = 'Quick Read';
  if (wordCount >= 1500) {
    readCategory = 'Extensive Manuscript';
  } else if (wordCount >= 800) {
    readCategory = 'In-depth Paper';
  } else if (wordCount >= 300) {
    readCategory = 'Standard Read';
  }

  let displayString = `${minutes} min read`;
  if (wordCount === 0) {
    displayString = '0 min read';
  } else if (seconds < 45) {
    displayString = '< 1 min read';
  }

  const detailedStats = `${wordCount.toLocaleString()} words • ~${minutes} min read`;

  return {
    wordCount,
    minutes,
    exactMinutes,
    seconds,
    displayString,
    detailedStats,
    readCategory,
  };
}

/**
 * Returns a friendly formatted string for reading time badge or label
 */
export function formatReadingTimeBadge(minutes: number): string {
  if (minutes <= 0) return '< 1 min read';
  if (minutes === 1) return '1 min read';
  return `${minutes} mins read`;
}
