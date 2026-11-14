# NeuroQuest AI Academy

**NeuroQuest AI Academy** is an interactive, gamified AI & Machine Learning learning platform designed with an Apple-inspired frosted Liquid Glass interface. Learners explore foundational AI concepts through visual simulations, multi-phase quests, daily missions, cloud-synced cadet leagues, and a real-time Socratic AI tutor (**NeuroBot**).

---

## Key Features

- **Interactive AI Curriculum & Quests**: Structured multi-stage learning paths covering AI foundations, neural networks, embeddings, decision boundaries, and autonomous agent loops.
- **Hands-On Visualizers & Labs**: Interactive widgets (`NeuronWeightsWidget`, `DecisionBoundaryWidget`, `TokenEmbeddingWidget`, `AgentLoopWidget`) for experimenting directly with weights, boundaries, tokens, and reasoning loops.
- **NeuroBot Socratic AI Tutor**: Context-aware AI tutor powered by the Gemini API via a secure server-side Express proxy (`/api/tutor`), supporting *Explain*, *Hint*, *Misconceptions*, *Practice*, and free-form chat modes across beginner, intermediate, and advanced depth tiers.
- **Gamified Progression**: Earn XP, Sparks, streaks, daily missions, milestone badges, and climb cadet league leaderboards.
- **Cloud Sync & Authentication**: Real-time Google Sign-In and profile/leaderboard synchronization backed by Firebase Authentication and Cloud Firestore with strict security rules.
- **Tactile Liquid Glass UI**: Smooth spring micro-interactions (`motion/react`), Light/Dark/High-Contrast themes, and responsive mobile-first navigation.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4, Motion (`motion/react`), Lucide Icons
- **Backend / API Proxy**: Node.js, Express 5 (`server.ts`), `@google/genai`
- **Auth & Persistence**: Firebase Authentication, Cloud Firestore (`firestore.rules`)

---

## Project Structure

```text
├── src/
│   ├── components/       # Quest views, labs, tutor drawer, achievements, modals, UI primitives
│   ├── data/             # Curriculum stages, courses, and gamification definitions
│   ├── services/         # Firebase, Auth, Firestore storage, Leaderboard, Social, Tutor API client
│   ├── types/            # Shared TypeScript interfaces
│   └── utils/            # Achievements, confetti, and sound helpers
├── server.ts             # Express 5 server (Gemini /api/tutor proxy + Vite/dist serving)
├── firestore.rules       # Strict Firestore security rules
├── security_spec.md      # Firestore security invariants & adversarial test spec
├── .env.example          # Safe environment variable template (no secrets)
└── package.json
```

---

## Environment Setup & Security

All `.env` files are excluded from version control via `.gitignore` (only `.env.example` is tracked as a template).

1. Copy `.env.example` to `.env` for local development (never commit `.env`):

   ```bash
   cp .env.example .env
   ```

2. Set your server-side Gemini API key in `.env` (or in your hosting platform's secret manager):

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

> **Security Note**: `GEMINI_API_KEY` is used exclusively on the server inside `server.ts` and is never exposed to client bundles.

---

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Starts the Express + Vite development server on `http://localhost:3000`.

### Typecheck & Production Build

```bash
npm run lint
npm run build
```

### Start Production Server

```bash
NODE_ENV=production npm start
```
