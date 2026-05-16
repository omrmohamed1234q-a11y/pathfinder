import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { OnboardingTutorial } from '@/components/onboarding/OnboardingTutorial';
import { DiagnosticPanel } from '@/components/DiagnosticPanel';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { initAudioContext } from '@/utils/soundEffects';
import '@/utils/initGroqKeys'; // Initialize Groq API keys in localStorage

import { routes } from './routes';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize audio context on first user interaction
    const initAudio = () => {
      initAudioContext();
      // Remove listeners after first interaction
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
    
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
    
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <TooltipProvider>
          <Router>
            <IntersectObserver />
            <OnboardingTutorial />
            <DiagnosticPanel />
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">
                <Routes>
                {routes.map((route, index) => (
                  <Route
                    key={index}
                    path={route.path}
                    element={route.element}
                  />
                ))}
                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
            <Toaster />
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
