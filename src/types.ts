export type ReactionType = 'great' | 'like' | 'heart' | 'wow';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  school: string;
  country: string;
  bio: string;
  role: 'student' | 'admin';
  createdAt: number;
  badges: string[];
  bookmarks?: string[];
}

export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorSchool: string;
  authorCountry: string;
  status: 'Draft' | 'Submitted' | 'In Review' | 'Published' | 'Revision Requested' | 'Rejected' | 'Deleted';
  type: 'essay' | 'blog' | 'article';
  coverImage: string;
  reactions: {
    great: number;
    like: number;
    heart: number;
    wow: number;
  };
  userReactions?: { [userId: string]: ReactionType };
  createdAt: number;
  readingTime: number;
  wordCount: number;
  viewsCount?: number;
  rejectionReason?: string;
  commentsCount: number;
  challengeId?: string;
  challengeTitle?: string;
}

export interface SiteStats {
  totalVisits: number;
  totalActiveReaders: number;
  weeklyReadingHours: number;
  lastUpdated: number;
}

export interface Challenge {
  id: string;
  title: string;
  prompt: string;
  category: string;
  deadline: number;
  wordCountTarget: string;
  icon: string;
  isActive: boolean;
  prizeBadges: string[];
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'challenge-12',
    title: 'Climate Resilience in Rural Infrastructure',
    prompt: 'How can small agricultural communities leverage micro-grids, passive water filtration, or low-carbon building materials to withstand rising seasonal variations? Propose a scientifically rigorous yet locally affordable structural design.',
    category: 'STEM & Applied Science',
    deadline: Date.now() + 6 * 24 * 60 * 60 * 1000, // 6 days from now
    wordCountTarget: '800 - 1500 words',
    icon: '🌱',
    isActive: true,
    prizeBadges: ['💡 Eco-Architect', '🔬 Applied Physics']
  },
  {
    id: 'challenge-11',
    title: 'Monologues of a Lost City',
    prompt: 'Write a narrative poem or literary essay exploring how an ancient civilization speaks to us today through its silent physical ruins. Focus on sensory details: dust, sound, color, and texture.',
    category: 'Poetry & Literature',
    deadline: Date.now() - 2 * 24 * 60 * 60 * 1000, // Ended 2 days ago
    wordCountTarget: '500 - 1000 words',
    icon: '📜',
    isActive: false,
    prizeBadges: ['✒️ Poetic Laurel', '🏺 History Buff']
  },
  {
    id: 'challenge-10',
    title: 'Ethics of Neuromorphic AI Systems',
    prompt: 'With neural-network chips starting to mimic human synaptic layout physically, what are the primary moral guidelines we must establish? Discuss resource access, privacy, and identity.',
    category: 'Society & Ethics',
    deadline: Date.now() - 9 * 24 * 60 * 60 * 1000, // Ended 9 days ago
    wordCountTarget: '1000 - 2000 words',
    icon: '🧠',
    isActive: false,
    prizeBadges: ['⚖️ Synaptic Ethics', '💻 Chip Architect']
  }
];

export interface Comment {
  id: string;
  articleId: string;
  authorId: string;
  authorName: string;
  authorSchool: string;
  authorCountry: string;
  content: string;
  createdAt: number;
  reportsCount: number;
  isHidden: boolean;
  likesCount?: number;
  likedBy?: string[];
}

export const CATEGORIES = [
  'Science & Tech',
  'Arts & Culture',
  'Opinion & Editorial',
  'Poetry & Creative Writing',
  'Global Issues',
  'Career & College',
  'Campus Life'
];

