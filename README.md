# impactED — Global Student Publishing Platform

<p align="center">
  <a href="https://impactedglobal.xyz">
    <img src="src/assets/images/impacted_infinity_logo_1785162114538.jpg" alt="impactED Logo" width="100" height="100" style="border-radius: 50%;" />
  </a>
</p>

<p align="center">
  <strong>Empowering the next generation of student scholars, essayists, and critical thinkers worldwide.</strong>
</p>

<p align="center">
  <a href="https://impactedglobal.xyz"><strong>🌐 Official Live Website: impactedglobal.xyz</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Production%20Domain-impactedglobal.xyz-2980b9?style=flat-square" alt="Domain" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?style=flat-square&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/License-Academic_Proprietary-stone?style=flat-square" alt="License" />
</p>

---

## 🏛️ About impactED

**impactED** is a global scholastic publishing house and open digital archive designed specifically for student authors, researchers, and creative writers. 

In traditional secondary and undergraduate academic circles, student discourse rarely extends beyond the classroom walls. **impactED** transforms student scholarship into public intellectual discourse, offering young writers a dedicated, moderated, and peer-supported platform to publish research manuscripts, opinion columns, philosophical dissertations, and creative literary works.

- **Official Web Address**: [https://impactedglobal.xyz](https://impactedglobal.xyz)
- **Primary Audience**: Secondary and undergraduate students, high school literary journals, debate scholars, and scholastic writers across the globe.
- **Safety Standard**: Built with strict under-18 student safety safeguards, human-in-the-loop editorial curation, and an academic Honor Code.

---

## 🌟 Key Product Experiences & Architecture

### 1. 📚 The Scholastic Library & Feed
- **Academic Taxonomies**: Multi-disciplinary indexing spanning **Humanities**, **STEM**, **Philosophy**, **Social Sciences**, **Creative Writing**, and **Opinion**.
- **Scholastic Search & Discovery**: Instant keyword searching across titles, authors, excerpts, and institution affiliations.
- **Curated Reading Metrics**: Time-to-read estimations, citation counts, peer reaction distributions, and academic level indicators.

### 2. 📖 The Scholastic Reader Environment
- **Distraction-Free Scholarly Layout**: High-contrast, mathematically spaced editorial typography paired with warm paper-tone backgrounds (`#fdfcf0`) to minimize ocular strain.
- **Text-to-Speech (TTS) Engine**: Built-in speech synthesis enabling auditory review of complex articles.
- **Scholastic Reaction Stamps**: Instead of vanity metrics or likes, peers award academic stamps:
  - 💡 *Insightful*
  - 🔬 *Well-Researched*
  - ✒️ *Eloquent*
  - 💭 *Thought-Provoking*
- **Peer Annotations & Threads**: Moderated academic comment threads encouraging constructive criticism, peer citations, and cross-school dialogue.

### 3. ✍️ Manuscript Editorial Studio
- **Streamlined Authoring Canvas**: A focused writing environment with live word count tracking, character budgeting, reading time estimation, and auto-excerpt extraction.
- **Auto-Saving Cloud Drafts**: In-progress works are saved automatically both in local storage and synced with Google Cloud Firestore.
- **Author Identity Attribution**: Full student attribution including author name, school or institutional affiliation, geographic country, and academic biography.

### 4. 🌍 3D Global Scholastic Globe
- **Interactive WebGL Globe**: High-performance interactive 3D globe powered by Cobe, rendering contributor nodes and student reader activity across continents in real time.
- **Global Reach Metrics**: Showcases international student participation across North America, Europe, Asia, Latin America, Oceania, and Africa.

### 5. ⚡ Reading Streak & Academic Habit Engine
- **Daily Scholastic Streak**: Tracks continuous daily reading sessions to cultivate lifelong intellectual curiosity.
- **Milestone Recognition**: Animated celebratory feedback (via canvas confetti) and milestone tiers rewarding student engagement.

### 6. 🛡️ Editorial Administration & Moderation Panel
- **Role-Based Access Control**: Student author accounts paired with secure Administrator accounts protected by invite passcodes.
- **Editorial Review Pipeline**: Comprehensive review dashboard to inspect pending submissions, verify institutional integrity, approve manuscripts for public indexing, or request author revisions.
- **Deleted Works Recovery**: Soft-delete functionality allowing student authors and administrators to restore archived papers at any time.

---

## 🛠️ Complete Technical Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 (`react`, `react-dom`) | Modern component architecture with concurrent rendering |
| **Language** | TypeScript 5.8 | Strict type-safety across manuscripts, users, and comments |
| **Bundler & Dev Server** | Vite 6.2 | Lightning-fast HMR and optimized production bundling |
| **Styling & Design System** | Tailwind CSS v4 | Utility-first styling with custom editorial typography tokens |
| **Typography** | Product Sans & Editorial Serif | Clean geometric body paired with scholastic heading display fonts |
| **Animations** | Motion (`motion/react`) | Fluid modal entrances, drawer gestures, and layout transitions |
| **3D Graphics** | Cobe (`cobe`) | WebGL interactive rotating globe visualizer |
| **Icons** | Lucide React | Clean, scalable vector iconography |
| **Cloud Database** | Firebase Firestore | Real-time synchronized cloud document storage |
| **Authentication** | Firebase Auth | Secure student sign-up, login, and session tokens |
| **Micro-Interactions** | Canvas Confetti | Visual celebrations for publication and streak milestones |

---

## 📁 Repository Directory Structure

```text
├── src/
│   ├── assets/
│   │   └── images/                     # Official brand logos, banners, and scholastic imagery
│   │       ├── impacted_infinity_logo_1785162114538.jpg
│   │       └── scholar_hat_logo_1784123282474.jpg
│   ├── components/
│   │   ├── AcademicDashboard.tsx       # Author analytics and manuscript performance
│   │   ├── AcademicReader.tsx          # Full-screen article reader with reactions & TTS
│   │   ├── AdminPanel.tsx              # Editorial moderation queue and user administration
│   │   ├── ArticleCard.tsx             # Scholastic card layout with tags and authors
│   │   ├── ArticleEditor.tsx           # Manuscript submission studio with draft persistence
│   │   ├── AuthModal.tsx               # Student registration, login, and country selector
│   │   ├── CommentSection.tsx          # Moderated scholastic commentary & discussion
│   │   ├── GlobalReachMap.tsx          # Interactive 3D WebGL contributor globe
│   │   ├── ReadingStreakTracker.tsx    # Daily reading streak counter & milestone badge
│   │   └── TextToSpeechPlayer.tsx      # Native browser speech synthesis player
│   ├── hooks/
│   │   └── useTextToSpeech.ts          # Custom hook managing Web Speech API playback
│   ├── firebase.ts                     # Firebase client SDK initialization & Firestore handles
│   ├── firebaseService.ts              # Data access layer for articles, comments, and users
│   ├── types.ts                        # Unified TypeScript interfaces and data models
│   ├── App.tsx                         # Primary application state, router, and modal coordinator
│   ├── main.tsx                        # Application mount entry point
│   └── index.css                       # Tailwind CSS imports and custom utility classes
├── firestore.rules                     # Production Firestore security and permission rules
├── firebase-blueprint.json             # Schema definitions and data model specifications
├── firebase-applet-config.json         # Firebase project configuration metadata
├── metadata.json                       # AI Studio applet capabilities and permissions
├── index.html                          # HTML5 entry point with OpenGraph and canonical tags
├── vite.config.ts                      # Vite configuration with Tailwind CSS plugin
├── tsconfig.json                       # TypeScript compiler options
└── package.json                        # Project dependencies and operational scripts
```

---

## 🗄️ Firestore Database Schema

```typescript
// Core Article Document Schema
interface Article {
  id: string;
  title: string;
  content: string;
  category: 'Humanities' | 'STEM' | 'Philosophy' | 'Social Sciences' | 'Creative Writing' | 'Opinion';
  author: {
    name: string;
    school: string;
    country: string;
    bio?: string;
  };
  publishedAt: string; // ISO 8601 string
  readTime: number;    // Estimated minutes
  status: 'published' | 'pending' | 'draft' | 'deleted';
  reactions: {
    insightful: number;
    wellResearched: number;
    eloquent: number;
    thoughtProvoking: number;
  };
  commentsCount: number;
}

// User Profile Schema
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  school: string;
  country: string;
  role: 'student' | 'admin';
  bio?: string;
  createdAt: string;
}
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** (or **bun** / **pnpm** / **yarn**)

### 2. Installation
Clone this repository to your local machine:
```bash
git clone https://github.com/<your-username>/impacted.git
cd impacted
```

Install package dependencies:
```bash
npm install
```

### 3. Running Locally
Start the development server:
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Building for Production
Create an optimized production bundle:
```bash
npm run build
```
Verify the build with:
```bash
npm run preview
```

---

## 🌐 Live Deployment & Domain

The live platform is deployed to Google Cloud Run and bound to the official custom domain:

**[https://impactedglobal.xyz](https://impactedglobal.xyz)**

- **SSL/TLS Encryption**: Fully secured via automatic Let's Encrypt managed SSL certificates.
- **Reverse Proxy**: Routed through cloud edge network on port 3000.
- **Canonical URL**: `https://impactedglobal.xyz`

---

## 🤝 Contributing & Community Honor Code

Student scholarship thrives on integrity. All contributors and student authors agree to:
1. **Originality**: Submit strictly original student-authored essays and cite all academic sources.
2. **Scholastic Civility**: Treat peer submissions with respectful, constructive feedback.
3. **Inclusive Scholarship**: Encourage writers of all backgrounds and secondary schools globally.

---

## 📜 Intellectual Property & Copyright

All student authors retain full publication ownership and moral rights over their submitted manuscripts, articles, and artistic works.

© 2026 impactED Student Publishing Group. All rights reserved.
