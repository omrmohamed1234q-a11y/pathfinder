import { generateImagePrompt } from './geminiService';

export interface ImageGenerationResult {
  taskId: string;
  status: 'submitted' | 'processing' | 'succeed' | 'failed';
  imageUrl?: string;
  watermarkUrl?: string;
  statusMessage?: string;
}

/**
 * Generate an image for a skill node using Gemini for the prompt and Pollinations AI for rendering
 */
export async function generateNodeImage(
  nodeTitle: string,
  nodeDescription?: string,
  aspectRatio: string = '1:1'
): Promise<ImageGenerationResult> {
  try {
    // 1. Use Gemini to generate a highly optimized visual prompt
    let optimizedPrompt = nodeTitle;
    try {
      optimizedPrompt = await generateImagePrompt(nodeTitle, nodeDescription);
    } catch (e) {
      console.warn("Failed to generate optimized prompt via Gemini, falling back to title", e);
      optimizedPrompt = `Professional, minimalist icon illustration for ${nodeTitle}. Clean, modern, educational style. No text.`;
    }

    // 2. Use Pollinations AI for instant, free image generation (no API key needed)
    // Add seed to prevent caching if needed, but for identical prompts we want caching
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(optimizedPrompt)}?width=400&height=400&nologo=true&seed=${seed}`;

    // Return instant success since Pollinations AI generates synchronously via the image URL
    return {
      taskId: `pollinations-${Date.now()}`,
      status: 'succeed',
      imageUrl: imageUrl,
    };
  } catch (error: any) {
    console.error('Error generating node image:', error);
    throw new Error(error.message || 'Failed to generate node image');
  }
}

/**
 * Check the status of an image generation task
 * (Since we use Pollinations, it's always succeed immediately)
 */
export async function checkImageStatus(taskId: string): Promise<ImageGenerationResult> {
  return {
    taskId,
    status: 'succeed'
  };
}

/**
 * Poll image status until completion or timeout
 * (Since we use Pollinations, we return immediately)
 */
export async function pollImageStatus(
  taskId: string,
  onProgress?: (status: string) => void,
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<ImageGenerationResult> {
  if (onProgress) {
    onProgress('succeed');
  }
  
  return {
    taskId,
    status: 'succeed'
  };
}

/**
 * Generate images for all nodes in a skill tree
 */
export async function generateImagesForSkillTree(
  treeId: string,
  nodes: Array<{ id: number; title: string; description?: string }>,
  onNodeProgress?: (nodeId: number, status: string, imageUrl?: string) => void
): Promise<void> {
  // Generate images in batches to avoid rate limits
  const batchSize = 3;
  
  for (let i = 0; i < nodes.length; i += batchSize) {
    const batch = nodes.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (node) => {
        try {
          if (onNodeProgress) {
            onNodeProgress(node.id, 'generating', undefined);
          }

          const result = await generateNodeImage(node.title, node.description);
          
          if (onNodeProgress && result.imageUrl) {
            onNodeProgress(node.id, 'completed', result.imageUrl);
          }
        } catch (error) {
          console.error(`Failed to generate image for node ${node.id}:`, error);
          if (onNodeProgress) {
            onNodeProgress(node.id, 'failed', undefined);
          }
        }
      })
    );

    // Wait between batches to be nice to Pollinations AI
    if (i + batchSize < nodes.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
