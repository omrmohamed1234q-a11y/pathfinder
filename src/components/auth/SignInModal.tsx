import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Zap, Trophy, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ open, onOpenChange }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }

      if (!agreedToTerms) {
        toast.error('Please agree to the Terms of Service and Privacy Policy');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          toast.error(error.message || 'Failed to sign in');
        } else {
          toast.success('Signed in successfully!');
          onOpenChange(false);
        }
      } else {
        const { error } = await signUpWithEmail(email, password);
        if (error) {
          toast.error(error.message || 'Failed to sign up');
        } else {
          toast.success('Account created successfully!');
          onOpenChange(false);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Redirecting to Google...');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center" style={{ color: 'var(--duo-text)' }}>
            <Sparkles className="inline-block h-6 w-6 mr-2" style={{ color: 'var(--duo-green)' }} />
            {mode === 'signin' ? 'Welcome Back!' : 'Create Your Account'}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {mode === 'signin' 
              ? 'Sign in to access unlimited skill trees and save your progress'
              : 'Sign up to generate unlimited trees and track your learning journey'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold" style={{ color: 'var(--duo-text)' }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--duo-text-muted)' }} />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold" style={{ color: 'var(--duo-text)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--duo-text-muted)' }} />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold" style={{ color: 'var(--duo-text)' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--duo-text-muted)' }} />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-xs leading-tight" style={{ color: 'var(--duo-text-muted)' }}>
                    I agree to the Terms of Service and Privacy Policy. 
                    <span className="block mt-1 text-[10px]">
                      (Please review and modify these documents to comply with legal requirements)
                    </span>
                  </label>
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-base font-extrabold rounded-xl"
              style={{
                background: 'var(--duo-green)',
                color: 'white',
              }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                mode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--duo-border)' }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2" style={{ background: 'var(--duo-bg)', color: 'var(--duo-text-muted)' }}>
                OR
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            disabled={true}
            variant="outline"
            className="w-full h-11 text-base font-extrabold rounded-xl opacity-80"
          >
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5" style={{ color: 'var(--duo-text-muted)' }} />
              <span style={{ color: 'var(--duo-text-muted)' }}>Continue with Google (Coming Soon)</span>
            </div>
          </Button>

          {/* Toggle Mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-sm font-bold hover:underline"
              style={{ color: 'var(--duo-green)' }}
            >
              {mode === 'signin' 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
