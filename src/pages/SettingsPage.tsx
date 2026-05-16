import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Key, Download, Trash2, AlertCircle, CheckCircle2, Volume2, VolumeX, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/layouts/Navbar';
import { Footer } from '@/components/layouts/Footer';
import { DataManagement } from '@/components/settings/DataManagement';
import { restartOnboarding } from '@/components/onboarding/OnboardingTutorial';
import { downloadCompleteSourceCode } from '@/utils/sourceCodeDownload';
import { getSoundEnabled, setSoundEnabled, playButtonClick } from '@/utils/soundEffects';
import { resetClient } from '@/services/aiService';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [groqApiKey, setGroqApiKey] = useState('');
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(true);

  useEffect(() => {
    document.title = 'Pathfinder | Settings';
    
    // Load API key from localStorage
    const savedKey = localStorage.getItem('GROQ_API_KEY');
    if (savedKey) {
      setGroqApiKey(savedKey);
      setIsApiKeyValid(true);
    }
    
    // Load sound setting
    setSoundEnabledState(getSoundEnabled());
  }, []);

  const handleToggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabledState(newValue);
    setSoundEnabled(newValue);
    
    if (newValue) {
      playButtonClick();
      toast.success('Sound effects enabled');
    } else {
      toast.success('Sound effects disabled');
    }
  };

  const handleSaveApiKey = () => {
    if (!groqApiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    localStorage.setItem('GROQ_API_KEY', groqApiKey.trim());
    setIsApiKeyValid(true);
    
    // Reset the AI client to use the new key immediately
    resetClient();
    
    toast.success('API key saved successfully! Changes applied immediately.');
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('GROQ_API_KEY');
    setGroqApiKey('');
    setIsApiKeyValid(false);
    
    // Reset the AI client
    resetClient();
    
    toast.success('API key cleared');
  };

  const handleDownloadSourceCode = async () => {
    const loadingToast = toast.loading('Packaging complete source code... This may take a moment.');
    
    try {
      await downloadCompleteSourceCode();
      toast.dismiss(loadingToast);
      toast.success('Complete source code downloaded as ZIP! Check your downloads folder.');
    } catch (error) {
      console.error('Download error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to package source code. Please try again.');
    }
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all progress data? This cannot be undone.')) {
      localStorage.clear();
      toast.success('All data cleared');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-24 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold gradient-text mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure your Pathfinder experience</p>
        </div>

        <div className="space-y-6">
          {/* API Configuration */}
          <Card className="glass border-card-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Groq API Configuration
              </CardTitle>
              <CardDescription>
                Add your Groq API key to enable AI-powered skill tree generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Indicator */}
              <div className={`flex items-center gap-2 p-3 rounded-lg ${isApiKeyValid ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                {isApiKeyValid ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">API key configured</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">API key not configured</span>
                  </>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">How to get your Groq API key:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Visit <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.groq.com</a></li>
                  <li>Sign up or log in to your account</li>
                  <li>Go to API Keys section</li>
                  <li>Create a new API key</li>
                  <li>Copy and paste it below</li>
                </ol>
              </div>

              {/* API Key Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <Input
                  type="password"
                  placeholder="Enter your Groq API key"
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                  className="font-mono"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={handleSaveApiKey} className="flex-1">
                  Save API Key
                </Button>
                {isApiKeyValid && (
                  <Button onClick={handleClearApiKey} variant="outline">
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Onboarding Tutorial */}
          <Card className="glass border-card-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Tutorial
              </CardTitle>
              <CardDescription>
                Restart the interactive onboarding tutorial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                New to Pathfinder or want a refresher? Restart the tutorial to learn about key features, keyboard shortcuts, and how to get the most out of the platform.
              </p>
              <Button onClick={restartOnboarding} variant="outline" className="w-full">
                <GraduationCap className="mr-2 h-4 w-4" />
                Restart Tutorial
              </Button>
            </CardContent>
          </Card>

          {/* Sound Settings */}
          <Card className="glass border-card-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                Sound Effects
              </CardTitle>
              <CardDescription>
                Toggle audio feedback for quiz answers, level ups, and achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Enable Sound Effects</p>
                  <p className="text-xs text-muted-foreground">
                    Hear audio feedback when you complete quizzes, level up, and unlock achievements
                  </p>
                </div>
                <Button
                  onClick={handleToggleSound}
                  variant={soundEnabled ? "default" : "outline"}
                  size="sm"
                >
                  {soundEnabled ? 'ON' : 'OFF'}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                💡 All sounds are synthesized using Web Audio API - no audio files needed!
              </div>
            </CardContent>
          </Card>

          {/* Source Code Download */}
          <Card className="glass border-card-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Complete Source Code
              </CardTitle>
              <CardDescription>
                Download the entire Pathfinder source code as a ZIP file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-lg space-y-2 border border-primary/20">
                <p className="text-sm font-medium text-primary">✨ Full Source Code Package</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>All React components and pages</li>
                  <li>Complete TypeScript source files</li>
                  <li>Styles, utilities, and services</li>
                  <li>Configuration files (Vite, Tailwind, TypeScript)</li>
                  <li>package.json with all dependencies</li>
                  <li>.env template and README</li>
                </ul>
                <p className="text-sm text-primary mt-3">
                  🎉 Everything you need to run Pathfinder locally!
                </p>
              </div>
              <Button onClick={handleDownloadSourceCode} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Complete Source Code (ZIP)
              </Button>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="glass border-card-border">
            <CardContent className="pt-6">
              <DataManagement />
            </CardContent>
          </Card>

          {/* Danger Zone - Keep old clear all data */}
          <Card className="glass border-card-border border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions - proceed with caution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Clear all your progress data, API keys, and cached content. This action cannot be undone.
              </p>
              <Button onClick={handleClearAllData} variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SettingsPage;
