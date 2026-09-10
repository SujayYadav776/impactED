import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  increment
} from 'firebase/firestore';
import { db, auth, isFirebaseAvailable } from './firebase';
import { Article, Comment, UserProfile, ReactionType, AuditLog, SiteStats } from './types';

// Sample articles to seed the database
const SAMPLE_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'The Ethics of Quantum Computing: Preparing for the Next Tech Frontier',
    summary: 'An analysis of how quantum technology will reshape cryptography and computational ethics, written from a high-school student perspective.',
    content: `
### The Next Technological Frontier

We stand on the precipice of a computational revolution. Over the past decade, classical computers have reached near-unfathomable speeds, yet they remain bound by the binary laws of transistors. Quantum computing, however, operates on the mind-bending principles of quantum mechanics—superposition and entanglement. 

While the scientific community focuses on the race to build stable qubits, a critical question remains largely unanswered: **What are the ethical implications of a quantum-enabled world?**

### The Cryptographic Collapse

The most pressing ethical concern lies in security. Modern global security—ranging from financial transactions to military communications—relies on cryptographic systems like RSA. These systems are practically unbreakable by classical machines, requiring billions of years to factor large prime numbers.

A quantum computer running Shor's algorithm, however, could theoretically bypass these locks in a matter of hours, if not minutes. If a nation-state or rogue actor develops high-qubit quantum capabilities before post-quantum cryptography is fully deployed, all encrypted global data will lie bare.

Is it ethical for tech giants to keep quantum research proprietary when the security of our collective digital lives is at stake?

### Resource Disparity and the "Quantum Divide"

Building and cooling quantum systems requires massive resources, including helium-3 and specialized refrigeration units. This restricts quantum development to a handful of elite universities and multi-billion-dollar conglomerates in wealthy nations.

This concentration of power risks creating a "Quantum Divide"—a gap wider than the digital divide of the 1990s. Countries without quantum capabilities will face massive technological and economic stagnation.

### Conclusion: A Student's Call to Action

As students, we cannot merely be passive consumers of future technologies. We must champion policies that advocate for open-source quantum security protocols and international ethics boards. Just as the nuclear age demanded global treaties, the quantum era requires cooperative guidelines before the first master key is created.
    `,
    category: 'Science & Tech',
    tags: ['Quantum', 'Ethics', 'TechPolicy'],
    authorId: 'auth-1',
    authorName: 'Sophia Chen',
    authorSchool: 'National Junior College',
    authorCountry: 'Singapore',
    status: 'Published',
    type: 'article',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    reactions: { great: 24, like: 18, heart: 12, wow: 15 },
    createdAt: Date.now() - 5 * 24 * 3600 * 1000,
    readingTime: 4,
    wordCount: 380,
    commentsCount: 3,
    viewsCount: 382
  },
  {
    id: 'art-2',
    title: 'Whispers of the Monsoon: A Tapestry of Poetry',
    summary: 'A collection of short, vivid poems detailing the emotional, physical, and historical significance of the Indian monsoon.',
    content: `
### I. The Anticipation
The sky is a bruised amethyst,
Heavy with the scent of dry clay.
In the dusty streets of Delhi,
A collective breath is held—
Waiting for the sky to shatter.
Birds quiet down, leaves tilt skyward,
A silent prayer in the afternoon heat.

### II. The Arrival
Then, the first drop falls:
A cool coin of silver on a child's forehead.
Suddenly, a drumroll on the corrugated roofs,
The dry earth drinks greedily,
Releasing the scent of *mitti mitti*—
An ancient perfume of rebirth.
Water gushes through narrow alleys,
Turning gutters into roaring mountain streams,
And children into paper-boat captains.

### III. The Quiet Reflection
Behind steamed window panes,
We sip cardamom chai,
Listening to the steady, rhythmic applause of rain.
The monsoon is not just weather;
It is a season of the soul,
Washing away the dust of a long summer,
Leaving behind a green so bright,
It hurts to look.
    `,
    category: 'Poetry & Creative Writing',
    tags: ['Poetry', 'Monsoon', 'Nature'],
    authorId: 'auth-2',
    authorName: 'Aarav Patel',
    authorSchool: 'Delhi Public School',
    authorCountry: 'India',
    status: 'Published',
    type: 'essay',
    coverImage: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
    reactions: { great: 15, like: 22, heart: 28, wow: 3 },
    createdAt: Date.now() - 3 * 24 * 3600 * 1000,
    readingTime: 2,
    wordCount: 185,
    commentsCount: 2,
    viewsCount: 245,
    challengeId: 'challenge-11',
    challengeTitle: 'Monologues of a Lost City'
  },
  {
    id: 'art-3',
    title: 'Rethinking Plastic: How Our School Cut Waste by 80%',
    summary: 'A practical, inspiring case study of a student-led campaign to eliminate single-use plastics in our school cafeteria.',
    content: `
### The Wake-Up Call

It started with a simple audit. For our environmental club project, we spent one Tuesday afternoon collecting all single-use plastic waste discarded after lunch in our school cafeteria. 

The results were horrifying: **1,240 plastic water bottles, 980 plastic forks, and over 1,500 snack wrappers—all in a single day.** 

Knowing that only a fraction of this would actually be recycled, we knew we had to act. We couldn't wait for the administration to change the policy; we had to drive it ourselves.

### Our Strategy: The "Zero-Plastic Academy" Campaign

We structured our campaign around three simple, achievable steps:

1. **The Water Refill Revolution:** We partnered with a local NGO to install three modern, sensor-activated water bottle refilling stations. We then secured funding from the alumni association to provide every incoming student with a reusable, thermal impactED flask.
2. **BYOU (Bring Your Own Utensils):** We ran a weekly awareness campaign showing the lifetime impact of single-use forks. Students who brought their own reusable bamboo or metal cutlery sets received "Green Credits" redeemable for library privileges and snack discounts.
3. **The Cafeteria Contract Re-negotiation:** Equipped with our audit data, we presented a proposal to the school principal and catering staff, asking them to replace plastic sauce sachets with large pump dispensers and plastic wrap with compostable wax wraps.

### The Impact

Six months later, we did another audit. The reduction was staggering:
* Single-use plastic bottles: **Reduced by 94%**
* Plastic cutlery: **Reduced by 85%**
* Overall cafeteria landfill waste: **Decreased by 80%**

### Key Takeaways for Student Leaders

If you want to start a similar initiative in your school, remember: **Data talks.** Administrators are busy, but they cannot ignore a clear spreadsheet. Combine raw audit numbers with positive, incentive-based solutions rather than strict punishments.
    `,
    category: 'Global Issues',
    tags: ['Sustainability', 'StudentLed', 'ZeroWaste'],
    authorId: 'auth-3',
    authorName: 'David Koomson',
    authorSchool: 'Accra Academy',
    authorCountry: 'Ghana',
    status: 'Published',
    type: 'blog',
    coverImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    reactions: { great: 32, like: 14, heart: 18, wow: 8 },
    createdAt: Date.now() - 2 * 24 * 3600 * 1000,
    readingTime: 3,
    wordCount: 330,
    commentsCount: 1,
    viewsCount: 298
  },
  {
    id: 'art-4',
    title: 'Why the Humanities Matter More Than Ever in the Age of AI',
    summary: 'A defense of literature, philosophy, and history as essential guides for shaping ethical AI developments.',
    content: `
### The STEM Monopoly

Today, students are constantly told that STEM is the only reliable path. Coding bootcamps, robotics courses, and data science degrees dominate college brochures. While technical proficiency is undoubtedly vital, we are witnessing a dangerous relegation of the humanities to the status of "expensive hobbies."

As generative artificial intelligence enters our classrooms and workplaces, I argue that history, literature, and philosophy are not obsolete—they are our most essential survival guides.

### Code Without Philosophy is Dangerous

An artificial intelligence model can analyze billions of data points to optimize traffic or summarize documents. But an AI cannot answer the core questions of human values: **Who receives priority? What is fair? How do we measure human well-being?**

When software developers write algorithms for self-driving cars, they are essentially automating the "Trolley Problem"—an ethical thought experiment discussed by philosophers for centuries. Without a foundation in ethics, code is written in a moral vacuum. 

### Literature as an Empathy Machine

Literature teaches us to see the world through eyes that are not our own. By reading novels from different eras and cultures, we develop deep, cognitive empathy.

Generative AI can mimic empathy, but it has no lived experience, no heart, and no consciousness. If we rely solely on AI-generated communications, we risk flattening our emotional bandwidth. We need humanities graduates to ensure that human-centric software retains human warmth.

### Conclusion

Let us not force a false dichotomy between STEM and the Humanities. The future belongs to the "bilingual"—those who can write Python code, but also understand Aristotle's *Ethics*. Only then can we build a technological future that we actually want to inhabit.
    `,
    category: 'Opinion & Editorial',
    tags: ['Humanities', 'Philosophy', 'AI'],
    authorId: 'auth-4',
    authorName: 'Clara Vance',
    authorSchool: 'Boston Latin School',
    authorCountry: 'United States',
    status: 'Published',
    type: 'essay',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    reactions: { great: 40, like: 25, heart: 19, wow: 11 },
    createdAt: Date.now() - 1 * 24 * 3600 * 1000,
    readingTime: 3,
    wordCount: 310,
    commentsCount: 2,
    viewsCount: 412
  },
  {
    id: 'art-5',
    title: 'Solar Clay Cookstoves: Sustainable Rural Infrastructure',
    summary: 'A structural design leveraging local volcanic clay and modular solar micro-heaters to create affordable cooking units in off-grid communities.',
    content: `
### Introduction

In rural communities across developing regions, cooking remains heavily reliant on firewood. This contributes to rapid local deforestation and hazardous indoor air quality.

To address this, our school research chapter designed the **Solar Clay Cookstove**—a low-carbon, modular unit combining local material thermal storage with low-voltage solar micro-heating resistors.

### Material Engineering

We utilized local volcanic clay (high in iron-oxide and silica) mixed with rice husk ash in a 3:1 ratio. This combination exhibits a 40% higher thermal retention capacity than standard refractory brick.

The stove body is molded using traditional hand-presses, requiring zero fossil fuel energy during construction. 

### Solar Thermal Integration

A small 12W poly-crystalline solar panel charges a recycled lithium-ion battery cell during peak daylight. This cell powers dual 5V resistive heating cartridges embedded directly within the clay chamber. 

During typical cooking cycles, the clay body acts as a thermal battery, keeping heat stable for over 3 hours after solar charging completes.

### Conclusion

Our initial prototypes in rural farming households showed a 75% reduction in firewood consumption. By leveraging locally sourced materials and simple solar micro-circuitry, we can build robust, climate-resilient rural infrastructures at scale.
    `,
    category: 'STEM & Applied Science',
    tags: ['Solar', 'RuralInfra', 'AppliedScience'],
    authorId: 'auth-5',
    authorName: 'Gabriel Mensah',
    authorSchool: 'Adisadel College',
    authorCountry: 'Ghana',
    status: 'Published',
    type: 'article',
    coverImage: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=800&q=80',
    reactions: { great: 18, like: 12, heart: 14, wow: 2 },
    createdAt: Date.now() - 12 * 3600 * 1000, // 12 hours ago
    readingTime: 3,
    wordCount: 290,
    commentsCount: 0,
    viewsCount: 188,
    challengeId: 'challenge-12',
    challengeTitle: 'Climate Resilience in Rural Infrastructure'
  }
];

