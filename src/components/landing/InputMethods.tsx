import React, { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Image, Sparkles, Search } from 'lucide-react';
import { toast } from 'sonner';
import { TextPasteModal } from './TextPasteModal';

// Lazy load ImageUploadModal
const ImageUploadModal = lazy(() => import('./ImageUploadModal').then(module => ({ default: module.ImageUploadModal })));

interface InputMethodsProps {
  onTopicChange?: (topic: string) => void;
  topic?: string;
}

export const InputMethods: React.FC<InputMethodsProps> = ({ onTopicChange, topic = '' }) => {
  const [inputValue, setInputValue] = useState(topic);
  const [showTextPasteModal, setShowTextPasteModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onTopicChange?.(value);
  };

  const handleGenerateClick = () => {
    if (!inputValue.trim()) {
      toast.error('Please enter a topic to generate skill tree');
      return;
    }
    // Navigate to generator page instead of directly to skill tree
    navigate(`/generate?topic=${encodeURIComponent(inputValue)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerateClick();
    }
  };

  const handleDemoClick = () => {
    toast.success('Loading demo with all features!');
    navigate('/skill-tree/Web%20Development%20Fundamentals');
  };

  return (
    <>
      <div className="max-w-xl mx-auto space-y-4">
        {/* Search Input */}
        <div
          className="relative rounded-2xl transition-all duration-300"
          style={{
            boxShadow: isFocused
              ? '0 0 0 3px rgba(88, 204, 2, 0.15), 0 8px 32px rgba(0,0,0,0.2)'
              : '0 4px 16px rgba(0,0,0,0.12)',
          }}
        >
          <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search
              className="h-5 w-5 transition-colors duration-200"
              style={{ color: isFocused ? 'var(--duo-green)' : 'var(--duo-text-muted)' }}
            />
          </div>
          <input
            type="text"
            placeholder="What do you want to learn?"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full h-14 pl-13 pr-6 text-base font-bold rounded-2xl border-2 outline-none transition-all duration-200"
            style={{
              paddingLeft: '3.2rem',
              background: 'var(--duo-surface)',
              borderColor: isFocused ? 'var(--duo-green)' : 'var(--duo-border)',
              color: 'var(--duo-text)',
            }}
          />
        </div>

        {/* Primary CTA */}
        <button
          onClick={handleGenerateClick}
          className="btn-duo btn-duo-green w-full h-13 text-base tracking-wide"
          style={{ height: '3.25rem' }}
        >
          Start Learning
          <ArrowRight className="ml-2 h-4.5 w-4.5" />
        </button>

        {/* Secondary Actions — compact row */}
        <div className="flex gap-2.5">
          <button
            onClick={handleDemoClick}
            className="btn-duo btn-duo-outline flex-1 h-11 text-[13px]"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" style={{ color: 'var(--duo-gold)' }} />
            Try Demo
          </button>
          <button
            onClick={() => setShowImageUploadModal(true)}
            className="btn-duo btn-duo-outline flex-1 h-11 text-[13px]"
          >
            <Image className="mr-1.5 h-3.5 w-3.5" style={{ color: 'var(--duo-blue)' }} />
            Scan Textbook
          </button>
          <button
            onClick={() => setShowTextPasteModal(true)}
            className="btn-duo btn-duo-outline flex-1 h-11 text-[13px]"
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" style={{ color: 'var(--duo-purple)' }} />
            Paste Content
          </button>
        </div>
      </div>

      {/* Modals */}
      <TextPasteModal
        isOpen={showTextPasteModal}
        onClose={() => setShowTextPasteModal(false)}
      />
      {showImageUploadModal && (
        <Suspense fallback={null}>
          <ImageUploadModal
            isOpen={showImageUploadModal}
            onClose={() => setShowImageUploadModal(false)}
          />
        </Suspense>
      )}
    </>
  );
};