export const COUNTRIES = [
  // North America
  { name: 'United States', code: 'US', articles: 15 },
  { name: 'Canada', code: 'CA', articles: 6 },
  { name: 'Mexico', code: 'MX', articles: 3 },
  { name: 'Costa Rica', code: 'CR', articles: 2 },
  { name: 'Panama', code: 'PA', articles: 1 },
  { name: 'Jamaica', code: 'JM', articles: 2 },
  { name: 'Antigua and Barbuda', code: 'AG', articles: 0 },
  { name: 'Bahamas', code: 'BS', articles: 0 },
  { name: 'Barbados', code: 'BB', articles: 0 },
  { name: 'Belize', code: 'BZ', articles: 0 },
  { name: 'Cuba', code: 'CU', articles: 0 },
  { name: 'Dominica', code: 'DM', articles: 0 },
  { name: 'Dominican Republic', code: 'DO', articles: 0 },
  { name: 'El Salvador', code: 'SV', articles: 0 },
  { name: 'Grenada', code: 'GD', articles: 0 },
  { name: 'Guatemala', code: 'GT', articles: 0 },
  { name: 'Haiti', code: 'HT', articles: 0 },
  { name: 'Honduras', code: 'HN', articles: 0 },
  { name: 'Nicaragua', code: 'NI', articles: 0 },
  { name: 'Saint Kitts and Nevis', code: 'KN', articles: 0 },
  { name: 'Saint Lucia', code: 'LC', articles: 0 },
  { name: 'Saint Vincent and the Grenadines', code: 'VC', articles: 0 },
  { name: 'Trinidad and Tobago', code: 'TT', articles: 0 },

  // South America
  { name: 'Brazil', code: 'BR', articles: 5 },
  { name: 'Argentina', code: 'AR', articles: 3 },
  { name: 'Colombia', code: 'CO', articles: 2 },
  { name: 'Chile', code: 'CL', articles: 2 },
  { name: 'Peru', code: 'PE', articles: 1 },
  { name: 'Ecuador', code: 'EC', articles: 1 },
  { name: 'Venezuela', code: 'VE', articles: 1 },
  { name: 'Bolivia', code: 'BO', articles: 0 },
  { name: 'Guyana', code: 'GY', articles: 0 },
  { name: 'Paraguay', code: 'PY', articles: 0 },
  { name: 'Suriname', code: 'SR', articles: 0 },
  { name: 'Uruguay', code: 'UY', articles: 0 },

  // Europe
  { name: 'United Kingdom', code: 'GB', articles: 8 },
  { name: 'Germany', code: 'DE', articles: 4 },
  { name: 'France', code: 'FR', articles: 5 },
  { name: 'Italy', code: 'IT', articles: 4 },
  { name: 'Spain', code: 'ES', articles: 3 },
  { name: 'Netherlands', code: 'NL', articles: 3 },
  { name: 'Switzerland', code: 'CH', articles: 2 },
  { name: 'Sweden', code: 'SE', articles: 2 },
  { name: 'Norway', code: 'NO', articles: 1 },
  { name: 'Poland', code: 'PL', articles: 2 },
  { name: 'Austria', code: 'AT', articles: 1 },
  { name: 'Belgium', code: 'BE', articles: 2 },
  { name: 'Ireland', code: 'IE', articles: 3 },
  { name: 'Portugal', code: 'PT', articles: 2 },
  { name: 'Greece', code: 'GR', articles: 1 },
  { name: 'Denmark', code: 'DK', articles: 2 },
  { name: 'Finland', code: 'FI', articles: 1 },
  { name: 'Albania', code: 'AL', articles: 0 },
  { name: 'Andorra', code: 'AD', articles: 0 },
  { name: 'Belarus', code: 'BY', articles: 0 },
  { name: 'Bosnia and Herzegovina', code: 'BA', articles: 0 },
  { name: 'Bulgaria', code: 'BG', articles: 0 },
  { name: 'Croatia', code: 'HR', articles: 0 },
  { name: 'Cyprus', code: 'CY', articles: 0 },
  { name: 'Czechia', code: 'CZ', articles: 0 },
  { name: 'Estonia', code: 'EE', articles: 0 },
  { name: 'Hungary', code: 'HU', articles: 0 },
  { name: 'Iceland', code: 'IS', articles: 0 },
  { name: 'Latvia', code: 'LV', articles: 0 },
  { name: 'Liechtenstein', code: 'LI', articles: 0 },
  { name: 'Lithuania', code: 'LT', articles: 0 },
  { name: 'Luxembourg', code: 'LU', articles: 0 },
  { name: 'Malta', code: 'MT', articles: 0 },
  { name: 'Moldova', code: 'MD', articles: 0 },
  { name: 'Monaco', code: 'MC', articles: 0 },
  { name: 'Montenegro', code: 'ME', articles: 0 },
  { name: 'North Macedonia', code: 'MK', articles: 0 },
  { name: 'Romania', code: 'RO', articles: 0 },
  { name: 'Russia', code: 'RU', articles: 0 },
  { name: 'San Marino', code: 'SM', articles: 0 },
  { name: 'Serbia', code: 'RS', articles: 0 },
  { name: 'Slovakia', code: 'SK', articles: 0 },
  { name: 'Slovenia', code: 'SI', articles: 0 },
  { name: 'Ukraine', code: 'UA', articles: 0 },
  { name: 'Holy See', code: 'VA', articles: 0 },

  // Asia
  { name: 'India', code: 'IN', articles: 12 },
  { name: 'Singapore', code: 'SG', articles: 4 },
  { name: 'Japan', code: 'JP', articles: 3 },
  { name: 'China', code: 'CN', articles: 7 },
  { name: 'South Korea', code: 'KR', articles: 4 },
  { name: 'Indonesia', code: 'ID', articles: 3 },
  { name: 'Malaysia', code: 'MY', articles: 3 },
  { name: 'Philippines', code: 'PH', articles: 4 },
  { name: 'Thailand', code: 'TH', articles: 2 },
  { name: 'Vietnam', code: 'VN', articles: 2 },
  { name: 'Turkey', code: 'TR', articles: 3 },
  { name: 'Saudi Arabia', code: 'SA', articles: 2 },
  { name: 'United Arab Emirates', code: 'AE', articles: 3 },
  { name: 'Israel', code: 'IL', articles: 2 },
  { name: 'Pakistan', code: 'PK', articles: 5 },
  { name: 'Bangladesh', code: 'BD', articles: 3 },
  { name: 'Nepal', code: 'NP', articles: 2 },
  { name: 'Afghanistan', code: 'AF', articles: 0 },
  { name: 'Armenia', code: 'AM', articles: 0 },
  { name: 'Azerbaijan', code: 'AZ', articles: 0 },
  { name: 'Bahrain', code: 'BH', articles: 0 },
  { name: 'Bhutan', code: 'BT', articles: 0 },
  { name: 'Brunei', code: 'BN', articles: 0 },
  { name: 'Cambodia', code: 'KH', articles: 0 },
  { name: 'Georgia', code: 'GE', articles: 0 },
  { name: 'Iran', code: 'IR', articles: 0 },
  { name: 'Iraq', code: 'IQ', articles: 0 },
  { name: 'Jordan', code: 'JO', articles: 0 },
  { name: 'Kazakhstan', code: 'KZ', articles: 0 },
  { name: 'Kuwait', code: 'KW', articles: 0 },
  { name: 'Kyrgyzstan', code: 'KG', articles: 0 },
  { name: 'Laos', code: 'LA', articles: 0 },
  { name: 'Lebanon', code: 'LB', articles: 0 },
  { name: 'Maldives', code: 'MV', articles: 0 },
  { name: 'Mongolia', code: 'MN', articles: 0 },
  { name: 'Myanmar', code: 'MM', articles: 0 },
  { name: 'North Korea', code: 'KP', articles: 0 },
  { name: 'Oman', code: 'OM', articles: 0 },
  { name: 'Palestine State', code: 'PS', articles: 0 },
  { name: 'Qatar', code: 'QA', articles: 0 },
  { name: 'Sri Lanka', code: 'LK', articles: 0 },
  { name: 'Syria', code: 'SY', articles: 0 },
  { name: 'Tajikistan', code: 'TJ', articles: 0 },
  { name: 'Timor-Leste', code: 'TL', articles: 0 },
  { name: 'Turkmenistan', code: 'TM', articles: 0 },
  { name: 'Uzbekistan', code: 'UZ', articles: 0 },
  { name: 'Yemen', code: 'YE', articles: 0 },

  // Africa
  { name: 'South Africa', code: 'ZA', articles: 4 },
  { name: 'Nigeria', code: 'NG', articles: 6 },
  { name: 'Kenya', code: 'KE', articles: 3 },
  { name: 'Egypt', code: 'EG', articles: 4 },
  { name: 'Ghana', code: 'GH', articles: 2 },
  { name: 'Morocco', code: 'MA', articles: 2 },
  { name: 'Ethiopia', code: 'ET', articles: 1 },
  { name: 'Algeria', code: 'DZ', articles: 0 },
  { name: 'Angola', code: 'AO', articles: 0 },
  { name: 'Benin', code: 'BJ', articles: 0 },
  { name: 'Botswana', code: 'BW', articles: 0 },
  { name: 'Burkina Faso', code: 'BF', articles: 0 },
  { name: 'Burundi', code: 'BI', articles: 0 },
  { name: 'Cabo Verde', code: 'CV', articles: 0 },
  { name: 'Cameroon', code: 'CM', articles: 0 },
  { name: 'Central African Republic', code: 'CF', articles: 0 },
  { name: 'Chad', code: 'TD', articles: 0 },
  { name: 'Comoros', code: 'KM', articles: 0 },
  { name: 'Congo', code: 'CG', articles: 0 },
  { name: 'Democratic Republic of the Congo', code: 'CD', articles: 0 },
  { name: 'Djibouti', code: 'DJ', articles: 0 },
  { name: 'Equatorial Guinea', code: 'GQ', articles: 0 },
  { name: 'Eritrea', code: 'ER', articles: 0 },
  { name: 'Eswatini', code: 'SZ', articles: 0 },
  { name: 'Gabon', code: 'GA', articles: 0 },
  { name: 'Gambia', code: 'GM', articles: 0 },
  { name: 'Guinea', code: 'GN', articles: 0 },
  { name: 'Guinea-Bissau', code: 'GW', articles: 0 },
  { name: 'Ivory Coast', code: 'CI', articles: 0 },
  { name: 'Lesotho', code: 'LS', articles: 0 },
  { name: 'Liberia', code: 'LR', articles: 0 },
  { name: 'Libya', code: 'LY', articles: 0 },
  { name: 'Madagascar', code: 'MG', articles: 0 },
  { name: 'Malawi', code: 'MW', articles: 0 },
  { name: 'Mali', code: 'ML', articles: 0 },
  { name: 'Mauritania', code: 'MR', articles: 0 },
  { name: 'Mauritius', code: 'MU', articles: 0 },
  { name: 'Mozambique', code: 'MZ', articles: 0 },
  { name: 'Namibia', code: 'NA', articles: 0 },
  { name: 'Niger', code: 'NE', articles: 0 },
  { name: 'Rwanda', code: 'RW', articles: 0 },
  { name: 'Sao Tome and Principe', code: 'ST', articles: 0 },
  { name: 'Senegal', code: 'SN', articles: 0 },
  { name: 'Seychelles', code: 'SC', articles: 0 },
  { name: 'Sierra Leone', code: 'SL', articles: 0 },
  { name: 'Somalia', code: 'SO', articles: 0 },
  { name: 'South Sudan', code: 'SS', articles: 0 },
  { name: 'Sudan', code: 'SD', articles: 0 },
  { name: 'Tanzania', code: 'TZ', articles: 0 },
  { name: 'Togo', code: 'TG', articles: 0 },
  { name: 'Tunisia', code: 'TN', articles: 0 },
  { name: 'Uganda', code: 'UG', articles: 0 },
  { name: 'Zambia', code: 'ZM', articles: 0 },
  { name: 'Zimbabwe', code: 'ZW', articles: 0 },

  // Oceania
  { name: 'Australia', code: 'AU', articles: 5 },
  { name: 'New Zealand', code: 'NZ', articles: 3 },
  { name: 'Fiji', code: 'FJ', articles: 1 },
  { name: 'Kiribati', code: 'KI', articles: 0 },
  { name: 'Marshall Islands', code: 'MH', articles: 0 },
  { name: 'Micronesia', code: 'FM', articles: 0 },
  { name: 'Nauru', code: 'NR', articles: 0 },
  { name: 'Palau', code: 'PW', articles: 0 },
  { name: 'Papua New Guinea', code: 'PG', articles: 0 },
  { name: 'Samoa', code: 'WS', articles: 0 },
  { name: 'Solomon Islands', code: 'SB', articles: 0 },
  { name: 'Tonga', code: 'TO', articles: 0 },
  { name: 'Tuvalu', code: 'TV', articles: 0 },
  { name: 'Vanuatu', code: 'VU', articles: 0 }
];

