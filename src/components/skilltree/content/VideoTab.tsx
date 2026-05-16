import React from 'react';
import { Play, Clock, FileText } from 'lucide-react';
import type { VideoContent } from '@/types/skilltree';

interface VideoTabProps {
  content: VideoContent;
}

export const VideoTab: React.FC<VideoTabProps> = ({ content }) => {
  const getEmbedUrl = () => {
    if (content.platform === 'youtube' && content.videoId) {
      return `https://www.youtube.com/embed/${content.videoId}`;
    }
    if (content.platform === 'vimeo' && content.videoId) {
      return `https://player.vimeo.com/video/${content.videoId}`;
    }
    return content.videoUrl;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <div className="relative rounded-2xl overflow-hidden glass border border-card-border aspect-video">
        <iframe
          src={getEmbedUrl()}
          title="Video lesson"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Video Info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {content.duration && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(content.duration)}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          <span className="capitalize">{content.platform}</span>
        </div>
      </div>

      {/* Summary */}
      {content.summary && (
        <div className="glass rounded-xl p-6 space-y-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Video Summary
          </h3>
          <p className="text-foreground/80 leading-relaxed">{content.summary}</p>
        </div>
      )}

      {/* Transcript */}
      {content.transcript && (
        <details className="glass rounded-xl p-6 space-y-3 group">
          <summary className="text-lg font-bold cursor-pointer flex items-center gap-2 hover:text-primary transition-colors">
            <FileText className="h-5 w-5" />
            Transcript
            <span className="ml-auto text-sm text-muted-foreground group-open:hidden">Click to expand</span>
          </summary>
          <div className="mt-4 text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {content.transcript}
          </div>
        </details>
      )}

      {/* Tips */}
      <div className="glass rounded-xl p-4 border-l-4 border-primary">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> Watch at 1.5x speed if you're familiar with the basics, or 0.75x if you need more time to absorb the concepts.
        </p>
      </div>
    </div>
  );
};