const SAMPLE_COMMENTS: Comment[] = [
  {
    id: 'com-1',
    articleId: 'art-1',
    authorId: 'com-author-1',
    authorName: 'Liam Miller',
    authorSchool: 'Sydney High School',
    authorCountry: 'Australia',
    content: 'This is an excellent writeup. The "Quantum Divide" is something I had not considered. It reminds me of the inequality in vaccine distribution or access to green energy technologies.',
    createdAt: Date.now() - 4 * 24 * 3600 * 1000,
    reportsCount: 0,
    isHidden: false
  },
  {
    id: 'com-2',
    articleId: 'art-1',
    authorId: 'com-author-2',
    authorName: 'Ji-Young Kim',
    authorSchool: 'Daewon Foreign Language High School',
    authorCountry: 'South Korea',
    content: 'Very well structured! Quantum cryptography is currently being researched a lot in our school science club. It is scary but exciting.',
    createdAt: Date.now() - 3 * 24 * 3600 * 1000,
    reportsCount: 0,
    isHidden: false
  },
  {
    id: 'com-3',
    articleId: 'art-2',
    authorId: 'com-author-3',
    authorName: 'Mei-Ling Zhou',
    authorSchool: 'Raffles Institution',
    authorCountry: 'Singapore',
    content: 'The second stanza is so beautiful! "A cool coin of silver on a child\'s forehead." I can almost smell the petrichor (dry soil drinking rain). Amazing work Aarav!',
    createdAt: Date.now() - 2 * 24 * 3600 * 1000,
    reportsCount: 0,
    isHidden: false
  },
  {
    id: 'com-4',
    articleId: 'art-3',
    authorId: 'com-author-4',
    authorName: 'Chinedu Obi',
    authorSchool: 'King\'s College Lagos',
    authorCountry: 'Nigeria',
    content: 'Fantastic results. 80% decrease is huge! We are trying to do something similar here, but it is hard to convince the food vendors. I will share your audit idea with our student union.',
    createdAt: Date.now() - 1 * 24 * 3600 * 1000,
    reportsCount: 0,
    isHidden: false
  }
];

