import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays, differenceInMonths } from 'date-fns';
import { 
  X, 
  Calendar, 
  CreditCard, 
  Tag, 
  Bell, 
  Pause, 
  Play, 
  Trash2,
  Edit,
  Clock,
  DollarSign
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const categoryLabels = {
  entertainment: 'Entertainment',
  productivity: 'Productivity',
  utilities: 'Utilities',
  health: 'Health & Fitness',
  education: 'Education',
  gaming: 'Gaming',
  news: 'News & Media',
  social: 'Social',
  finance: 'Finance',
  other: 'Other',
};

const billingLabels = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export default function SubscriptionDetail({ 
  subscription, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete,
  onTogglePause 
}) {
  if (!subscription) return null;

  const daysUntilRenewal = differenceInDays(
    new Date(subscription.next_billing_date),
    new Date()
  );

  const monthsSubscribed = subscription.start_date 
    ? differenceInMonths(new Date(), new Date(subscription.start_date))
    : 0;

  const totalSpent = (() => {
    if (!subscription.start_date) return subscription.price;
    const multiplier = {
      weekly: monthsSubscribed * 4,
      monthly: monthsSubscribed,
      quarterly: Math.floor(monthsSubscribed / 3),
      yearly: Math.floor(monthsSubscribed / 12),
    };
    return subscription.price * (multiplier[subscription.billing_cycle] || 1);
  })();

  const yearlyEquivalent = (() => {
    const multiplier = {
      weekly: 52,
      monthly: 12,
      quarterly: 4,
      yearly: 1,
    };
    return subscription.price * (multiplier[subscription.billing_cycle] || 12);
  })();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-gradient-to-b from-[#0d2847]/95 to-[#0a1628]/95 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/20"
          >
            {/* Header with color banner */}
            <div 
              className="relative h-32 flex items-end p-4"
              style={{ 
                background: `linear-gradient(135deg, ${subscription.color || '#22c55e'}40 0%, ${subscription.color || '#22c55e'}10 100%)`
              }}
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: subscription.color || '#22c55e' }}
                >
                  {subscription.icon_url ? (
                    <img 
                      src={subscription.icon_url} 
                      alt={subscription.name} 
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {subscription.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{subscription.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-gray-300">
                      {categoryLabels[subscription.category] || 'Other'}
                    </span>
                    {subscription.status === 'paused' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
                        Paused
                      </span>
                    )}
                    {subscription.status === 'trial' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400">
                        Trial
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Price Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span>Price</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    ${subscription.price?.toFixed(2)}
                    <span className="text-sm text-gray-500 font-normal">
                      /{billingLabels[subscription.billing_cycle]?.toLowerCase() || 'mo'}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Next Payment</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {daysUntilRenewal === 0 ? 'Today' : 
                     daysUntilRenewal === 1 ? 'Tomorrow' : 
                     `${daysUntilRenewal} days`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(subscription.next_billing_date), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Yearly Cost</span>
                  <span className="text-white font-semibold">${yearlyEquivalent.toFixed(2)}/yr</span>
                </div>
                {subscription.start_date && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Subscribed Since</span>
                      <span className="text-white">
                        {format(new Date(subscription.start_date), 'MMM yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Total Spent (est.)</span>
                      <span className="text-cyan-400 font-semibold">${totalSpent.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {subscription.reminder_days_before > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm flex items-center gap-2">
                      <Bell className="w-3 h-3" />
                      Reminder
                    </span>
                    <span className="text-white">
                      {subscription.reminder_days_before} day{subscription.reminder_days_before > 1 ? 's' : ''} before
                    </span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {subscription.notes && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                  <span className="text-gray-400 text-sm">Notes</span>
                  <p className="text-white mt-1">{subscription.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                  onClick={() => onEdit(subscription)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                
                <Button
                  variant="outline"
                  className={`flex-1 border-white/10 ${
                    subscription.status === 'paused' 
                      ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                      : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                  }`}
                  onClick={() => onTogglePause(subscription)}
                >
                  {subscription.status === 'paused' ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="bg-red-500/10 border-white/10 text-red-400 hover:bg-red-500/20"
                  onClick={() => onDelete(subscription)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}