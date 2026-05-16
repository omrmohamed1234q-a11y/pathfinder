import React, { useState } from 'react';
import { X, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onSwitchMode: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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

    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          toast.error(error.message || 'Failed to sign in');
        } else {
          toast.success('Signed in successfully!');
          onClose();
        }
      } else {
        const { error } = await signUpWithEmail(email, password);
        if (error) {
          toast.error(error.message || 'Failed to sign up');
        } else {
          toast.success('Account created successfully!');
          onClose();
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Redirecting to Google...');
      onClose();
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={{
          background: 'var(--duo-bg)',
          border: '1.5px solid var(--duo-border)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-black/10"
          style={{ color: 'var(--duo-text-muted)' }}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--duo-text)' }}>
            {mode === 'signin' ? 'Welcome Back!' : 'Create Your Account'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--duo-text-muted)' }}>
            {mode === 'signin' 
              ? 'Sign in to continue your learning journey'
              : 'Join Pathfinder to start learning'
            }
          </p>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4 mb-4">
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
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-base font-extrabold rounded-xl"
            style={{
              background: 'var(--duo-green)',
              color: 'white',
            }}
          >
            {loading ? (
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
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--duo-border)' }} />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2" style={{ background: 'var(--duo-bg)', color: 'var(--duo-text-muted)' }}>
              OR
            </span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <Button
          disabled={true}
          variant="outline"
          className="w-full h-11 text-base font-extrabold rounded-xl mb-4 opacity-80"
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
            onClick={onSwitchMode}
            className="text-sm font-bold hover:underline"
            style={{ color: 'var(--duo-green)' }}
          >
            {mode === 'signin' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'
            }
          </button>
        </div>

        {/* Privacy Note */}
        <p className="text-xs text-center mt-4" style={{ color: 'var(--duo-text-muted)' }}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
