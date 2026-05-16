<div align="center">

# 🗺️ Pathfinder

### AI-Powered Skill Trees for Learning Anything

[![Built with MeDo](https://img.shields.io/badge/Built%20with-MeDo-58CC02?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6Ii8+PHBhdGggZD0iTTIgMTdsMTAgNSAxMC01Ii8+PHBhdGggZD0iTTIgMTJsMTAgNSAxMC01Ii8+PC9zdmc+)](https://medo.ai)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

**Turn any topic into an interactive RPG skill tree.** Pathfinder uses AI to generate complete learning paths — then gamifies the journey with lessons, quizzes, XP, streaks, and achievements.

[🚀 Try Live Demo](https://pathfinder.medo.ai) · [📺 Watch Video](https://youtu.be/demo) · [🐛 Report Bug](https://github.com/omrmohamed1234q-a11y/pathfinder/issues)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧠 **AI Skill Tree Generation** | Type any topic → AI generates 20-30 structured nodes with prerequisites |
| 🎮 **Duolingo-Style Gamification** | XP, levels, streaks, achievements, and daily challenges |
| 📚 **Rich Content Types** | AI-generated lessons, quizzes, flashcards, videos, projects |
| 🤖 **AI Tutor Chat** | Context-aware Q&A within each learning node |
| 🗺️ **Career Paths** | Pre-built multi-topic learning journeys |
| 🏆 **Leaderboard & Friends** | Compete globally or with friends |
| 🔊 **Sound Effects** | Web Audio API synthesized feedback — no external files |
| 📱 **Responsive** | Full mobile support with touch optimization |
| 🌙 **Dark Theme** | Professional Duolingo-inspired dark UI |
| 🔥 **Daily Challenges** | Rotating challenges with countdown timers and bonus XP |

## 🏗️ Architecture

```
src/
├── components/
│   ├── landing/       # Hero, Features, Testimonials, Daily Challenge
│   ├── layouts/       # Navbar, Footer
│   ├── skilltree/     # SkillNode, NodeModal, SkillTreeCanvas
│   ├── effects/       # Animations, Unlock effects
│   └── auth/          # Authentication modals
├── pages/             # Landing, SkillTree, Progress, Achievements, Leaderboard
├── services/          # AI (Groq/ERNIE), Image, Video services
├── utils/             # Progress storage, Haptics, Sound system
├── contexts/          # Auth, Sound contexts
└── types/             # TypeScript type definitions
```

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/omrmohamed1234q-a11y/pathfinder.git
cd pathfinder

# Install
npm install

# Configure (optional — for AI features)
cp .env.example .env
# Add your GROQ_API_KEY or ERNIE_API_KEY

# Run
npm run dev
```

## 🔑 API Configuration

Pathfinder works standalone with cached content. For AI-powered generation:

| Provider | Key | Free Tier |
|----------|-----|-----------|
| [Groq](https://console.groq.com) | `VITE_GROQ_API_KEY` | ✅ Free |
| [ERNIE](https://cloud.baidu.com) | `VITE_ERNIE_API_KEY` | ✅ Free |

## 🎨 Design System

Built with a custom **Duolingo-inspired** design language:

- **Colors**: Explorer Green (`#58CC02`), Ocean Blue (`#49C0F8`), Royal Purple (`#A560E8`)
- **Typography**: Nunito (800 weight for headings)
- **Components**: 3D raised buttons, chunky progress bars, floating node circles
- **Animations**: Node bounce, achievement pop, shimmer, energy flow
- **Theme**: Professional dark (`#131F24` base) with vibrant accents

## 🏆 Built for MeDo Hackathon

This project was built using [MeDo](https://medo.ai) — a platform that turns conversations into fully functional applications.

**How MeDo was used:**
- 💬 Multi-turn chat to design and iterate on the full-stack application
- 🔌 Plugin integration for AI services (Groq LLM)
- 🚀 One-click deployment to a public URL
- 🎨 Visual editor for fine-tuning UI components

**Category:** Learning & Education

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS 3, Custom CSS Design System |
| **UI Library** | shadcn/ui (Radix primitives) |
| **AI** | Groq (Llama 3), ERNIE |
| **Backend** | Supabase (Auth, DB, RPC) |
| **State** | LocalStorage + React Context |
| **Audio** | Web Audio API (synthesized) |
| **Deployment** | MeDo Platform |

## 📝 License

MIT © [Pathfinder Team](https://github.com/omrmohamed1234q-a11y)

---

<div align="center">

**Made with ❤️ and AI**

🗺️ *Learn anything. Master everything.*

</div>