// Helper to handle localStorage fallback database
class LocalStorageDatabase {
  private getStore(key: string): any[] {
    const val = localStorage.getItem(`impactED_${key}`);
    return val ? JSON.parse(val) : [];
  }

  private setStore(key: string, data: any[]) {
    localStorage.setItem(`impactED_${key}`, JSON.stringify(data));
  }

  constructor() {
    // Seed sample data if empty
    if (this.getStore('articles').length === 0) {
      this.setStore('articles', SAMPLE_ARTICLES);
    }
    if (this.getStore('comments').length === 0) {
      this.setStore('comments', SAMPLE_COMMENTS);
    }
    if (this.getStore('profiles').length === 0 || this.getStore('profiles').length <= 2) {
      this.setStore('profiles', [
        {
          uid: 'auth-1',
          email: 'sophia@example.com',
          displayName: 'Sophia Chen',
          school: 'National Junior College',
          country: 'Singapore',
          bio: 'High school senior interested in quantum systems, cryptography, and digital ethics.',
          role: 'student',
          createdAt: Date.now(),
          badges: ['Founder', 'Featured Author']
        },
        {
          uid: 'admin-temp-1',
          email: 'admin@impacted.org',
          displayName: 'Mrs. Davis (Admin)',
          school: 'Global Moderator',
          country: 'United Kingdom',
          bio: 'Platform moderator and English Lit Educator.',
          role: 'admin',
          createdAt: Date.now(),
          badges: ['Staff Moderator', 'Educator']
        },
        {
          uid: 'admin-temp-2',
          email: 'alistair@impacted.org',
          displayName: 'Dr. Alistair Vance',
          school: 'Harvard Graduate School of Ed.',
          country: 'United States',
          bio: 'Academic Advisory Board Chairman. Scholar of high school cognitive development & pedagogy.',
          role: 'admin',
          createdAt: Date.now() - 30 * 24 * 3600 * 1000,
          badges: ['Board Chairman', 'Pedagogy Lead']
        },
        {
          uid: 'admin-temp-3',
          email: 'sophia.m@impacted.org',
          displayName: 'Sophia Martinez',
          school: 'Santiago Literary Institute',
          country: 'Chile',
          bio: 'Creative Non-Fiction Curator. Dedicated to amplifying global South student narratives and poetic translations.',
          role: 'admin',
          createdAt: Date.now() - 45 * 24 * 3600 * 1000,
          badges: ['Literary Curator', 'Founder']
        }
      ]);
    }
  }

