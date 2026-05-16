import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Trophy, Award, Users, ShoppingBag, Menu, X, Crown, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { GlobalSearch } from '@/components/GlobalSearch';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleSwitchMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
  };

  const navItems: Array<{to: string, icon: any, label: string}> = [];

  if (user) {
    navItems.push(
      { to: '/progress', icon: Trophy, label: 'Progress' },
      { to: '/achievements', icon: Award, label: 'Achievements' },
      { to: '/leaderboard', icon: Users, label: 'Leaderboard' },
      { to: '/pricing', icon: Crown, label: 'Pricing' },
      { to: '/settings', icon: Settings, label: 'Settings' }
    );
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(19, 31, 36, 0.92)' : 'var(--duo-bg)',
          backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
          borderBottom: `1.5px solid ${scrolled ? 'rgba(55, 86, 95, 0.6)' : 'var(--duo-border)'}`,
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-6 h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-black text-base group shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-105"
              style={{
                background: 'var(--duo-green)',
                boxShadow: '0 2px 0 var(--duo-green-dark)',
              }}
            >
              <Compass className="h-4.5 w-4.5 text-white" />
            </div>
            <span style={{ color: 'var(--duo-green)' }}>Pathfinder</span>
          </Link>

          {/* Center Nav — Desktop */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-extrabold transition-all duration-200"
                  style={{
                    color: active ? 'var(--duo-green)' : 'var(--duo-text-muted)',
                    background: active ? 'rgba(88, 204, 2, 0.08)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = 'var(--duo-text)';
                      e.currentTarget.style.background = 'var(--duo-surface)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = 'var(--duo-text-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            <GlobalSearch />

            {!user && (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/pricing"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-extrabold uppercase tracking-wide transition-all duration-200"
                  style={{ color: 'var(--duo-text-muted)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--duo-text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--duo-text-muted)';
                  }}
                >
                  <Crown className="h-4 w-4" />
                  Pricing
                </Link>
                <div className="w-px h-4 mx-1" style={{ background: 'var(--duo-border)' }} />
                <button
                  onClick={() => handleAuthClick('signin')}
                  className="px-4 py-1.5 text-[13px] font-extrabold uppercase tracking-wide rounded-xl transition-all duration-200"
                  style={{
                    color: 'var(--duo-text-muted)',
                    border: '1.5px solid var(--duo-border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--duo-text-muted)';
                    e.currentTarget.style.background = 'var(--duo-surface)';
                    e.currentTarget.style.color = 'var(--duo-text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--duo-border)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--duo-text-muted)';
                  }}
                >
                  Log In
                </button>
                <button
                  onClick={() => handleAuthClick('signup')}
                  className="btn-duo btn-duo-green px-4 py-1.5 text-[13px]"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                color: 'var(--duo-text-muted)',
                border: '1.5px solid var(--duo-border)',
              }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileOpen && (
          <div
            className="md:hidden border-t px-4 pb-4 pt-2 space-y-1 animate-scale-in"
            style={{
              background: 'var(--duo-bg)',
              borderColor: 'var(--duo-border)',
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-extrabold transition-colors"
                  style={{
                    color: active ? 'var(--duo-green)' : 'var(--duo-text-muted)',
                    background: active ? 'rgba(88, 204, 2, 0.08)' : 'transparent',
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
            {!user && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleAuthClick('signin')}
                  className="btn-duo btn-duo-outline flex-1 py-2.5 text-sm"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleAuthClick('signup')}
                  className="btn-duo btn-duo-green flex-1 py-2.5 text-sm"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSwitchMode={handleSwitchMode}
      />
    </>
  );
};
