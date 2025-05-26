import { useSubscription } from '../../hooks/useSubscription';
import { Link } from 'react-router-dom';
import { CreditCard, Star, AlertCircle, Loader } from 'lucide-react';

export default function SubscriptionInfo() {
  const { subscription, tier, isLoading, error } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-red-700">Failed to load subscription information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Subscription</h2>
          <Link
            to="/pricing"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View Plans
          </Link>
        </div>

        <div className="flex items-center mb-6">
          <Star className={`w-6 h-6 ${tier === 'free' ? 'text-gray-400' : 'text-yellow-400'} mr-3`} />
          <div>
            <p className="font-medium">
              {tier === 'tier2' ? 'Premium Plan' : tier === 'tier1' ? 'Basic Plan' : 'Free Plan'}
            </p>
            <p className="text-sm text-gray-600">
              {tier === 'free' ? 'Limited features' : 'Full access to all features'}
            </p>
          </div>
        </div>

        {subscription && subscription.subscription_id && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-t border-gray-100">
              <span className="text-gray-600">Status</span>
              <span className="font-medium capitalize">{subscription.subscription_status}</span>
            </div>

            {subscription.payment_method_brand && (
              <div className="flex justify-between py-2 border-t border-gray-100">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium capitalize">
                  {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
                </span>
              </div>
            )}

            {subscription.current_period_end && (
              <div className="flex justify-between py-2 border-t border-gray-100">
                <span className="text-gray-600">Next Payment</span>
                <span className="font-medium">
                  {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                </span>
              </div>
            )}

            {subscription.cancel_at_period_end && (
              <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                Your subscription will end on{' '}
                {new Date(subscription.current_period_end! * 1000).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <Link
            to="/pricing"
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {tier === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
          </Link>
        </div>
      </div>
    </div>
  );
}