  async getArticles(): Promise<Article[]> {
    const arts = this.getStore('articles');
    return arts.map(a => ({ type: 'article', ...a } as Article));
  }

  async getArticle(id: string): Promise<Article | null> {
    const arts = this.getStore('articles');
    const art = arts.find(a => a.id === id);
    if (!art) return null;
    return { type: 'article', ...art } as Article;
  }

  async saveArticle(article: Article): Promise<void> {
    const arts = this.getStore('articles');
    const idx = arts.findIndex(a => a.id === article.id);
    if (idx >= 0) {
      arts[idx] = article;
    } else {
      arts.push(article);
    }
    this.setStore('articles', arts);
  }

  async deleteArticle(id: string): Promise<void> {
    let arts = this.getStore('articles');
    arts = arts.filter(a => a.id !== id);
    this.setStore('articles', arts);
  }

  async getComments(articleId: string): Promise<Comment[]> {
    const coms = this.getStore('comments');
    return coms.filter(c => c.articleId === articleId && !c.isHidden);
  }

  async saveComment(comment: Comment): Promise<void> {
    const coms = this.getStore('comments');
    coms.push(comment);
    this.setStore('comments', coms);

    // Update comment count on article
    const arts = this.getStore('articles');
    const idx = arts.findIndex(a => a.id === comment.articleId);
    if (idx >= 0) {
      arts[idx].commentsCount = (arts[idx].commentsCount || 0) + 1;
      this.setStore('articles', arts);
    }
  }

  async getProfile(uid: string): Promise<UserProfile | null> {
    const profs = this.getStore('profiles');
    return profs.find(p => p.uid === uid) || null;
  }

  async getProfiles(): Promise<UserProfile[]> {
    return this.getStore('profiles');
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    const profs = this.getStore('profiles');
    const idx = profs.findIndex(p => p.uid === profile.uid);
    if (idx >= 0) {
      profs[idx] = profile;
    } else {
      profs.push(profile);
    }
    this.setStore('profiles', profs);
  }

  async getReportedComments(): Promise<Comment[]> {
    const coms = this.getStore('comments');
    return coms.filter(c => c.reportsCount > 0);
  }

  async updateCommentStatus(commentId: string, isHidden: boolean): Promise<void> {
    const coms = this.getStore('comments');
    const idx = coms.findIndex(c => c.id === commentId);
    if (idx >= 0) {
      coms[idx].isHidden = isHidden;
      if (isHidden) {
        coms[idx].reportsCount = 0; // clear reports if hidden
      }
      this.setStore('comments', coms);
    }
  }

  async reportComment(commentId: string): Promise<void> {
    const coms = this.getStore('comments');
    const idx = coms.findIndex(c => c.id === commentId);
    if (idx >= 0) {
      coms[idx].reportsCount = (coms[idx].reportsCount || 0) + 1;
      this.setStore('comments', coms);
    }
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    const logs = this.getStore('audit_logs');
    // Sort newest first
    return logs.sort((a, b) => b.timestamp - a.timestamp);
  }

  async saveAuditLog(log: AuditLog): Promise<void> {
    const logs = this.getStore('audit_logs');
    logs.push(log);
    logs.sort((a, b) => b.timestamp - a.timestamp);
    this.setStore('audit_logs', logs);
  }

