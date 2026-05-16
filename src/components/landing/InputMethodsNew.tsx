import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface InputMethodsNewProps {
  topic: string;
  onTopicChange: (topic: string) => void;
}

/**
 * Professional search input with micro-interactions.
 * 
 * Design improvements:
 * - Auto-focus on mount
 * - Clear visual feedback
 * - Smooth transitions
 * - Professional placeholder animation
 * - Keyboard shortcuts
 */
export const InputMethodsNew: React.FC<InputMethodsNewProps> = ({ topic, onTopicChange }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    'React Hooks',
    'Machine Learning',
    'Spanish Grammar',
    'Piano Chords',
    'Digital Marketing',
    'Python Basics',
  ];

  useEffect(() => {
    // Auto-focus on mount
    inputRef.current?.focus();

    // Rotate placeholders
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    
    // Simulate brief loading for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    navigate(`/skill-tree/${encodeURIComponent(topic.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + K to focus
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '48rem', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        {/* Main Input Container */}
        <div
          style={{
            position: 'relative',
            background: 'var(--duo-surface)',
            borderRadius: '1.25rem',
            border: `3px solid ${isFocused ? 'var(--duo-green)' : 'var(--duo-border)'}`,
            boxShadow: isFocused 
              ? '0 0 0 4px rgba(88, 204, 2, 0.1), 0 8px 32px rgba(0,0,0,0.12)' 
              : '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isFocused ? 'translateY(-2px)' : 'translateY(0)',
          }}
        >
          {/* Search Icon */}
          <div
            style={{
              position: 'absolute',
              left: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? (
              <Loader2 
                style={{ width: '24px', height: '24px', color: 'var(--duo-green)' }} 
                className="animate-spin"
              />
            ) : (
              <Search 
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  color: isFocused ? 'var(--duo-green)' : 'var(--duo-text-muted)',
                  transition: 'color 0.2s',
                }} 
              />
            )}
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[placeholderIndex]}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1.5rem 10rem 1.5rem 4rem',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--duo-text)',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            className="placeholder:text-duo-text-muted placeholder:font-normal"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!topic.trim() || isLoading}
            className="btn-duo btn-duo-green"
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '0.875rem 2rem',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: topic.trim() ? 1 : 0.5,
              pointerEvents: topic.trim() ? 'auto' : 'none',
              transition: 'opacity 0.2s',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 style={{ width: '18px', height: '18px' }} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles style={{ width: '18px', height: '18px' }} />
                Generate
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </>
            )}
          </button>
        </div>

        {/* Helper Text */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginTop: '1rem',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: 'var(--duo-text-muted)', fontWeight: 500 }}>
            Type any topic and press Enter to start learning
          </p>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.375rem',
              fontSize: '0.75rem',
              color: 'var(--duo-text-muted)',
              fontWeight: 600,
            }}
          >
            <kbd style={{ 
              padding: '0.25rem 0.5rem', 
              borderRadius: '0.375rem', 
              background: 'var(--duo-surface)',
              border: '1px solid var(--duo-border)',
              fontFamily: 'monospace',
            }}>
              ⌘K
            </kbd>
            <span>to focus</span>
          </div>
        </div>
      </form>
    </div>
  );
};
