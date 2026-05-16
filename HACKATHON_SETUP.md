# 🚀 Pathfinder - Hackathon Setup Guide

## 📦 Complete Source Code Package

This package contains everything you need to run Pathfinder locally for your hackathon!

## 📋 What's Included

- ✅ All React components and pages
- ✅ Complete TypeScript source files
- ✅ Styles, utilities, and services
- ✅ Configuration files (Vite, Tailwind, TypeScript)
- ✅ package.json with all dependencies
- ✅ .env file with API keys and Supabase configuration
- ✅ README and documentation

## 🔧 Quick Setup (5 minutes)

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager
- Code editor (VS Code recommended)

### Step 1: Extract the ZIP
```bash
unzip pathfinder-source.zip
cd pathfinder
```

### Step 2: Install Dependencies
```bash
npm install
# or if you prefer pnpm
pnpm install
```

### Step 3: Environment Variables
The `.env` file is already included with all necessary API keys:

```env
# Groq API Keys (LLaMA) - Pre-configured for you!
VITE_GROQ_API_KEY_1=your_groq_key_1
VITE_GROQ_API_KEY_2=your_groq_key_2
VITE_GROQ_API_KEY_3=your_groq_key_3
VITE_GROQ_API_KEY_4=your_groq_key_4

# Gemini API Key (for AI chatbot)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration (Pre-configured!)
VITE_SUPABASE_URL=https://gtjlzwqgbdiphbcabdrc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0amx6d3FnYmRpcGhiY2FiZHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDM2ODgsImV4cCI6MjA5MjA3OTY4OH0.j2qc7oxfYTEwzGlpJYw7alrQiLtxN7qplj25MTz0Ryw
VITE_APP_ID=app-b1t1n3c22mf5
```

**Note:** If you want to use the AI chatbot feature, you'll need to add your own Gemini API key. Get one free at: https://makersuite.google.com/app/apikey

### Step 4: Run the Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173` 🎉

### Step 5: Build for Production (Optional)
```bash
npm run build
npm run preview
```

## 🌟 Key Features

### 1. AI-Powered Skill Tree Generation
- Uses Groq LLaMA models to generate personalized learning paths
- RPG-style skill tree interface with nodes and connections
- Multiple API keys for load balancing

### 2. Interactive Lessons
- Mermaid diagrams for visual learning
- Code examples with syntax highlighting
- Progress tracking

### 3. Quizzes & Assessments
- Multiple choice questions
- Instant feedback
- XP rewards system

### 4. Custom Practice Mode
- Create custom quizzes on any topic
- Adjustable difficulty levels
- Immediate results

### 5. AI Chatbot Assistant
- Powered by Google Gemini
- Context-aware help
- Learning support

### 6. User Authentication
- Supabase authentication
- Progress persistence
- User profiles

## 🔑 API Keys Explained

### Groq API Keys (4 keys)
We use multiple Groq API keys to distribute the load and preserve credits:
- **Key 1**: Skill tree generation
- **Key 2**: Lesson content generation
- **Key 3**: Quiz generation
- **Key 4**: Assessments & backup

All keys are pre-configured and ready to use!

### Supabase Configuration
The Supabase project is already set up with:
- User authentication tables
- Progress tracking
- Data persistence

**Database URL**: `https://gtjlzwqgbdiphbcabdrc.supabase.co`

## 📁 Project Structure

```
pathfinder/
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── layouts/     # Layout components
│   │   └── ...          # Feature components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
├── supabase/            # Supabase configuration
├── public/              # Static assets
├── .env                 # Environment variables (included!)
├── package.json         # Dependencies
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS config
└── tsconfig.json        # TypeScript config
```

## 🎮 How to Use Pathfinder

### 1. Create an Account
- Click "Sign Up" on the landing page
- Enter your email and password
- Verify your email (check spam folder)

### 2. Generate Your First Skill Tree
- Enter a topic (e.g., "Web Development", "Python Programming")
- Click "Generate Skill Tree"
- Wait for AI to create your personalized learning path

### 3. Start Learning
- Click on any skill node to unlock lessons
- Complete lessons to earn XP
- Take quizzes to test your knowledge

### 4. Track Your Progress
- View your XP and level in the header
- Check completed skills in your profile
- Monitor your learning journey

### 5. Use Custom Practice
- Click "Practice" in the navigation
- Enter any topic you want to practice
- Take unlimited custom quizzes

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill the process using port 5173
npx kill-port 5173
# Then run dev again
npm run dev
```

### Dependencies Installation Failed
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear build cache
rm -rf dist .vite
npm run build
```

### API Key Issues
- Make sure the `.env` file is in the root directory
- Restart the dev server after changing environment variables
- Check that all VITE_ prefixed variables are present

### Supabase Connection Issues
- Verify the Supabase URL and anon key in `.env`
- Check your internet connection
- Ensure Supabase project is active

## 🚀 Deployment Options

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify
1. Push code to GitHub
2. Import project in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables

### Manual Deployment
```bash
npm run build
# Upload the dist/ folder to your hosting provider
```

## 📊 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router v6
- **Build Tool**: Vite
- **AI Models**: 
  - Groq LLaMA (skill trees, lessons, quizzes)
  - Google Gemini (chatbot)
- **Backend**: Supabase
  - Authentication
  - PostgreSQL database
  - Real-time subscriptions
- **Diagrams**: Mermaid.js
- **Animations**: Canvas Confetti
- **Icons**: Lucide React

## 🎯 Hackathon Tips

### Demo Preparation
1. **Clear Browser Cache**: Before demo, clear cache and test fresh
2. **Prepare Sample Topics**: Have interesting topics ready to generate
3. **Show Key Features**: 
   - Skill tree generation (most impressive)
   - Interactive lessons with diagrams
   - Quiz system with XP rewards
   - Custom practice mode
4. **Highlight AI Integration**: Emphasize the multi-model AI approach

### Presentation Points
- ✨ **Innovation**: RPG-style gamified learning with AI
- 🎯 **Problem Solved**: Makes learning structured and engaging
- 🤖 **AI Integration**: Multiple AI models working together
- 📈 **Scalability**: Can generate learning paths for ANY topic
- 🎮 **User Experience**: Gamification increases engagement

### Common Demo Scenarios
1. **"Show me how it works"**
   - Generate a skill tree for "JavaScript"
   - Click a node to view lesson
   - Take a quiz and earn XP

2. **"What makes it unique?"**
   - AI-generated personalized learning paths
   - RPG-style progression system
   - Multi-model AI approach for efficiency

3. **"Can it handle any topic?"**
   - Generate trees for diverse topics:
     - Technical: "Machine Learning", "Blockchain"
     - Creative: "Digital Art", "Music Theory"
     - Professional: "Project Management", "Public Speaking"

## 📞 Support & Resources

### Documentation
- React: https://react.dev
- Vite: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com
- Supabase: https://supabase.com/docs

### API Documentation
- Groq: https://console.groq.com/docs
- Google Gemini: https://ai.google.dev/docs

### Getting Help
- Check the README.md for detailed feature documentation
- Review the code comments for implementation details
- Test in development mode before building for production

## 🎉 You're All Set!

Your Pathfinder app is ready to go! Good luck with your hackathon! 🚀

### Quick Start Checklist
- [ ] Extract ZIP file
- [ ] Run `npm install`
- [ ] Verify `.env` file exists
- [ ] Run `npm run dev`
- [ ] Open http://localhost:5173
- [ ] Create an account
- [ ] Generate your first skill tree
- [ ] Prepare your demo!

---

**Made with ❤️ for your hackathon success!**

For questions or issues, check the troubleshooting section above or review the source code comments.
