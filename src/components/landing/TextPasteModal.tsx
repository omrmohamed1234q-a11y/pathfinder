import React, { useState } from 'react';
import { X, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TextPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TextPasteModal: React.FC<TextPasteModalProps> = ({ isOpen, onClose }) => {
  const [pastedText, setPastedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!pastedText.trim()) return;

    setIsGenerating(true);
    
    // Navigate to skill tree page with the pasted text as topic
    // The skill tree generation will use ERNIE to analyze the content
    const encodedText = encodeURIComponent(pastedText.trim());
    navigate(`/skill-tree/${encodedText}?source=scan`);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="glass rounded-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-card-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Paste Textbook Content</h2>
              <p className="text-sm text-muted-foreground">
                Copy and paste text from your textbook or study material
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-accent rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Textarea */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Textbook Content
            </label>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your textbook content here... The AI will analyze it and create a skill tree covering the key concepts."
              className="w-full h-64 px-4 py-3 glass rounded-xl border border-card-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Character count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{pastedText.length} characters</span>
            {pastedText.length > 0 && (
              <span className="text-primary">✓ Ready to generate</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!pastedText.trim() || isGenerating}
              className="flex-1 text-base font-semibold"
              style={{
                background: pastedText.trim()
                  ? 'linear-gradient(135deg, hsl(190, 100%, 50%), hsl(258, 90%, 66%))'
                  : undefined,
                boxShadow: pastedText.trim() ? '0 0 20px rgba(0, 212, 255, 0.2)' : undefined,
              }}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Skill Tree
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
