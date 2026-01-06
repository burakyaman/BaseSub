import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { X, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";

const categoryLabels = {
  entertainment: 'Music',
  productivity: 'Productivity',
  utilities: 'Utilities',
  health: 'Health',
  education: 'Education',
  gaming: 'Gaming',
  news: 'News',
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

  const isTrial = subscription.status === 'trial' || subscription.is_free_trial;

  const InfoRow = ({ label, value, isLink = false }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5">
      <span className="text-gray-400">{label}</span>
      {isLink ? (
        <a 
          href={`https://${value}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
        >
          {value}
          <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <span className="text-white font-medium">{value}</span>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#1a1325] rounded-t-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header with gradient */}
            <div 
              className="relative pt-3 pb-24 px-6"
              style={{ 
                background: `linear-gradient(180deg, ${subscription.color || '#22c55e'}60 0%, ${subscription.color || '#22c55e'}30 50%, transparent 100%)`
              }}
            >
              {/* Drag indicator */}
              <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-6" />

              {/* Edit button */}
              <button 
                onClick={() => {
                  onEdit(subscription);
                  onClose();
                }}
                className="absolute top-8 right-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-full text-white font-medium transition-colors"
              >
                Edit
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: subscription.color || '#22c55e' }}
                >
                  {subscription.icon_url ? (
                    <img 
                      src={subscription.icon_url} 
                      alt={subscription.name} 
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {subscription.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Name & Price */}
              <h2 className="text-4xl font-bold text-white text-center mb-2">
                {subscription.name}
              </h2>
              <p className="text-2xl text-gray-300 text-center">
                ${subscription.price?.toFixed(2)}
              </p>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              {/* Info Rows */}
              <div className="space-y-0">
                <InfoRow 
                  label="Billing" 
                  value={billingLabels[subscription.billing_cycle] || 'Monthly'} 
                />
                
                {isTrial && (
                  <InfoRow 
                    label="Free Trial" 
                    value={`Renews in ${daysUntilRenewal} day${daysUntilRenewal !== 1 ? 's' : ''}`} 
                  />
                )}
                
                <InfoRow 
                  label="Next payment" 
                  value={format(new Date(subscription.next_billing_date), 'd MMM yyyy')} 
                />
                
                <InfoRow 
                  label="Payment Method" 
                  value={subscription.payment_method || 'Credit Card'} 
                />
                
                <InfoRow 
                  label="Category" 
                  value={categoryLabels[subscription.category] || 'Other'} 
                />
                
                <InfoRow 
                  label="URL" 
                  value={`${subscription.name.toLowerCase()}.com`}
                  isLink={true}
                />
              </div>

              {/* Notes Section */}
              <div className="mt-6 mb-6">
                <h3 className="text-white font-medium mb-3">Notes</h3>
                <div className="bg-[#2a2139] rounded-2xl p-4 min-h-[80px]">
                  <p className="text-gray-400 text-sm">
                    {subscription.notes || 'No notes added'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const newStatus = subscription.status === 'cancelled' ? 'active' : 'cancelled';
                    onTogglePause({ ...subscription, status: newStatus });
                  }}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-2xl text-white font-semibold transition-colors"
                >
                  {subscription.status === 'cancelled' ? 'Mark as Active' : 'Mark as Cancelled'}
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${subscription.name}?`)) {
                      onDelete(subscription);
                    }
                  }}
                  className="w-full text-gray-400 hover:text-white transition-colors"
                >
                  Delete subscription
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}