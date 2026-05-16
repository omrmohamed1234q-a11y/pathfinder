import { supabase } from '@/lib/supabase';

export interface SubscriptionPlan {
  plan: 'free' | 'pro' | 'premium';
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  features: {
    maxSkillTrees: number; // -1 for unlimited
    aiLessons: boolean;
    aiQuizzes: boolean;
    videoLessons: boolean;
  };
}

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(
  plan: 'pro' | 'premium',
  userId?: string
): Promise<{ sessionId: string; url: string }> {
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { plan, userId },
  });

  if (error) {
    console.error('Error creating checkout session:', error);
    const errorMsg = error.message || 'Failed to create checkout session';
    
    // Check for specific error codes
    if (error.context?.text) {
      try {
        const errorData = JSON.parse(await error.context.text());
        if (errorData.code === 'STRIPE_NOT_CONFIGURED') {
          throw new Error('Stripe payments are not configured yet. Please contact support to enable premium features.');
        }
      } catch (e) {
        // If parsing fails, continue with generic error
      }
    }
    
    // Provide helpful error messages
    if (errorMsg.includes('STRIPE_SECRET_KEY') || errorMsg.includes('not configured')) {
      throw new Error('Stripe payments are not configured yet. Please contact support to enable premium features.');
    }
    
    throw new Error(errorMsg);
  }

  if (!data || !data.url) {
    throw new Error('Invalid response from checkout service');
  }

  return data;
}

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionPlan> {
  // HACKATHON DEMO MODE: Check for local storage flag
  if (typeof window !== 'undefined' && localStorage.getItem('hackathon_premium') === 'true') {
    return {
      plan: 'premium',
      status: 'active',
      features: {
        maxSkillTrees: -1, // unlimited
        aiLessons: true,
        aiQuizzes: true,
        videoLessons: true,
      },
    };
  }

  // Use direct fetch to pass query parameters with GET request
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-subscription-status?userId=${encodeURIComponent(userId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting subscription status:', error);
    // Return free tier on error
    return {
      plan: 'free',
      status: 'active',
      features: {
        maxSkillTrees: 3,
        aiLessons: false,
        aiQuizzes: false,
        videoLessons: false,
      },
    };
  }
}

/**
 * Check if user can perform an action based on their subscription
 */
export async function canPerformAction(
  userId: string,
  action: 'create_skill_tree' | 'generate_video' | 'ai_lesson' | 'ai_quiz'
): Promise<{ allowed: boolean; reason?: string }> {
  const subscription = await getSubscriptionStatus(userId);

  switch (action) {
    case 'create_skill_tree':
      if (subscription.plan === 'free') {
        // Check usage for free tier
        const { data: usage } = await supabase
          .from('usage_tracking')
          .select('count')
          .eq('user_id', userId)
          .eq('resource_type', 'skill_tree')
          .gte('period_start', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          .maybeSingle();

        const currentCount = usage?.count || 0;
        if (currentCount >= subscription.features.maxSkillTrees) {
          return {
            allowed: false,
            reason: 'You have reached the free tier limit of 3 skill trees per month. Upgrade to Pro for unlimited access.',
          };
        }
      }
      return { allowed: true };

    case 'generate_video':
      if (!subscription.features.videoLessons) {
        return {
          allowed: false,
          reason: 'Video generation is only available on the Premium plan. Upgrade to unlock this feature.',
        };
      }
      return { allowed: true };

    case 'ai_lesson':
    case 'ai_quiz':
      if (!subscription.features.aiLessons) {
        return {
          allowed: false,
          reason: 'AI-generated content is only available on Pro and Premium plans. Upgrade to unlock this feature.',
        };
      }
      return { allowed: true };

    default:
      return { allowed: true };
  }
}

/**
 * Track resource usage for free tier
 */
export async function trackUsage(userId: string, resourceType: 'skill_tree' | 'image' | 'video'): Promise<void> {
  const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const periodEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  const { data: existing } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('resource_type', resourceType)
    .eq('period_start', periodStart.toISOString())
    .maybeSingle();

  if (existing) {
    await supabase
      .from('usage_tracking')
      .update({ count: existing.count + 1 })
      .eq('id', existing.id);
  } else {
    await supabase.from('usage_tracking').insert({
      user_id: userId,
      resource_type: resourceType,
      count: 1,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
    });
  }
}
