import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const categories = [
  { value: 'entertainment', label: 'Music' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'news', label: 'News' },
  { value: 'social', label: 'Social' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' },
];

const billingLabels = {
  weekly: 'Every week',
  monthly: 'Every month',
  quarterly: 'Every quarter',
  yearly: 'Every year',
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
  
  const [isEditing, setIsEditing] = useState(false);
  const [localSubscription, setLocalSubscription] = useState(subscription);

  const daysUntilRenewal = differenceInDays(
    new Date(localSubscription.next_billing_date),
    new Date()
  );

  const isTrial = localSubscription.status === 'trial' || localSubscription.is_free_trial;

  const handleSave = () => {
    onEdit(localSubscription);
    setIsEditing(false);
    onClose();
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const reminderLabels = {
    0: 'Never',
    1: '1 day before',
    3: '3 days before',
    7: '1 week before',
  };

  const [showBillingDropdown, setShowBillingDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0a0a0f] z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-full max-w-lg mx-auto flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <button 
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-lg font-semibold text-white">
                {isEditing ? 'Edit Subscription' : subscription.name}
              </h1>
              {isEditing ? (
                <button 
                  onClick={handleSave}
                  className="px-5 py-2 bg-white/10 hover:bg-white/15 rounded-full text-white font-medium transition-colors"
                >
                  Save
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 bg-white/10 hover:bg-white/15 rounded-full text-white font-medium transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
              {/* Main Card with Icon, Name, Price */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: localSubscription.color || '#22c55e' }}
                  >
                    {localSubscription.icon_url ? (
                      <img 
                        src={localSubscription.icon_url} 
                        alt={localSubscription.name} 
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {localSubscription.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        value={localSubscription.name}
                        onChange={(e) => setLocalSubscription({...localSubscription, name: e.target.value})}
                        className="text-xl font-semibold text-white bg-transparent border-none outline-none mb-1 w-full"
                      />
                    ) : (
                      <h2 className="text-xl font-semibold text-white mb-1">
                        {localSubscription.name}
                      </h2>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-gray-500 text-lg">$</span>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          value={localSubscription.price}
                          onChange={(e) => setLocalSubscription({...localSubscription, price: parseFloat(e.target.value) || 0})}
                          className="text-2xl font-bold text-white bg-transparent border-none outline-none w-24"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-white">
                          {localSubscription.price?.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Date */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-gray-300">Payment date</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={localSubscription.next_billing_date}
                    onChange={(e) => setLocalSubscription({...localSubscription, next_billing_date: e.target.value})}
                    className="text-white font-medium bg-transparent outline-none"
                  />
                ) : (
                  <span className="text-white font-medium">
                    {format(new Date(localSubscription.next_billing_date), 'd MMM yyyy')}
                  </span>
                )}
              </div>

              {/* Billing Cycle */}
              {isEditing ? (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Billing Cycle</span>
                    <button
                      onClick={() => setShowBillingDropdown(!showBillingDropdown)}
                      className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                    >
                      <span>{billingLabels[localSubscription.billing_cycle] || 'Every month'}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  {showBillingDropdown && (
                    <div className="mt-3 space-y-2">
                      {Object.entries(billingLabels).map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => {
                            setLocalSubscription({...localSubscription, billing_cycle: value});
                            setShowBillingDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            localSubscription.billing_cycle === value 
                              ? 'bg-white/10 text-white' 
                              : 'text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-gray-300">Billing Cycle</span>
                  <span className="text-gray-400">
                    {billingLabels[localSubscription.billing_cycle] || 'Every month'}
                  </span>
                </div>
              )}

              {/* Free Trial */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-gray-300">Free Trial</span>
                {isEditing ? (
                  <Switch 
                    checked={isTrial}
                    onCheckedChange={(checked) => {
                      setLocalSubscription({
                        ...localSubscription,
                        is_free_trial: checked,
                        status: checked ? 'trial' : 'active'
                      });
                    }}
                  />
                ) : (
                  <span className="text-gray-400">{isTrial ? 'Yes' : 'No'}</span>
                )}
              </div>

              {/* Free Trial Info Card */}
              {isTrial && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    You'll be reminded about this free trial on{' '}
                    {format(new Date(localSubscription.next_billing_date).setDate(
                      new Date(localSubscription.next_billing_date).getDate() - (localSubscription.reminder_days_before || 3)
                    ), 'd MMMM')}, before it ends on{' '}
                    {format(new Date(localSubscription.next_billing_date), 'd MMMM')}.
                  </p>
                </div>
              )}

              {/* List */}
              {isEditing ? (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">List</span>
                    <button
                      onClick={() => setShowListDropdown(!showListDropdown)}
                      className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                    >
                      <span>Personal</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  {showListDropdown && (
                    <div className="mt-3 space-y-2">
                      <button
                        onClick={() => setShowListDropdown(false)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-white/10 text-white"
                      >
                        Personal
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-gray-300">List</span>
                  <span className="text-gray-400">Personal</span>
                </div>
              )}

              {/* Category */}
              {isEditing ? (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Category</span>
                    <button
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                    >
                      <span>{categoryLabels[localSubscription.category] || 'Other'}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  {showCategoryDropdown && (
                    <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                      {categories.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => {
                            setLocalSubscription({...localSubscription, category: cat.value});
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            localSubscription.category === cat.value 
                              ? 'bg-white/10 text-white' 
                              : 'text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-gray-300">Category</span>
                  <span className="text-gray-400">
                    {categoryLabels[localSubscription.category] || 'Other'}
                  </span>
                </div>
              )}

              {/* Payment Method */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-gray-300">Payment Method</span>
                <span className="text-gray-400">
                  {localSubscription.payment_method || 'None'}
                </span>
              </div>

              {/* Notification */}
              {isEditing ? (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Notification</span>
                    <button
                      onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                      className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                    >
                      <span>{reminderLabels[localSubscription.reminder_days_before] || '3 days before'}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  {showNotificationDropdown && (
                    <div className="mt-3 space-y-2">
                      {Object.entries(reminderLabels).map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => {
                            setLocalSubscription({...localSubscription, reminder_days_before: parseInt(value)});
                            setShowNotificationDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            localSubscription.reminder_days_before === parseInt(value)
                              ? 'bg-white/10 text-white' 
                              : 'text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-gray-300">Notification</span>
                  <span className="text-gray-400">
                    {reminderLabels[localSubscription.reminder_days_before] || '3 days before'}
                  </span>
                </div>
              )}

              {/* Delete Button */}
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${localSubscription.name}?`)) {
                    onDelete(localSubscription);
                    onClose();
                  }
                }}
                className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl text-red-400 font-medium transition-colors"
              >
                Delete subscription
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}