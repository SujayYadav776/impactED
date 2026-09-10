# impactED — Global Student Publishing Platform

<p align="center">
  <a href="https://impactedglobal.xyz">
    <img src="src/assets/images/impacted_infinity_logo_1785162114538.jpg" alt="impactED Logo" width="96" height="96" style="border-radius: 50%;" />
  </a>
</p>

<p align="center">
  <strong>Empowering the next generation of student scholars, writers, and critical thinkers worldwide.</strong>
</p>

<p align="center">
  <a href="https://impactedglobal.xyz"><strong>🌐 Visit Live Platform: impactedglobal.xyz</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-impactedglobal.xyz-2980b9?style=flat-square" alt="Domain" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/Status-Production-success?style=flat-square" alt="Status" />
</p>

---

## 📖 Overview

**impactED** is an academic publication platform tailored for students worldwide. It gives young scholars and writers a dedicated, safe, and community-moderated forum to share written essays, creative pieces, investigative journalism, and research papers.

- **Live URL**: [https://impactedglobal.xyz](https://impactedglobal.xyz)
- **Target Audience**: Secondary & collegiate student authors, high school academic journals, literary circles, and scholastic peer networks.

---

## ✨ Core Features

### 🖋️ Manuscript & Editorial Studio
- **Distraction-Free Editor**: Dedicated authoring canvas with real-time word counting, character budgeting, reading time estimation, and auto-draft persistence.
- **Academic Taxonomy**: Tagging system and categorization across Humanities, STEM, Philosophy, Social Sciences, Creative Writing, and Opinion.
- **Draft Management**: Save in-progress drafts locally and in Firestore, edit published works, or archive deleted pieces with restoration capabilities.

### 🌍 Global Student Community & Interactive Globe
- **Interactive 3D Scholastic Globe**: High-performance WebGL globe powered by Cobe displaying student contributors and publishing hubs across continents.
- **Reading Streak & Engagement**: Interactive daily reading tracker to foster continuous academic inquiry and peer critique.
- **Academic Reaction Stamps**: Lightweight scholastic stamps (*Insightful*, *Well-Researched*, *Eloquent*, *Thought-Provoking*) to encourage high-quality discourse.

### 🛡️ Human-in-the-Loop Moderation & Safety
- **Role-Based Access Control**: Student author accounts and verified Administrator/Editor accounts.
- **Under-18 Safety Standards**: Content guidelines, community peer reporting, and administrative curation.
- **Peer Comments & Reviews**: Moderated threads fostering constructive scholastic feedback and respectful debate.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 with TypeScript |
| **Build & Tooling** | Vite 6.2 |
| **Styling & Design System** | Tailwind CSS v4 + Product Sans geometric typography |
| **Animations** | Motion (`motion/react`) |
| **Interactive 3D Visualizer** | Cobe (WebGL Globe) |
| **Icons** | Lucide React |
| **Cloud Database & Auth** | Google Cloud Firebase (Firestore & Firebase Authentication) |
| **Celebrations & Micro-interactions** | Canvas Confetti |

---

## 📂 Project Structure

```text
├── src/
│   ├── assets/              # Logos, branding assets, and scholastic imagery
│   ├── components/          # Modular component library
│   │   ├── AcademicReader.tsx      # Comprehensive reader with annotations and reactions
│   │   ├── AdminPanel.tsx          # Editorial moderation and publishing controls
│   │   ├── ArticleCard.tsx         # Scholastic card layout with tags and authors
│   │   ├── ArticleEditor.tsx       # Manuscript submission studio
│   │   ├── AuthModal.tsx           # Authentication modal with student registration
│   │   ├── GlobalGlobe.tsx         # 3D interactive WebGL globe
│   │   ├── ReadingStreakTracker.tsx # Continuous learning gamification tracker
│   │   └── StudentDashboard.tsx    # Author profile, manuscripts, and analytics
│   ├── services/            # Firestore and Firebase services
│   ├── types/               # TypeScript data models and interfaces
│   ├── App.tsx              # Main application router and state management
│   ├── main.tsx             # React DOM entry point
│   └── index.css            # Tailwind CSS imports and custom styling
├── firestore.rules          # Firestore database security rules
├── metadata.json            # Application metadata and capabilities
├── index.html               # HTML entry point with SEO and OpenGraph tags
└── package.json             # NPM dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.0 or higher
- **npm** or **bun** / **yarn** / **pnpm**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/impacted.git
   cd impacted
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   Ensure `firebase-applet-config.json` contains your Firebase project credentials or set environment variables as outlined in `.env.example`.

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open your browser to [http://localhost:3000](http://localhost:3000).

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🌐 Deployment & Custom Domain

The application is deployed and accessible globally at:
**[https://impactedglobal.xyz](https://impactedglobal.xyz)**

---

## 📄 License & Intellectual Property

All student authors retain full publication ownership and moral rights to their manuscripts, essays, and original commentary.

© 2026 impactED Student Publishing Group.