export interface Continent {
  name: string;
  code: string;
  emoji: string;
  countries: string[];
}

export const CONTINENTS: Continent[] = [
  { 
    name: 'North America', 
    code: 'NA', 
    emoji: '🌎', 
    countries: [
      'United States', 'Canada', 'Mexico', 'Costa Rica', 'Panama', 'Jamaica',
      'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Cuba', 'Dominica',
      'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras',
      'Nicaragua', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
      'Trinidad and Tobago'
    ] 
  },
  { 
    name: 'Europe', 
    code: 'EU', 
    emoji: '🇪🇺', 
    countries: [
      'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Switzerland',
      'Sweden', 'Norway', 'Poland', 'Austria', 'Belgium', 'Ireland', 'Portugal', 'Greece',
      'Denmark', 'Finland', 'Albania', 'Andorra', 'Belarus', 'Bosnia and Herzegovina',
      'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Estonia', 'Hungary', 'Iceland', 'Latvia',
      'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro',
      'North Macedonia', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia',
      'Ukraine', 'Holy See'
    ] 
  },
  { 
    name: 'Asia', 
    code: 'AS', 
    emoji: '🌏', 
    countries: [
      'India', 'Singapore', 'Japan', 'China', 'South Korea', 'Indonesia', 'Malaysia',
      'Philippines', 'Thailand', 'Vietnam', 'Turkey', 'Saudi Arabia', 'United Arab Emirates',
      'Israel', 'Pakistan', 'Bangladesh', 'Nepal', 'Afghanistan', 'Armenia', 'Azerbaijan',
      'Bahrain', 'Bhutan', 'Brunei', 'Cambodia', 'Georgia', 'Iran', 'Iraq', 'Jordan',
      'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Maldives', 'Mongolia',
      'Myanmar', 'North Korea', 'Oman', 'Palestine State', 'Qatar', 'Sri Lanka', 'Syria',
      'Tajikistan', 'Timor-Leste', 'Turkmenistan', 'Uzbekistan', 'Yemen'
    ] 
  },
  { 
    name: 'Africa', 
    code: 'AF', 
    emoji: '🌍', 
    countries: [
      'South Africa', 'Nigeria', 'Kenya', 'Egypt', 'Ghana', 'Morocco', 'Ethiopia',
      'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde',
      'Cameroon', 'Central African Republic', 'Chad', 'Comoros', 'Congo',
      'Democratic Republic of the Congo', 'Djibouti', 'Equatorial Guinea', 'Eritrea',
      'Eswatini', 'Gabon', 'Gambia', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Lesotho',
      'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius',
      'Mozambique', 'Namibia', 'Niger', 'Rwanda', 'Sao Tome and Principe', 'Senegal',
      'Seychelles', 'Sierra Leone', 'Somalia', 'South Sudan', 'Sudan', 'Tanzania', 'Togo',
      'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
    ] 
  },
  { 
    name: 'Oceania', 
    code: 'OC', 
    emoji: '🐨', 
    countries: [
      'Australia', 'New Zealand', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia',
      'Nauru', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu',
      'Vanuatu'
    ] 
  },
  { 
    name: 'South America', 
    code: 'SA', 
    emoji: '🌱', 
    countries: [
      'Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru', 'Ecuador', 'Venezuela',
      'Bolivia', 'Guyana', 'Paraguay', 'Suriname', 'Uruguay'
    ] 
  }
];

