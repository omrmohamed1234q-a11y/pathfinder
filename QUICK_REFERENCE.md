# 🎯 Pathfinder - Quick Reference Card

## ⚡ 60-Second Setup

```bash
# 1. Extract
unzip pathfinder-source.zip
cd pathfinder

# 2. Install
npm install

# 3. Run
npm run dev

# 4. Open browser
# http://localhost:5173
```

## 🔑 Pre-Configured API Keys

### ✅ Groq API (LLaMA) - Ready to Use!
- 4 keys pre-configured for load balancing
- Powers skill tree, lessons, and quizzes
- No setup needed!

### ✅ Supabase - Ready to Use!
- Database: `gtjlzwqgbdiphbcabdrc.supabase.co`
- Authentication enabled
- Progress tracking active
- No setup needed!

### ⚠️ Gemini API (Optional)
- Only needed for AI chatbot feature
- Get free key: https://makersuite.google.com/app/apikey
- Add to `.env`: `VITE_GEMINI_API_KEY=your_key_here`

## 📦 What's in the Package

```
✅ Complete source code (src/)
✅ All dependencies (package.json)
✅ Configuration files (vite, tailwind, typescript)
✅ Environment variables (.env) with API keys
✅ Supabase setup (supabase/)
✅ Documentation (README.md, HACKATHON_SETUP.md)
```

## 🎮 Core Features

1. **AI Skill Tree Generator** - Enter any topic, get personalized learning path
2. **Interactive Lessons** - Mermaid diagrams, code examples, progress tracking
3. **Quiz System** - Multiple choice, instant feedback, XP rewards
4. **Custom Practice** - Create quizzes on any topic, any difficulty
5. **AI Chatbot** - Context-aware learning assistant (needs Gemini key)
6. **User Auth** - Sign up, login, progress persistence

## 🚀 Demo Script

### 1. Landing Page (10 seconds)
- Show hero section with "Generate Your Learning Path"
- Highlight RPG-style gamification

### 2. Skill Tree Generation (30 seconds)
- Enter topic: "Web Development" or "Python"
- Click "Generate Skill Tree"
- Show AI-generated skill tree with nodes and connections
- Explain: "AI creates personalized learning paths for ANY topic"

### 3. Interactive Learning (30 seconds)
- Click a skill node
- Show lesson with Mermaid diagram
- Take a quiz
- Earn XP and level up
- Show confetti animation

### 4. Custom Practice (20 seconds)
- Navigate to Practice page
- Enter custom topic
- Generate and take quiz
- Show instant results

### 5. Key Differentiators (10 seconds)
- Multi-model AI approach (Groq + Gemini)
- RPG gamification increases engagement
- Works for ANY learning topic
- Personalized learning paths

## 🎯 Hackathon Talking Points

### Problem
- Traditional learning is boring and unstructured
- Hard to stay motivated
- One-size-fits-all approach doesn't work

### Solution
- AI-powered personalized learning paths
- RPG-style gamification for engagement
- Works for any topic (tech, creative, professional)

### Innovation
- Multi-model AI architecture for efficiency
- Dynamic skill tree generation
- Gamified progress tracking
- Real-time AI assistance

### Tech Stack
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Groq LLaMA (skill trees, lessons, quizzes)
- Google Gemini (chatbot)
- Supabase (auth + database)

### Scalability
- Can generate learning paths for unlimited topics
- Multi-key API approach prevents rate limits
- Cloud-based persistence with Supabase
- Ready for production deployment

## 🐛 Quick Troubleshooting

### Port in use?
```bash
npx kill-port 5173
npm run dev
```

### Dependencies failed?
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build errors?
```bash
rm -rf dist .vite
npm run build
```

### API not working?
- Check `.env` file is in root directory
- Restart dev server after changing .env
- Verify all VITE_ variables are present

## 📊 Project Stats

- **Lines of Code**: ~15,000+
- **Components**: 50+
- **Pages**: 10+
- **AI Models**: 2 (Groq LLaMA + Gemini)
- **API Keys**: 5 (4 Groq + 1 Gemini)
- **Database Tables**: 5+
- **Features**: 15+

## 🎉 Success Checklist

- [ ] Extract ZIP
- [ ] Install dependencies
- [ ] Verify .env exists
- [ ] Run dev server
- [ ] Test skill tree generation
- [ ] Test lesson viewing
- [ ] Test quiz taking
- [ ] Test custom practice
- [ ] Prepare demo topics
- [ ] Practice presentation
- [ ] Clear browser cache before demo
- [ ] Have backup topics ready

## 💡 Demo Tips

1. **Pre-generate a skill tree** before demo to save time
2. **Clear browser cache** before presenting
3. **Have 3-4 interesting topics** ready to show versatility
4. **Show the XP/level system** - audiences love gamification
5. **Emphasize AI integration** - it's the core innovation
6. **Mention scalability** - works for ANY topic
7. **Show mobile responsiveness** if time permits

## 🏆 Winning Points

- ✨ **Visual Appeal**: Beautiful RPG-style UI
- 🤖 **AI Innovation**: Multi-model approach
- 🎮 **Engagement**: Gamification works
- 📈 **Scalability**: Unlimited topics
- 💪 **Technical Depth**: Full-stack implementation
- 🚀 **Production Ready**: Deployed and working

---

## 📞 Need Help?

1. Check `HACKATHON_SETUP.md` for detailed setup
2. Review `README.md` for feature documentation
3. Check code comments for implementation details
4. Test in dev mode before building

---

**Good luck with your hackathon! 🚀**

You've got a fully functional, AI-powered learning platform ready to impress! 🎉
