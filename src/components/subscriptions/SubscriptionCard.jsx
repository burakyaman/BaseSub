import React from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { ChevronRight, Bell, Pause, AlertCircle } from 'lucide-react';

const categoryIcons = {
  entertainment: '🎬',
  productivity: '⚡',
  utilities: '🔧',
  health: '💪',
  education: '📚',
  gaming: '🎮',
  news: '📰',
  social: '💬',
  finance: '💰',
  other: '📦',
};

export default function SubscriptionCard({ subscription, onClick }) {
  const daysUntilRenewal = differenceInDays(
    new Date(subscription.next_billing_date),
    new Date()
  );

  const isUpcoming = daysUntilRenewal <= 7 && daysUntilRenewal >= 0;
  const isOverdue = daysUntilRenewal < 0;
  const isTrial = subscription.status === 'trial' || subscription.is_free_trial;
  const isPaused = subscription.status === 'paused';

  const formatPrice = (price, cycle) => {
    const cycleLabel = {
      weekly: '/wk',
      monthly: '/mo',
      quarterly: '/qtr',
      yearly: '/yr',
    };
    return `$${price.toFixed(2)}${cycleLabel[cycle] || '/mo'}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 cursor-pointer group overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300"
    >
      {/* Background gradient on hover - submarine light effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 20% 50%, ${subscription.color || '#06b6d4'}15 0%, transparent 60%)`,
        }}
      />

      <div className="relative flex items-center gap-4">
        {/* Icon - submarine porthole style */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 backdrop-blur-sm shadow-inner"
          style={{ 
            backgroundColor: `${subscription.color || '#06b6d4'}20`,
            boxShadow: `0 0 20px ${subscription.color || '#06b6d4'}20 inset`,
          }}
        >
          {subscription.icon_url ? (
            <img 
              src={subscription.icon_url} 
              alt={subscription.name} 
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <span className="text-2xl">
              {categoryIcons[subscription.category] || '📦'}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">
              {subscription.name}
            </h3>
            {isTrial && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-yellow-500/20 text-yellow-400">
                TRIAL
              </span>
            )}
            {isPaused && (
              <Pause className="w-3 h-3 text-gray-400" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-400">
              {isOverdue ? (
                <span className="text-red-400">Overdue</span>
              ) : (
                `Renews ${daysUntilRenewal === 0 ? 'today' : daysUntilRenewal === 1 ? 'tomorrow' : `in ${daysUntilRenewal} days`}`
              )}
            </span>
            {isUpcoming && !isOverdue && (
              <Bell className="w-3 h-3 text-orange-400" />
            )}
            {isOverdue && (
              <AlertCircle className="w-3 h-3 text-red-400" />
            )}
          </div>
        </div>

        {/* Price */}
        <div className="text-right flex-shrink-0">
          <div className="font-semibold text-white">
            {formatPrice(subscription.price, subscription.billing_cycle)}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {format(new Date(subscription.next_billing_date), 'MMM d')}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
      </div>
    </motion.div>
  );
}