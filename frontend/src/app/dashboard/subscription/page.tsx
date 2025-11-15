'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';

export default function SubscriptionPage() {
  const { accessToken, user } = useAuthStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!accessToken) return;

    try {
      const [plansData, subData] = await Promise.all([
        api.subscription.getPlans(),
        api.subscription.getUserSubscription(accessToken),
      ]);
      setPlans(plansData as any);
      setCurrentSubscription(subData);
    } catch (error) {
      console.error('Load subscription data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    if (!accessToken) return;

    try {
      const { url }: any = await api.subscription.createCheckout(
        {
          price_id: priceId,
          success_url: `${window.location.origin}/dashboard/subscription?success=true`,
          cancel_url: `${window.location.origin}/dashboard/subscription`,
        },
        accessToken
      );
      window.location.href = url;
    } catch (error: any) {
      alert(error.message || 'Failed to create checkout session');
    }
  };

  const handleManageSubscription = async () => {
    if (!accessToken) return;

    try {
      const { url }: any = await api.subscription.createPortal(
        {
          return_url: window.location.href,
        },
        accessToken
      );
      window.location.href = url;
    } catch (error: any) {
      alert(error.message || 'Failed to open billing portal');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="font-mono text-digital-white/60">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-7xl h-full overflow-y-auto">
        <h1 className="text-4xl font-mono font-bold text-kintsugi-gold mb-2">
          💳 Subscription
        </h1>
        <p className="text-digital-white/60 font-mono mb-8">
          Manage your subscription and billing
        </p>

        {/* Current Subscription */}
        {currentSubscription && currentSubscription.tier !== 'basic' && (
          <Card variant="pink" className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-mono font-bold text-cyber-pink mb-2">
                  Current Plan
                </h2>
                <p className="text-lg font-mono text-digital-white">
                  {currentSubscription.tier.replace('_', ' ').toUpperCase()}
                </p>
                <p className="text-sm font-mono text-digital-white/60 mt-2">
                  Status: {currentSubscription.status}
                </p>
              </div>
              <Button variant="secondary" onClick={handleManageSubscription}>
                Manage Billing
              </Button>
            </div>
          </Card>
        )}

        {/* Usage Stats */}
        {user && (
          <Card variant="cyan" className="mb-8">
            <h2 className="text-2xl font-mono font-bold text-cyber-cyan mb-4">
              Token Usage
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-mono">
                <span className="text-digital-white/60">Used</span>
                <span className="text-digital-white">
                  {user.tokens_used.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm font-mono">
                <span className="text-digital-white/60">Limit</span>
                <span className="text-digital-white">
                  {user.tokens_limit === -1 ? '∞ Unlimited' : user.tokens_limit.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-3 bg-digital-black border-2 border-cyber-cyan mt-4">
                <div
                  className="h-full bg-cyber-cyan transition-all"
                  style={{
                    width: user.tokens_limit === -1 ? '100%' : `${Math.min((user.tokens_used / user.tokens_limit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Available Plans */}
        <h2 className="text-2xl font-mono font-bold text-kintsugi-gold mb-6">
          Available Plans
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.tier}
              variant={plan.tier === user?.subscription_tier ? 'pink' : 'default'}
            >
              <h3 className="text-xl font-mono font-bold text-kintsugi-gold mb-2">
                {plan.name}
              </h3>
              <p className="text-3xl font-mono font-bold text-digital-white mb-4">
                {plan.price_monthly === 0 ? 'FREE' : `$${(plan.price_monthly / 100).toFixed(2)}`}
                {plan.price_monthly > 0 && (
                  <span className="text-sm text-digital-white/60">/month</span>
                )}
              </p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature: string, index: number) => (
                  <li key={index} className="text-sm font-mono text-digital-white/80">
                    ✓ {feature}
                  </li>
                ))}
              </ul>
              {plan.tier === user?.subscription_tier ? (
                <Button variant="ghost" disabled className="w-full">
                  Current Plan
                </Button>
              ) : plan.stripe_price_id ? (
                <Button
                  onClick={() => handleSubscribe(plan.stripe_price_id)}
                  className="w-full"
                >
                  Subscribe
                </Button>
              ) : (
                <Button variant="ghost" disabled className="w-full">
                  Free Plan
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
