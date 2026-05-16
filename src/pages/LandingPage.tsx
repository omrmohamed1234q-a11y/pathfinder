import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layouts/Navbar';
import { Footer } from '@/components/layouts/Footer';
import { AnimatedBackground } from '@/components/landing/AnimatedBackground';
import { Hero } from '@/components/landing/Hero';
import { InputMethods } from '@/components/landing/InputMethods';
import { SuggestionChips } from '@/components/landing/SuggestionChips';
import { DailyChallengeBanner } from '@/components/landing/DailyChallengeBanner';
import { CareerPathsSection } from '@/components/landing/CareerPathsSection';
import { SmartRecommendations } from '@/components/landing/SmartRecommendations';
import { AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAchievements } from '@/utils/progressStorage';
import { debugStorageState } from '@/utils/debugStorage';
import { useAuth } from '@/contexts/AuthContext';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [showApiWarning, setShowApiWarning] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Pathfinder — Learn Anything with AI Skill Trees';
    
    if (import.meta.env.DEV) {
      debugStorageState();
    }
    
    const hasApiKey = localStorage.getItem('GROQ_API_KEY') || import.meta.env.VITE_GROQ_API_KEY;
    setShowApiWarning(!hasApiKey);

    const achievements = getAchievements();
    const recent = achievements.find(a => a.unlockedAt && Date.now() - a.unlockedAt < 10000);
    if (recent) {
      setNewAchievement(`${recent.icon} ${recent.title} unlocked!`);
      setTimeout(() => setNewAchievement(null), 4000);
    }
  }, []);

  const handleChipClick = (selectedTopic: string) => {
    setTopic(selectedTopic);
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--duo-bg)' }}>
      <AnimatedBackground />

      <div className="relative z-10 flex-1 flex flex-col">
        <Navbar />

        {/* Achievement Toast */}
        {newAchievement && (
          <div className="fixed top-20 right-6 z-50 animate-pop-in">
            <div
              className="px-5 py-2.5 rounded-xl text-sm font-extrabold"
              style={{
                background: 'var(--duo-surface)',
                border: '1.5px solid var(--duo-gold)',
                color: 'var(--duo-gold)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              {newAchievement}
            </div>
          </div>
        )}

        {/* API Warning */}
        {showApiWarning && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-pop-in">
            <div
              className="rounded-xl p-4 space-y-2.5"
              style={{
                background: 'var(--duo-surface)',
                border: '1.5px solid rgba(255, 150, 0, 0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--duo-orange)' }} />
                <div className="flex-1 space-y-2">
                  <h3 className="text-sm font-extrabold" style={{ color: 'var(--duo-orange)' }}>API Key Required</h3>
                  <p className="text-xs font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
                    Configure your free Groq API key to use AI features.
                  </p>
                  <button 
                    onClick={() => navigate('/settings')} 
                    className="btn-duo text-xs px-3.5 py-1.5 rounded-lg font-extrabold"
                    style={{ 
                      background: 'var(--duo-orange)',
                      color: 'white',
                      boxShadow: '0 2px 0 #CE7500',
                    }}
                  >
                    Configure
                  </button>
                </div>
                <button 
                  onClick={() => setShowApiWarning(false)} 
                  className="text-xs font-bold px-1"
                  style={{ color: 'var(--duo-text-muted)' }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <main className="flex-1 px-6">
          <div className="max-w-4xl mx-auto pt-12 pb-8 space-y-10">
            <Hero />
            <InputMethods topic={topic} onTopicChange={setTopic} />
            <SuggestionChips onChipClick={handleChipClick} />
          </div>

          {/* Content Sections - only show if logged in to avoid boring static content for guests */}
          {user && (
            <div className="max-w-5xl mx-auto pb-12 space-y-16">
              <DailyChallengeBanner />
              <CareerPathsSection />
              <SmartRecommendations />
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
