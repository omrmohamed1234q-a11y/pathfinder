import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight, Sparkles, BookOpen, Video, Loader2, Lock } from 'lucide-react';
import { MermaidDiagram } from '@/components/ui/mermaid-diagram';
import { VoiceControls } from './VoiceControls';
import { generateLessonVideo, pollVideoStatus } from '@/services/videoService';
import { canPerformAction } from '@/services/stripeService';
import { toast } from 'sonner';
import type { GeneratedLesson } from '@/services/aiService';

interface LessonTabProps {
  lessonData: GeneratedLesson;
  onTakeQuiz: () => void;
  lessonId?: string;
  videoUrl?: string;
}

export const LessonTab: React.FC<LessonTabProps> = ({ lessonData, onTakeQuiz, lessonId, videoUrl: initialVideoUrl }) => {
  // lessonData is the LessonContent object directly
  const lesson = lessonData;
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl || null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // Ensure core_content exists
  if (!lesson || !lesson.core_content) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No lesson content available.</p>
        </div>
      </div>
    );
  }

  const handleGenerateVideo = async () => {
    if (!lessonId) {
      toast.error('Lesson ID is required to generate video');
      return;
    }

    // Check if user has permission (with error handling)
    try {
      const { allowed, reason } = await canPerformAction('user-id', 'generate_video');
      if (!allowed) {
        toast.error(reason || 'You need a Premium subscription to generate videos');
        return;
      }
    } catch (error) {
      console.warn('Permission check failed:', error);
      toast.error('Unable to verify subscription. Please try again later.');
      return;
    }

    setIsGeneratingVideo(true);
    setVideoProgress(0);

    try {
      const result = await generateLessonVideo(
        lesson.introduction || 'Lesson',
        lesson.core_content
      );

      toast.info('Video generation started. This may take 2-5 minutes...');

      const finalResult = await pollVideoStatus(
        result.taskId,
        (status, progress) => {
          setVideoProgress(progress || 0);
          if (status === 'processing') {
            toast.info(`Generating video: ${Math.round(progress || 0)}%`);
          }
        }
      );

      if (finalResult.videoUrl) {
        setVideoUrl(finalResult.videoUrl);
        toast.success('Video generated successfully!');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate video');
    } finally {
      setIsGeneratingVideo(false);
      setVideoProgress(0);
    }
  };

  // Extract Mermaid diagrams from content
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  const diagrams: string[] = [];
  let match;
  
  while ((match = mermaidRegex.exec(lesson.core_content)) !== null) {
    diagrams.push(match[1].trim());
  }
  
  // Remove mermaid blocks from content for display
  const contentWithoutMermaid = lesson.core_content.replace(mermaidRegex, '');

  return (
    <div className="space-y-6">
      {/* Video Section */}
      {videoUrl ? (
        <div className="rounded-xl overflow-hidden bg-muted">
          <video
            src={videoUrl}
            controls
            className="w-full aspect-video"
            poster="/video-poster.jpg"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div className="glass-strong rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-bold text-foreground">AI-Generated Video Lesson</h3>
                <p className="text-sm text-muted-foreground">
                  Watch a personalized video explanation (Premium feature)
                </p>
              </div>
            </div>
            <Button
              disabled={true}
              variant="outline"
              className="opacity-80"
              size="sm"
            >
              <Lock className="h-4 w-4 mr-2" />
              Coming Soon
            </Button>
          </div>
        </div>
      )}

      {/* Voice Controls */}
      <VoiceControls 
        text={`${lesson.introduction}. ${contentWithoutMermaid}. ${lesson.key_takeaway}`}
      />

      {/* Introduction */}
      <div className="glass-strong rounded-xl p-5 border-l-4 border-primary hover-scale transition-all duration-300">
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          {lesson.introduction}
        </div>
      </div>

      {/* Core Content */}
      <div className="prose prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
        {contentWithoutMermaid}
      </div>

      {/* Mermaid Diagrams */}
      {diagrams.map((diagram, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Diagram {index + 1}</span>
          </div>
          <MermaidDiagram chart={diagram} />
        </div>
      ))}

      {/* Code Example */}
      {lesson.code_example && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-4 py-2 glass rounded-t-xl">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-muted-foreground ml-2">Example</span>
          </div>
          <pre className="glass rounded-b-xl p-4 overflow-x-auto text-sm">
            <code>{lesson.code_example}</code>
          </pre>
        </div>
      )}

      {/* Fun Fact */}
      {lesson.fun_fact && (
        <div className="glass rounded-xl p-5 hover-scale transition-all duration-300">
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0">
              <Sparkles className="h-6 w-6 text-secondary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-secondary">🤯 Fun Fact</h4>
              <p className="text-foreground/80">{lesson.fun_fact}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Takeaway */}
      <div className="glass-strong rounded-xl p-5 border-l-4 border-secondary hover-scale transition-all duration-300">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">
            <Lightbulb className="h-6 w-6 text-secondary" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-secondary">💡 Key Takeaway</h4>
            <p className="text-foreground font-medium">{lesson.key_takeaway}</p>
          </div>
        </div>
      </div>

      {/* Quiz Button */}
      <div className="pt-4">
        <Button onClick={onTakeQuiz} size="lg" className="w-full text-lg py-6 button-shimmer">
          Ready? Take the Quiz
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
