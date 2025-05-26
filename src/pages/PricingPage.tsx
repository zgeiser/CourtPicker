import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStripe } from '../hooks/useStripe';
import { products, Product } from '../stripe-config';
import { supabase } from '../lib/supabase';
import Layout from '../components/layout/Layout';
import { Check, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createCheckoutSession, isLoading, error } = useStripe();
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoadingSubscription(false);
      return;
    }

    async function fetchSubscription() {
      try {
        setLoadingSubscription(true);
        setSubscriptionError(null);
        
        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();

        if (error) throw error;
        setSubscription(data);
      } catch (err: any) {
        console.error('Error fetching subscription:', err);
        setSubscriptionError('Failed to load subscription information');
      } finally {
        setLoadingSubscription(false);
      }
    }

    fetchSubscription();
  }, [user]);

  const handleSubscribe = async (product: Product) => {
    if (!user) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    try {
      const result = await createCheckoutSession(product);
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription || !subscription.price_id) return null;
    return Object.values(products).find((product) => product.priceId === subscription.price_id);
  };

  const currentPlan = getCurrentPlan();

  if (loadingSubscription) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </Layout>
    );
  }

  // Order tiers for display
  const orderedProducts = [products.tier1, products.tier2];

  return (
    <Layout>
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 pb-32">
        <div className="container mx-auto px-4 pt-16 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
            <p className="text-xl text-blue-100">
              Get access to premium features and support the development of PickACourt.com
            </p>
            
            {!user && (
              <p className="mt-4 text-blue-100">
                <button 
                  onClick={() => navigate('/login', { state: { from: '/pricing' } })}
                  className="text-white underline hover:no-underline"
                >
                  Sign in
                </button>
                {' '}to manage your subscription
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-24 pb-16">
        {subscriptionError && (
          <div className="max-w-5xl mx-auto mb-8">
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {subscriptionError}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {orderedProducts.map((product, index) => (
            <motion.div
              key={product.priceId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h3>
                <p className="text-gray-600 mb-6">{product.description}</p>

                <div className="mb-8">
                  <span className="text-4xl font-bold text-gray-900">
                    ${index === 0 ? '1' : '2'}
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>

                <button
                  onClick={() => handleSubscribe(product)}
                  disabled={isLoading || (currentPlan?.priceId === product.priceId)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    currentPlan?.priceId === product.priceId
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <Loader className="w-5 h-5 animate-spin mx-auto" />
                  ) : currentPlan?.priceId === product.priceId ? (
                    'Current Plan'
                  ) : (
                    'Subscribe'
                  )}
                </button>

                {error && (
                  <p className="mt-4 text-sm text-red-600">{error}</p>
                )}
              </div>

              <div className="bg-gray-50 px-8 py-6">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Features
                </h4>
                <ul className="space-y-3">
                  {index === 0 ? (
                    <>
                      <li className="flex items-center text-gray-600">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        Basic feature 1
                      </li>
                      <li className="flex items-center text-gray-600">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        Basic feature 2
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center text-gray-600">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        Premium feature 1
                      </li>
                      <li className="flex items-center text-gray-600">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        Premium feature 2
                      </li>
                      <li className="flex items-center text-gray-600">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        Premium feature 3
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}