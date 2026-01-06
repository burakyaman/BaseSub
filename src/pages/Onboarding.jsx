import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Sparkles, TrendingDown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      // Skip to step 3 if already authenticated
      setStep(3);
    }
  };

  const handleSignIn = async () => {
    try {
      await base44.auth.redirectToLogin(createPageUrl('Onboarding'));
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    }
    // Continue to home regardless
    navigate(createPageUrl('Home'));
  };

  const skipToHome = () => {
    navigate(createPageUrl('Home'));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a1f3f] via-[#1a1325] to-[#0f0a1a]" />
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-md w-full">
        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center"
              >
                <TrendingDown className="w-10 h-10 text-white" />
              </motion.div>

              <h1 className="text-4xl font-bold mb-4">Welcome to SubscriptTrack</h1>
              <p className="text-xl text-gray-400 mb-8">
                Track renewals, stop unnecessary payments, and see your savings.
              </p>

              <div className="space-y-4 mb-12">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Never miss a renewal</p>
                    <p className="text-sm text-gray-500">Get reminded before charges</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Track your savings</p>
                    <p className="text-sm text-gray-500">See what you've saved</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Secure & private</p>
                    <p className="text-sm text-gray-500">Your data stays yours</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-6 rounded-2xl text-lg font-semibold"
              >
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 2: Sign In */}
          {step === 2 && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-3xl font-bold mb-4">Sign in to continue</h1>
              <p className="text-lg text-gray-400 mb-12">
                Create an account to sync your subscriptions across devices
              </p>

              <div className="space-y-4">
                <Button
                  onClick={handleSignIn}
                  className="w-full bg-white hover:bg-gray-100 text-black py-6 rounded-2xl text-lg font-semibold flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </Button>

                <button
                  onClick={skipToHome}
                  className="w-full text-gray-400 hover:text-white py-4 text-sm transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Notifications */}
          {step === 3 && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Bell className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-3xl font-bold mb-4">Enable notifications</h1>
              <p className="text-lg text-gray-400 mb-12">
                Get reminded before your subscriptions renew so you never miss a payment
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <p className="text-sm text-gray-400 mb-4">Default reminders:</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white">1 day before renewal</span>
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">3 days before renewal</span>
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">7 days before renewal</span>
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={requestNotificationPermission}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-6 rounded-2xl text-lg font-semibold"
                >
                  Enable Notifications
                </Button>

                <button
                  onClick={skipToHome}
                  className="w-full text-gray-400 hover:text-white py-4 text-sm transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-8 bg-green-500' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}