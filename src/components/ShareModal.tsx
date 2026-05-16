import React, { useState } from 'react';
import { X, Copy, Check, Share2, Twitter, Facebook, Linkedin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  shareUrl: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, topic, shareUrl }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (platform: string) => {
    const text = `Check out this ${topic} skill tree on Pathfinder!`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(shareUrl);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="glass-strong rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-card-border animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Share2 className="h-5 w-5 text-background" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Share Skill Tree</h2>
              <p className="text-sm text-muted-foreground">{topic}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="glass rounded-full p-2 hover:bg-destructive/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="glass rounded-2xl p-4">
            <QRCodeDataUrl text={shareUrl} width={180} />
          </div>
        </div>

        {/* Copy Link */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Share Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 glass rounded-xl px-4 py-2 text-sm font-mono"
            />
            <Button
              onClick={handleCopyLink}
              className={`${copied ? 'bg-green-500 hover:bg-green-600' : ''}`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div>
          <label className="text-sm font-medium mb-3 block">Share on Social Media</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShare('twitter')}
              className="glass rounded-xl px-4 py-3 flex items-center gap-3 hover:border-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-all"
            >
              <Twitter className="h-5 w-5 text-[#1DA1F2]" />
              <span className="font-medium">Twitter</span>
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="glass rounded-xl px-4 py-3 flex items-center gap-3 hover:border-[#1877F2] hover:bg-[#1877F2]/10 transition-all"
            >
              <Facebook className="h-5 w-5 text-[#1877F2]" />
              <span className="font-medium">Facebook</span>
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="glass rounded-xl px-4 py-3 flex items-center gap-3 hover:border-[#0A66C2] hover:bg-[#0A66C2]/10 transition-all"
            >
              <Linkedin className="h-5 w-5 text-[#0A66C2]" />
              <span className="font-medium">LinkedIn</span>
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="glass rounded-xl px-4 py-3 flex items-center gap-3 hover:border-[#25D366] hover:bg-[#25D366]/10 transition-all"
            >
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
              <span className="font-medium">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
