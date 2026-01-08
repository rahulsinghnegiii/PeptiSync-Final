import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';

/**
 * Subscription Success Page
 * Shown after successful Stripe checkout completion
 */
export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 border border-gray-200 dark:border-gray-700">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Title and Message */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to PeptiSync Premium!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Your subscription is now active and all premium features are unlocked.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100">
              What's unlocked:
            </p>
            <ul className="text-sm text-cyan-800 dark:text-cyan-200 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Unlimited peptide tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Advanced analytics & insights</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Priority support</span>
              </li>
            </ul>
          </div>

          {/* Countdown */}
          <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center mb-2">
              Redirecting to your dashboard in {countdown} seconds...
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 group"
          >
            Go to Dashboard Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Session ID (for debugging) */}
          {sessionId && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Session: {sessionId.substring(0, 20)}...
            </p>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Questions? Visit our{' '}
            <button
              onClick={() => navigate('/faq')}
              className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline"
            >
              Help Center
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

