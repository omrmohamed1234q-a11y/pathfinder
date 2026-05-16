import { supabase } from '@/lib/supabase';

export interface VideoGenerationResult {
  taskId: string;
  status: 'submitted' | 'processing' | 'succeed' | 'failed';
  videoUrl?: string;
  watermarkUrl?: string;
  duration?: string;
  statusMessage?: string;
}

/**
 * Generate a video for a lesson
 */
export async function generateLessonVideo(
  lessonTitle: string,
  lessonContent?: string,
  duration: string = '5',
  aspectRatio: string = '16:9'
): Promise<VideoGenerationResult> {
  const prompt = lessonContent
    ? `Create an educational video explaining "${lessonTitle}". Key points: ${lessonContent.substring(0, 500)}. The video should be clear, engaging, and visually demonstrate the key concepts. Use professional animations and smooth transitions.`
    : undefined;

  const { data, error } = await supabase.functions.invoke('generate-lesson-video', {
    body: {
      prompt,
      lessonTitle,
      duration,
      aspectRatio,
    },
  });

  if (error) {
    console.error('Error generating lesson video:', error);
    throw new Error(error.message || 'Failed to generate lesson video');
  }

  return data;
}

/**
 * Check the status of a video generation task
 */
export async function checkVideoStatus(taskId: string): Promise<VideoGenerationResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(
    `${supabaseUrl}/functions/v1/check-video-status?taskId=${taskId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to check video status');
  }

  return await response.json();
}

/**
 * Poll video status until completion or timeout
 */
export async function pollVideoStatus(
  taskId: string,
  onProgress?: (status: string, progress?: number) => void,
  maxAttempts: number = 60,
  intervalMs: number = 5000
): Promise<VideoGenerationResult> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await checkVideoStatus(taskId);

    if (onProgress) {
      const progress = Math.min(95, (attempt / maxAttempts) * 100);
      onProgress(result.status, progress);
    }

    if (result.status === 'succeed') {
      if (onProgress) {
        onProgress('succeed', 100);
      }
      return result;
    }

    if (result.status === 'failed') {
      throw new Error(result.statusMessage || 'Video generation failed');
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error('Video generation timed out after 5 minutes');
}

/**
 * Save video URL to lesson in database
 */
export async function saveVideoToLesson(
  lessonId: string,
  videoUrl: string,
  taskId: string
): Promise<void> {
  const { error } = await supabase
    .from('lessons')
    .update({
      video_url: videoUrl,
      video_task_id: taskId,
      video_status: 'completed',
    })
    .eq('id', lessonId);

  if (error) {
    console.error('Error saving video to lesson:', error);
    throw error;
  }
}

/**
 * Get video for a lesson
 */
export async function getLessonVideo(lessonId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('video_url, video_status')
    .eq('id', lessonId)
    .maybeSingle();

  if (error) {
    console.error('Error getting lesson video:', error);
    return null;
  }

  if (data?.video_status === 'completed' && data.video_url) {
    return data.video_url;
  }

  return null;
}