  async getSiteStats(): Promise<SiteStats> {
    const arts = this.getStore('articles');
    const totalArticleViews = arts.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
    const savedSessionVisits = Number(localStorage.getItem('impactED_session_visits') || '1');
    const totalVisits = savedSessionVisits + totalArticleViews;
    const totalActiveReaders = Math.max(1, Math.round(totalVisits * 0.12));
    const weeklyReadingHours = Math.round(arts.reduce((sum, a) => sum + (a.readingTime || 2) * (a.viewsCount || 1), 0) / 60) || 12;

    const stats: SiteStats = {
      totalVisits,
      totalActiveReaders,
      weeklyReadingHours,
      lastUpdated: Date.now()
    };
    localStorage.setItem('impactED_site_stats', JSON.stringify(stats));
    return stats;
  }

  async recordVisit(): Promise<SiteStats> {
    const currentSessionVisits = Number(localStorage.getItem('impactED_session_visits') || '0');
    const newSessionVisits = currentSessionVisits + 1;
    localStorage.setItem('impactED_session_visits', newSessionVisits.toString());
    return await this.getSiteStats();
  }

  async incrementArticleViews(articleId: string): Promise<void> {
    const arts = this.getStore('articles');
    const idx = arts.findIndex(a => a.id === articleId);
    if (idx >= 0) {
      arts[idx].viewsCount = (arts[idx].viewsCount || 0) + 1;
      this.setStore('articles', arts);
    }
    const stats = await this.getSiteStats();
    stats.totalActiveReaders = Math.max(stats.totalActiveReaders, Math.floor(stats.totalVisits * 0.12) + 10);
    stats.weeklyReadingHours += 1;
    stats.lastUpdated = Date.now();
    localStorage.setItem('impactED_site_stats', JSON.stringify(stats));
  }
}