export const getStudentStats = (userId: string, userRole: 'student' | 'admin', articlesList: Article[]) => {
  if (!userId) {
    return {
      publishedCount: 0,
      stampsCount: 0
    };
  }

  if (userRole === 'admin' || userId.startsWith('admin') || userId === 'admin-temp-1') {
    return {
      publishedCount: 0,
      stampsCount: 0
    };
  }

  // Count published articles by this user
  const userPublishedArticles = articlesList.filter(
    art => art.authorId === userId && art.status === 'Published'
  );
  const publishedCount = userPublishedArticles.length;

  // Sum of reactions on ALL of their articles
  const userArticles = articlesList.filter(art => art.authorId === userId);
  let stampsCount = 0;
  userArticles.forEach(art => {
    if (art.reactions) {
      stampsCount += (art.reactions.great || 0) + 
                    (art.reactions.like || 0) + 
                    (art.reactions.heart || 0) + 
                    (art.reactions.wow || 0);
    }
  });

  return {
    publishedCount,
    stampsCount
  };
};

export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateStreak = (dates: string[]): { currentStreak: number; longestStreak: number; activeToday: boolean } => {
  if (!dates || dates.length === 0) return { currentStreak: 0, longestStreak: 0, activeToday: false };
  
  const dateSet = new Set(dates);
  const todayStr = getLocalDateString(new Date());
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);
  
  const activeToday = dateSet.has(todayStr);
  const activeYesterday = dateSet.has(yesterdayStr);
  
  let currentStreak = 0;
  if (activeToday || activeYesterday) {
    const cursor = new Date();
    if (!activeToday) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (dateSet.has(getLocalDateString(cursor))) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
      if (currentStreak >= 365) break;
    }
  }

  // Calculate longest streak historically
  const sortedDates = Array.from(dateSet).sort();
  let longestStreak = 0;
  let running = 0;
  let prevDate: Date | null = null;

  for (const str of sortedDates) {
    const parts = str.split('-').map(Number);
    if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) continue;
    const curDate = new Date(parts[0], parts[1] - 1, parts[2]);
    if (!prevDate) {
      running = 1;
    } else {
      const diffMs = curDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        running++;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    prevDate = curDate;
    if (running > longestStreak) longestStreak = running;
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return { currentStreak, longestStreak, activeToday };
};

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  action: 'delete' | 'approve' | 'reject' | 'delete_comment' | 'hide_comment' | 'approve_comment' | string;
  targetId: string;
  targetTitle?: string;
  targetAuthorName?: string;
  timestamp: number;
  details?: string;
}


