import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { useFoundingUserCounter } from '@/hooks/useFoundingUserCounter';
import { Users, Zap } from 'lucide-react';

export function FoundingUserCounter() {
  const { data: counter, loading, error } = useFoundingUserCounter();
  const [animatedCurrent, setAnimatedCurrent] = useState(0);

  // Animate the counter value
  useEffect(() => {
    if (!loading && counter.current > 0) {
      const duration = 1500; // 1.5 seconds
      const steps = 60;
      const increment = counter.current / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setAnimatedCurrent(counter.current);
          clearInterval(timer);
        } else {
          setAnimatedCurrent(Math.floor(increment * currentStep));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [counter.current, loading]);

  const percentage = (counter.current / counter.total) * 100;
  const remaining = counter.total - counter.current;

  if (error) {
    console.error('Founding user counter error:', error);
  }

  return (
    <section className="py-16 bg-gradient-to-br from-wellness-green-50 to-wellness-blue-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-large p-8 md:p-12 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-wellness-green-500 to-wellness-blue-500 rounded-full mb-4 shadow-md">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Limited Lifetime Deals
              </h2>
              <p className="text-lg text-gray-700">
                Join our founding members and lock in lifetime access
              </p>
            </div>

            {/* Counter Display */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="w-6 h-6 text-wellness-green-600" />
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {loading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    <>
                      <span className="bg-gradient-to-r from-wellness-green-600 to-wellness-blue-600 bg-clip-text text-transparent">{animatedCurrent}</span>
                      <span className="text-gray-500 mx-2">/</span>
                      <span className="text-gray-900">{counter.total}</span>
                    </>
                  )}
                </p>
              </div>
              <p className="text-center text-gray-700 font-semibold">
                Lifetime Deals Claimed
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <Progress 
                value={percentage} 
                className="h-3 bg-gray-200"
              />
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>{percentage.toFixed(1)}% claimed</span>
                <span>{remaining} remaining</span>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <motion.a
                href="#pricing"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-wellness-green-600 to-wellness-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:from-wellness-green-700 hover:to-wellness-blue-700 transition-all"
              >
                Claim Your Lifetime Deal
              </motion.a>
              <p className="mt-4 text-sm text-gray-600 font-medium">
                One-time payment • Lifetime access • All future updates
              </p>
            </div>

            {/* Urgency Message */}
            {remaining <= 50 && remaining > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-wellness-coral-50 border-2 border-wellness-coral-400 rounded-lg text-center shadow-md"
              >
                <p className="text-wellness-coral-700 font-bold text-lg">
                  ⚡ Only {remaining} spots left! Act fast!
                </p>
              </motion.div>
            )}

            {remaining === 0 && (
              <div className="mt-6 p-4 bg-gray-100 border-2 border-gray-400 rounded-lg text-center">
                <p className="text-gray-800 font-bold">
                  All lifetime deals have been claimed. Join the waitlist for future offers!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
