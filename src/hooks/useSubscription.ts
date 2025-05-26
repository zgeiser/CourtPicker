import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export type SubscriptionTier = 'free' | 'tier1' | 'tier2';

interface Subscription {
  subscription_id: string | null;
  subscription_status: string | null;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    async function fetchSubscription() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch subscription data
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();

        if (subscriptionError) throw subscriptionError;

        setSubscription(subscriptionData);

        // Fetch profile data to get tier
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('tier')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setTier(profileData?.tier || 'free');
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching subscription:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscription();
  }, [user]);

  return {
    subscription,
    tier,
    isLoading,
    error,
    isTier1: tier === 'tier1',
    isTier2: tier === 'tier2',
    isSubscribed: tier !== 'free',
  };
}