import React, { useState } from 'react';
import { Check, Sparkles, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createCheckoutSession } from '@/services/stripeService';
import { toast } from 'sonner';

export const PricingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: 'pro' | 'premium') => {
    setIsLoading(plan);
    try {
      // HACKATHON DEMO MODE: Bypass Stripe and instantly upgrade
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network request
      
      localStorage.setItem('hackathon_premium', 'true');
      
      toast.success('🎉 Hackathon Special: You have been upgraded for FREE!', {
        duration: 5000,
      });

      // Confetti celebration
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00D4FF', '#8B5CF6', '#10B981', '#F59E0B'],
        });
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process demo upgrade');
    } finally {
      setIsLoading(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out Pathfinder',
      icon: Zap,
      iconColor: 'text-muted-foreground',
      features: [
        '3 AI skill trees per month',
        'Basic skill tree visualization',
        'Progress tracking',
        'Achievement system',
        'Community support',
      ],
      cta: 'Current Plan',
      disabled: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      description: 'For serious learners',
      icon: Sparkles,
      iconColor: 'text-primary',
      popular: true,
      features: [
        'Unlimited AI skill trees',
        'AI-generated lessons',
        'AI-generated quizzes',
        'Advanced analytics',
        'Priority support',
        'Export progress reports',
      ],
      cta: 'Upgrade to Pro',
      action: () => handleSubscribe('pro'),
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19.99',
      period: 'per month',
      description: 'Maximum learning power',
      icon: Crown,
      iconColor: 'text-amber-500',
      features: [
        'Everything in Pro',
        'AI-generated video lessons',
        'Custom skill tree templates',
        'Team collaboration',
        'White-label options',
        'Dedicated account manager',
      ],
      cta: 'Upgrade to Premium',
      action: () => handleSubscribe('premium'),
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--duo-bg)' }}>
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-black" style={{ color: 'var(--duo-text)' }}>
            Choose Your Learning Path
          </h1>
          <p className="text-lg font-semibold max-w-2xl mx-auto" style={{ color: 'var(--duo-text-muted)' }}>
            Unlock the full power of AI-driven learning. Start free, upgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;
            
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col p-8 rounded-3xl transition-transform duration-300 ${isPopular ? 'scale-105' : 'hover:scale-[1.02]'}`}
                style={{
                  background: 'var(--duo-surface)',
                  border: `2px solid ${isPopular ? 'var(--duo-green)' : 'var(--duo-border)'}`,
                  boxShadow: isPopular ? '0 12px 32px rgba(88, 204, 2, 0.15)' : 'none',
                }}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span 
                      className="px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider"
                      style={{ background: 'var(--duo-green)', color: 'white', boxShadow: '0 2px 0 var(--duo-green-dark)' }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center pb-8 border-b" style={{ borderColor: 'var(--duo-border)' }}>
                  <div className="flex justify-center mb-5">
                    <div 
                      className="p-4 rounded-2xl"
                      style={{ 
                        background: isPopular ? 'rgba(88,204,2,0.1)' : 'var(--duo-bg)', 
                        color: isPopular ? 'var(--duo-green)' : 'var(--duo-text-muted)'
                      }}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-2" style={{ color: 'var(--duo-text)' }}>{plan.name}</h3>
                  <p className="text-sm font-bold" style={{ color: 'var(--duo-text-muted)' }}>{plan.description}</p>
                  <div className="mt-6 flex items-baseline justify-center">
                    <span className="text-5xl font-black tracking-tight" style={{ color: 'var(--duo-text)' }}>{plan.price}</span>
                    <span className="text-sm font-bold ml-2" style={{ color: 'var(--duo-text-muted)' }}>{plan.period}</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col pt-8">
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full p-0.5" style={{ background: 'rgba(88,204,2,0.1)' }}>
                          <Check className="h-4 w-4" style={{ color: 'var(--duo-green)' }} />
                        </div>
                        <span className="text-sm font-bold" style={{ color: 'var(--duo-text-muted)' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={plan.action}
                    disabled={plan.disabled || isLoading === plan.id}
                    className={`w-full py-4 rounded-xl text-sm font-extrabold transition-all ${
                      plan.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    } ${isPopular ? 'btn-duo btn-duo-green' : ''}`}
                    style={!isPopular ? {
                      background: 'var(--duo-bg)',
                      color: 'var(--duo-text)',
                      border: '1.5px solid var(--duo-border)',
                    } : {}}
                  >
                    {isLoading === plan.id ? 'Loading...' : plan.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-black text-center mb-8" style={{ color: 'var(--duo-text)' }}>
            Frequently Asked Questions
          </h2>
          
          <div className="grid gap-4">
            {[
              { q: "Can I cancel anytime?", a: "Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe." },
              { q: "Can I upgrade or downgrade my plan?", a: "Absolutely! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle." },
              { q: "What happens to my data if I cancel?", a: "Your data is always yours. If you cancel, your skill trees and progress will be preserved. You can reactivate your subscription anytime to regain full access." },
            ].map((faq, i) => (
              <div 
                key={i}
                className="p-6 rounded-2xl transition-transform hover:scale-[1.01]"
                style={{ background: 'var(--duo-surface)', border: '1.5px solid var(--duo-border)' }}
              >
                <h3 className="text-lg font-extrabold mb-2" style={{ color: 'var(--duo-text)' }}>{faq.q}</h3>
                <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--duo-text-muted)' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
