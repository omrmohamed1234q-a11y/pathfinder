import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Flame, BookOpen, Sparkles, ArrowRight, Users, GraduationCap, Star } from 'lucide-react';
import { getStreakData, getCompletedTopics } from '@/utils/progressStorage';

const ROTATING_TOPICS = [
  'Python',
  'Guitar',
  'Machine Learning',
  'Cooking',
  'Chess',
  'Finance',
  'Cybersecurity',
  'Photography',
  'Data Science',
  'Japanese',
];

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [topicsCount, setTopicsCount] = useState(0);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const streakData = getStreakData();
    setStreak(streakData.currentStreak);
    getCompletedTopics().then(t => setTopicsCount(t.length));

    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Rotate topic every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTopicIndex(prev => (prev + 1) % ROTATING_TOPICS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentTopic = ROTATING_TOPICS[currentTopicIndex];

  return (
    <div
      className={`text-center space-y-10 mb-4 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Streak badge — only shown when active */}
      {streak > 0 && (
        <div className="flex justify-center">
          <div
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-extrabold animate-pulse-slow"
            style={{
              background: 'rgba(255, 150, 0, 0.1)',
              color: 'var(--duo-orange)',
              border: '1.5px solid rgba(255, 150, 0, 0.2)',
            }}
          >
            <Flame className="h-4 w-4" />
            {streak} day streak
          </div>
        </div>
      )}

      {/* Main Heading */}
      <div className="space-y-5">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider animate-fade-in-up"
            style={{
              background: 'rgba(88, 204, 2, 0.08)',
              border: '1.5px solid rgba(88, 204, 2, 0.2)',
              color: 'var(--duo-green)',
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Learning Platform
            <Sparkles className="h-3.5 w-3.5" />
          </div>
        </div>

        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08]"
          style={{ color: 'var(--duo-text)' }}
        >
          Learn{' '}
          <span
            key={currentTopic}
            className="inline-block hero-topic-rotate gradient-text"
          >
            {currentTopic}
          </span>
          <br />
          <span style={{ color: 'var(--duo-text-muted)', fontSize: '0.65em', fontWeight: 800 }}>
            the smart way.
          </span>
        </h1>
        <p
          className="text-lg md:text-xl font-semibold max-w-lg mx-auto leading-relaxed"
          style={{ color: 'var(--duo-text-muted)' }}
        >
          AI generates a complete skill tree for any topic.
          <br className="hidden sm:block" />
          Master it node by node with <span style={{ color: 'var(--duo-green)' }}>lessons</span>, <span style={{ color: 'var(--duo-blue)' }}>quizzes</span>, and <span style={{ color: 'var(--duo-purple)' }}>projects</span>.
        </p>

        {/* CTA Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/generate')}
            className="group relative px-8 py-4 rounded-2xl text-lg font-black transition-all duration-300 hover:scale-105 active:scale-95 button-shimmer"
            style={{
              background: 'linear-gradient(135deg, var(--duo-green) 0%, var(--duo-blue) 100%)',
              color: 'white',
              boxShadow: '0 8px 24px rgba(88, 204, 2, 0.3), 0 4px 0 var(--duo-green-dark)',
            }}
          >
            <span className="flex items-center gap-3">
              <Sparkles className="h-6 w-6" />
              Generate Your Skill Tree
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <button
            onClick={() => navigate('/skill-tree/Web%20Development%20Fundamentals')}
            className="btn-duo btn-duo-outline px-6 py-3.5 text-sm"
          >
            <Star className="mr-2 h-4 w-4" style={{ color: 'var(--duo-gold)' }} />
            Try Live Demo
          </button>
        </div>
      </div>


      {/* Stats strip */}
      {(topicsCount > 0 || streak > 0) && (
        <div
          className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl mx-auto"
          style={{
            background: 'var(--duo-surface)',
            border: '1.5px solid var(--duo-border)',
          }}
        >
          {topicsCount > 0 && (
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--duo-text-muted)' }}>
              <BookOpen className="h-4 w-4" style={{ color: 'var(--duo-green)' }} />
              <span style={{ color: 'var(--duo-text)' }}>{topicsCount}</span> topics explored
            </div>
          )}
          {topicsCount > 0 && streak > 0 && (
            <div className="w-px h-4" style={{ background: 'var(--duo-border)' }} />
          )}
          {streak > 0 && (
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--duo-text-muted)' }}>
              <Zap className="h-4 w-4" style={{ color: 'var(--duo-gold)' }} />
              <span style={{ color: 'var(--duo-text)' }}>{streak}</span> day streak
            </div>
          )}
        </div>
      )}
    </div>
  );
};
