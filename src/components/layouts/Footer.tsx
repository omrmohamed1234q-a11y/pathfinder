import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Github, Twitter } from 'lucide-react';

const footerLinks = [
  {
    title: 'Learn',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Leaderboard', to: '/leaderboard' },
      { label: 'Achievements', to: '/achievements' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Friends', to: '/friends' },
      { label: 'Profile', to: '/profile' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My Progress', to: '/progress' },
      { label: 'Settings', to: '/settings' },
    ],
  },
];

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: '1.5px solid var(--duo-border)',
        background: 'rgba(19, 31, 36, 0.6)',
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2 font-black text-base">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: 'var(--duo-green)',
                  boxShadow: '0 2px 0 var(--duo-green-dark)',
                }}
              >
                <Compass className="h-3.5 w-3.5 text-white" />
              </div>
              <span style={{ color: 'var(--duo-green)' }}>Pathfinder</span>
            </div>
            <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--duo-text-muted)' }}>
              AI-powered skill trees for learning anything. Built for learners who want structured, engaging paths.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-3">
              <h4
                className="text-xs font-extrabold uppercase tracking-widest"
                style={{ color: 'var(--duo-text-muted)' }}
              >
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm font-semibold transition-colors duration-200"
                      style={{ color: 'var(--duo-text-muted)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--duo-text)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--duo-text-muted)'; }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid var(--duo-border)' }}
        >
          <p className="text-xs font-semibold" style={{ color: 'var(--duo-text-muted)' }}>
            © {new Date().getFullYear()} Pathfinder ·{' '}
            <span className="font-extrabold" style={{ color: 'var(--duo-green)' }}>#BuiltWithMeDo</span>
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200"
              style={{ color: 'var(--duo-text-muted)', border: '1.5px solid var(--duo-border)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--duo-text-muted)';
                e.currentTarget.style.color = 'var(--duo-text)';
                e.currentTarget.style.background = 'var(--duo-surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--duo-border)';
                e.currentTarget.style.color = 'var(--duo-text-muted)';
                e.currentTarget.style.background = 'transparent';
              }}
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200"
              style={{ color: 'var(--duo-text-muted)', border: '1.5px solid var(--duo-border)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--duo-text-muted)';
                e.currentTarget.style.color = 'var(--duo-text)';
                e.currentTarget.style.background = 'var(--duo-surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--duo-border)';
                e.currentTarget.style.color = 'var(--duo-text-muted)';
                e.currentTarget.style.background = 'transparent';
              }}
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