const localDB = new LocalStorageDatabase();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function isNetworkOrUnavailableError(error: unknown): boolean {
  if (!error) return false;
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
  const code = (error as any)?.code;
  return (
    code === 'unavailable' ||
    code === 'internal' ||
    msg.includes('unavailable') ||
    msg.includes('could not reach') ||
    msg.includes('offline') ||
    msg.includes('connection failed') ||
    msg.includes('failed to connect') ||
    msg.includes('network')
  );
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Firebase Integration Wrappers
export const firebaseService = {
  // SEED INITIAL DATABASE IF EMPTY (Firestore or Local)
  async seedDatabaseIfEmpty() {
    if (!isFirebaseAvailable) {
      console.log("Firebase not available, local seed verified.");
      return;
    }

    try {
      const q = query(collection(db, 'articles'));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.log("Firestore empty! Seeding sample articles...");
        for (const art of SAMPLE_ARTICLES) {
          try {
            await setDoc(doc(db, 'articles', art.id), art);
          } catch (err) {
            if (isNetworkOrUnavailableError(err)) {
              console.warn(`Firestore unreachable during seed for articles/${art.id}, seeding localDB copy.`);
              await localDB.saveArticle(art);
            } else {
              handleFirestoreError(err, OperationType.WRITE, `articles/${art.id}`);
            }
          }
        }
        for (const com of SAMPLE_COMMENTS) {
          try {
            await setDoc(doc(db, 'comments', com.id), com);
          } catch (err) {
            if (isNetworkOrUnavailableError(err)) {
              console.warn(`Firestore unreachable during seed for comments/${com.id}, seeding localDB copy.`);
              await localDB.saveComment(com);
            } else {
              handleFirestoreError(err, OperationType.WRITE, `comments/${com.id}`);
            }
          }
        }
        console.log("Firestore seeded successfully!");
      }
    } catch (err) {
      if (isNetworkOrUnavailableError(err)) {
        console.warn("Firestore backend unreachable during seed check. Operating in local mode.");
        return;
      }
      handleFirestoreError(err, OperationType.LIST, 'articles');
    }
  },

  // ARTICLES OPERATIONS
  async getAllArticles(): Promise<Article[]> {
    if (isFirebaseAvailable) {
      try {
        const q = query(collection(db, 'articles'));
        const querySnapshot = await getDocs(q);
        const articles: Article[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          articles.push({ id: docSnap.id, type: 'article', ...data } as Article);
        });
        return articles;
      } catch (err) {
        if (isNetworkOrUnavailableError(err)) {
          console.warn("Firestore offline on getAllArticles, falling back to local storage.");
          return localDB.getArticles();
        }
        handleFirestoreError(err, OperationType.LIST, 'articles');
      }
    }
    return localDB.getArticles();
  },

  async getArticleById(id: string): Promise<Article | null> {
    if (isFirebaseAvailable) {
      try {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          return { id: docSnap.id, type: 'article', ...data } as Article;
        }
        return null;
      } catch (err) {
        if (isNetworkOrUnavailableError(err)) {
          console.warn("Firestore offline on getArticleById, falling back to local storage.");
          return localDB.getArticle(id);
        }
        handleFirestoreError(err, OperationType.GET, `articles/${id}`);
      }
    }
    return localDB.getArticle(id);
  },

  async saveArticle(article: Article): Promise<void> {
    const cleanedArticle = { ...article };
    (Object.keys(cleanedArticle) as Array<keyof Article>).forEach(key => {
      if (cleanedArticle[key] === undefined) {
        delete cleanedArticle[key];
      }
    });

    if (isFirebaseAvailable) {
      try {
        await setDoc(doc(db, 'articles', cleanedArticle.id), {
          ...cleanedArticle,
          updatedAt: serverTimestamp()
        });
        // also save to local so we have a dual copy
        await localDB.saveArticle(cleanedArticle);
        return;
      } catch (err) {
        if (isNetworkOrUnavailableError(err)) {
          console.warn("Firestore offline on saveArticle, falling back to local storage.");
          await localDB.saveArticle(cleanedArticle);
          return;
        }
        handleFirestoreError(err, OperationType.WRITE, `articles/${cleanedArticle.id}`);
      }
    }
    await localDB.saveArticle(cleanedArticle);
  },

  async deleteArticle(id: string): Promise<void> {
    if (isFirebaseAvailable) {
      try {
        await deleteDoc(doc(db, 'articles', id));
        await localDB.deleteArticle(id);
        return;
      } catch (err) {
        if (isNetworkOrUnavailableError(err)) {
          console.warn("Firestore offline on deleteArticle, falling back to local storage.");
          await localDB.deleteArticle(id);
          return;
        }
        handleFirestoreError(err, OperationType.DELETE, `articles/${id}`);
      }
    }
    await localDB.deleteArticle(id);
  },

  // COMMENTS OPERATIONS
  async getComments(articleId: string): Promise<Comment[]> {
    if (isFirebaseAvailable) {
      try {
        const q = query(
          collection(db, 'comments'), 
          where('articleId', '==', articleId)
        );
        const querySnapshot = await getDocs(q);
        const comments: Comment[] = [];
        querySnapshot.forEach((docSnap) => {
          const c = docSnap.data() as Comment;
          if (!c.isHidden) {
            comments.push({ id: docSnap.id, ...c });
          }
        });
        // Sort newest first
        return comments.sort((a, b) => b.createdAt - a.createdAt);
      } catch (err) {
        if (isNetworkOrUnavailableError(err)) {
          console.warn("Firestore offline on getComments, falling back to local storage.");
          return localDB.getComments(articleId);
        }
        handleFirestoreError(err, OperationType.LIST, 'comments');
      }
    }
    return localDB.getComments(articleId);
  },

  async addComment(comment: Comment): Promise<void> {
    if (isFirebaseAvailable) {
      try {
        await setDoc(doc(db, 'comments', comment.id), comment);
        
        // Update commentsCount on article
        const artRef = doc(db, 'articles', comment.articleId);
        const artSnap = await getDoc(artRef);
        if (artSnap.exists()) {
          const art = artSnap.data() as Article;
          await updateDoc(artRef, {
            commentsCount: (art.commentsCount || 0) + 1
          });
        }
        await localDB.saveComment(comment);
        return;
      } catch (err) {
        if (isNetworkOrUnavailableError(err)) {
          console.warn("Firestore offline on addComment, falling back to local storage.");
          await localDB.saveComment(comment);
          return;
        }
        handleFirestoreError(err, OperationType.WRITE, `comments/${comment.id}`);
      }
    }
    await localDB.saveComment(comment);
  },

  async reportComment(commentId: string): Promise<void> {
    if (isFirebaseAvailable) {
      try {
        const comRef = doc(db, 'comments', commentId);
        const comSnap = await getDoc(comRef);
        if (comSnap.exists()) {
          const com = comSnap.data() as Comment;
          await updateDoc(comRef, {
            reportsCount: (com.reportsCount || 0) + 1
          });
        }
        await localDB.reportComment(commentId);
        return;
      } catch (err) {
        if (isNetworkOrUnavailableError(err)) {
          console.warn("Firestore offline on reportComment, falling back to local storage.");
          await localDB.reportComment(commentId);
          return;
        }
        handleFirestoreError(err, OperationType.WRITE, `comments/${commentId}`);
      }
    }
    await localDB.reportComment(commentId);
  },

  // REACTIONS
  async updateArticleReactions(articleId: string, reactions: { great: number, like: number, heart: number, wow: number }): Promise<void> {
    if (isFirebaseAvailable) {
      try {
        const artRef = doc(db, 'articles', articleId);
        await updateDoc(artRef, { reactions });
        // update local
        const localArt = await localDB.getArticle(articleId);
        if (localArt) {
          localArt.reactions = reactions;
          await localDB.saveArticle(localArt);
        }
        return;
      } catch (err) {
        if (isNetworkOrUnavailableError(err)) {
          console.warn("Firestore offline on updateArticleReactions, falling back to local storage.");
          const localArt = await localDB.getArticle(articleId);
          if (localArt) {
            localArt.reactions = reactions;
            await localDB.saveArticle(localArt);
          }
          return;
        }
        handleFirestoreError(err, OperationType.WRITE, `articles/${articleId}`);
      }
    }
    const localArt = await localDB.getArticle(articleId);
    if (localArt) {
      localArt.reactions = reactions;
      await localDB.saveArticle(localArt);
    }
  },

  // USER PROFILE OPERATIONS
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (isFirebaseAvailable) {
      try {
        const docRef = doc(db, 'profiles', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
        }
        return await localDB.getProfile(uid);
      } catch (err) {
        if (isNetworkOrUnavailableError(err)) {
          console.warn("Firestore offline on getUserProfile, falling back to local storage.");
          return await localDB.getProfile(uid);
        }
        handleFirestoreError(err, OperationType.GET, `profiles/${uid}`);
      }
    }
    return await localDB.getProfile(uid);
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    if (isFirebaseAvailable) {
      try {
        await setDoc(doc(db, 'profiles', profile.uid), profile);
        await localDB.saveProfile(profile);
        return;
      } catch (err) {
        if (isNetworkOrUnavailableError(err)) {
          console.warn("Firestore offline on saveUserProfile, falling back to local storage.");
          await localDB.saveProfile(profile);
          return;
        }
        handleFirestoreError(err, OperationType.WRITE, `profiles/${profile.uid}`);
      }
    }
    await localDB.saveProfile(profile);
  },

  async toggleBookmark(uid: string, articleId: string): Promise<string[]> {
    const profile = await this.getUserProfile(uid);
    if (!profile) return [];
    
    const bookmarks = profile.bookmarks || [];
    const isBookmarked = bookmarks.includes(articleId);
    let updatedBookmarks: string[];
    
    if (isBookmarked) {
      updatedBookmarks = bookmarks.filter(id => id !== articleId);
    } else {
      updatedBookmarks = [...bookmarks, articleId];
    }
    
    const updatedProfile = { ...profile, bookmarks: updatedBookmarks };
    await this.saveUserProfile(updatedProfile);
    return updatedBookmarks;
  },

  // ADMIN OPERATIONS
  async getReportedComments(): Promise<Comment[]> {
    if (isFirebaseAvailable) {
      try {
        const q = query(
          collection(db, 'comments'), 
          where('reportsCount', '>', 0)
        );
        const querySnapshot = await getDocs(q);
        const comments: Comment[] = [];
        querySnapshot.forEach((docSnap) => {
          comments.push({ id: docSnap.id, ...docSnap.data() } as Comment);
        });
        return comments;
      } catch (err) {
        if (isNetworkOrUnavailableError(err)) {
          console.warn("Firestore offline on getReportedComments, falling back to local storage.");
          return localDB.getReportedComments();
        }
        handleFirestoreError(err, OperationType.LIST, 'comments');
      }
    }
    return localDB.getReportedComments();
  },

  async updateCommentModeration(commentId: string, isHidden: boolean): Promise<void> {
    if (isFirebaseAvailable) {
      try {
        const comRef = doc(db, 'comments', commentId);
        await updateDoc(comRef, {
          isHidden: isHidden,
          reportsCount: 0 // reset reports
        });
        await localDB.updateCommentStatus(commentId, isHidden);
        return;
      } catch (err) {
        if (isNetworkOrUnavailableError(err)) {
          console.warn("Firestore offline on updateCommentModeration, falling back to local storage.");
          await localDB.updateCommentStatus(commentId, isHidden);
          return;
        }
        handleFirestoreError(err, OperationType.WRITE, `comments/${commentId}`);
      }
    }
    await localDB.updateCommentStatus(commentId, isHidden);
  },

  async getAdminProfiles(): Promise<UserProfile[]> {
    if (isFirebaseAvailable) {
      try {
        const q = query(
          collection(db, 'profiles'),
          where('role', '==', 'admin')
        );
        const querySnapshot = await getDocs(q);
        const admins: UserProfile[] = [];
        querySnapshot.forEach((docSnap) => {
          admins.push({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
        });
        if (admins.length > 0) return admins;
      } catch (err) {
        if (isNetworkOrUnavailableError(err)) {
          console.warn("Firestore offline on getAdminProfiles, falling back to local storage.");
          const allProfs = await localDB.getProfiles();
          return allProfs.filter(p => p.role === 'admin');
        }
        console.error("Error getting admin profiles from firestore:", err);
      }
    }
    const allProfs = await localDB.getProfiles();
    return allProfs.filter(p => p.role === 'admin');
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    if (isFirebaseAvailable) {
      try {
        const q = query(
          collection(db, 'audit_logs'),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const logs: AuditLog[] = [];
        querySnapshot.forEach((docSnap) => {
          logs.push({ id: docSnap.id, ...docSnap.data() } as AuditLog);
        });
        return logs;
      } catch (err) {
        if (isNetworkOrUnavailableError(err)) {
          console.warn("Firestore offline on getAuditLogs, falling back to local storage.");
          return localDB.getAuditLogs();
        }
        handleFirestoreError(err, OperationType.LIST, 'audit_logs');
      }
    }
    return localDB.getAuditLogs();
  },

  async createAuditLog(log: Omit<AuditLog, 'id'>): Promise<void> {
    const id = 'log-' + Math.random().toString(36).substring(2, 11);
    const fullLog: AuditLog = { id, ...log };
    if (isFirebaseAvailable) {
      try {
        await setDoc(doc(db, 'audit_logs', id), fullLog);
        await localDB.saveAuditLog(fullLog);
        return;
      } catch (err) {
        if (isNetworkOrUnavailableError(err)) {
          console.warn("Firestore offline on createAuditLog, falling back to local storage.");
          await localDB.saveAuditLog(fullLog);
          return;
        }
        handleFirestoreError(err, OperationType.WRITE, `audit_logs/${id}`);
      }
    }
    await localDB.saveAuditLog(fullLog);
  },

  // SITE ANALYTICS & VISITS TRACKING
  async getSiteStats(): Promise<SiteStats> {
    if (isFirebaseAvailable) {
      try {
        const statsRef = doc(db, 'analytics', 'site_stats');
        const snap = await getDoc(statsRef);
        if (snap.exists()) {
          const data = snap.data();
          const totalVisits = Number(data.totalVisits) || 0;
          return {
            totalVisits,
            totalActiveReaders: Number(data.totalActiveReaders) || Math.max(1, Math.round(totalVisits * 0.12)),
            weeklyReadingHours: Number(data.weeklyReadingHours) || 32,
            lastUpdated: data.lastUpdated ? (data.lastUpdated.toMillis ? data.lastUpdated.toMillis() : Number(data.lastUpdated)) : Date.now()
          };
        }
      } catch (err) {
        console.warn("Error fetching site stats from Firestore, falling back to local:", err);
      }
    }
    return await localDB.getSiteStats();
  },

  async recordVisit(): Promise<SiteStats> {
    if (isFirebaseAvailable) {
      try {
        const statsRef = doc(db, 'analytics', 'site_stats');
        const snap = await getDoc(statsRef);
        let newVisits = 1;
        let activeReaders = 1;
        let readingHours = 32;

        if (snap.exists()) {
          const data = snap.data();
          const currentVisits = Number(data.totalVisits) || 0;
          newVisits = currentVisits + 1;
          activeReaders = Math.max(1, Math.round(newVisits * 0.12));
          readingHours = Number(data.weeklyReadingHours) || 32;
          await updateDoc(statsRef, {
            totalVisits: increment(1),
            totalActiveReaders: activeReaders,
            lastUpdated: serverTimestamp()
          });
        } else {
          await setDoc(statsRef, {
            totalVisits: 1,
            totalActiveReaders: 1,
            weeklyReadingHours: 32,
            lastUpdated: serverTimestamp()
          });
        }

        const stats: SiteStats = {
          totalVisits: newVisits,
          totalActiveReaders: activeReaders,
          weeklyReadingHours: readingHours,
          lastUpdated: Date.now()
        };
        await localDB.recordVisit();
        return stats;
      } catch (err) {
        console.warn("Firestore offline on recordVisit, falling back to local storage:", err);
      }
    }
    return await localDB.recordVisit();
  },

  async incrementArticleViews(articleId: string): Promise<void> {
    if (isFirebaseAvailable) {
      try {
        const artRef = doc(db, 'articles', articleId);
        await updateDoc(artRef, {
          viewsCount: increment(1)
        });
        const statsRef = doc(db, 'analytics', 'site_stats');
        await updateDoc(statsRef, {
          totalVisits: increment(1),
          weeklyReadingHours: increment(1),
          lastUpdated: serverTimestamp()
        }).catch(() => {});
        await localDB.incrementArticleViews(articleId);
        return;
      } catch (err) {
        console.warn("Firestore offline on incrementArticleViews, falling back to local storage:", err);
      }
    }
    await localDB.incrementArticleViews(articleId);
  },

  subscribeToSiteStats(callback: (stats: SiteStats) => void): () => void {
    const notifyLocal = async () => {
      const stats = await localDB.getSiteStats();
      callback(stats);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'impactED_site_stats') {
        notifyLocal();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    if (isFirebaseAvailable) {
      try {
        const statsRef = doc(db, 'analytics', 'site_stats');
        const unsubscribe = onSnapshot(statsRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const totalVisits = Number(data.totalVisits) || 0;
            callback({
              totalVisits,
              totalActiveReaders: Number(data.totalActiveReaders) || Math.max(1, Math.round(totalVisits * 0.12)),
              weeklyReadingHours: Number(data.weeklyReadingHours) || 32,
              lastUpdated: data.lastUpdated?.toMillis ? data.lastUpdated.toMillis() : Date.now()
            });
          } else {
            notifyLocal();
          }
        }, (err) => {
          console.warn("Error subscribing to site_stats:", err);
          notifyLocal();
        });
        return () => {
          window.removeEventListener('storage', handleStorageChange);
          unsubscribe();
        };
      } catch (err) {
        console.warn("Subscription to site_stats failed, falling back to local:", err);
      }
    }
    notifyLocal();
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }
};
