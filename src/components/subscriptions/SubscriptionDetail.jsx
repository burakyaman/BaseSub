import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { ArrowLeft, Check, ChevronDown, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PriceHistory from './PriceHistory';
import BillingCyclePicker from './BillingCyclePicker';
import NumpadInput from './NumpadInput';

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
  const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [showBillingPicker, setShowBillingPicker] = useState(false);
  const [showNumpad, setShowNumpad] = useState(false);

  const { data: lists = [] } = useQuery({
    queryKey: ['lists'],
    queryFn: () => base44.entities.List.list(),
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0f0a1f] z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-full max-w-lg mx-auto flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-b from-purple-900/20 to-transparent">
              <button 
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-[#1a1425] flex items-center justify-center hover:bg-[#252030] transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-lg font-semibold text-white">
                {isEditing ? 'Edit Subscription' : ''}
              </h1>
              {isEditing ? (
                <button 
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-transparent text-white font-medium transition-colors"
                >
                  Save
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-[#1a1425] hover:bg-[#252030] rounded-full text-white font-medium transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {/* Icon, Name, Price */}
              <div className="flex flex-col items-center py-8 mb-6">
                <div 
                  className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: localSubscription.color || '#22c55e' }}
                >
                  {localSubscription.icon_url ? (
                    <img 
                      src={localSubscription.icon_url} 
                      alt={localSubscription.name} 
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {localSubscription.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {isEditing ? (
                  <input
                    value={localSubscription.name}
                    onChange={(e) => setLocalSubscription({...localSubscription, name: e.target.value})}
                    className="text-3xl font-bold text-white bg-transparent border-none outline-none mb-2 text-center w-full"
                  />
                ) : (
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {localSubscription.name}
                  </h2>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-500 text-xl">$</span>
                  {isEditing ? (
                    <button
                      onClick={() => setShowNumpad(true)}
                      className="text-2xl font-medium text-gray-400 bg-transparent border-none outline-none"
                    >
                      {localSubscription.price?.toFixed(2) || '0.00'}
                    </button>
                  ) : (
                    <span className="text-2xl font-medium text-gray-400">
                      {localSubscription.price?.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Info List */}
              <div className="bg-[#1a1425] rounded-2xl overflow-hidden mb-4">

              {/* Billing */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <span className="text-gray-400">Billing</span>
                <span className="text-white">
                  {billingLabels[localSubscription.billing_cycle] || 'Weekly'}
                </span>
                </div>

                {/* Free Trial */}
                {(localSubscription.status === 'trial' || localSubscription.is_free_trial) && (
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <span className="text-gray-400">Free Trial</span>
                  <span className="text-white">
                    Renews in {daysUntilRenewal} days
                  </span>
                </div>
                )}

                {/* Next payment */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                <span className="text-gray-400">Next payment</span>
                {isEditing ? (
                  <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                    <PopoverTrigger asChild>
                      <button className="text-white hover:text-gray-300 transition-colors">
                        {format(new Date(localSubscription.next_billing_date), 'd MMM yyyy')}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1a1425] border-white/10" align="end">
                      <Calendar
                        mode="single"
                        selected={new Date(localSubscription.next_billing_date)}
                        onSelect={(date) => {
                          if (date) {
                            setLocalSubscription({...localSubscription, next_billing_date: format(date, 'yyyy-MM-dd')});
                            setShowCalendar(false);
                          }
                        }}
                        initialFocus
                        className="text-white"
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <span className="text-white">
                    {format(new Date(localSubscription.next_billing_date), 'd MMM yyyy')}
                  </span>
                )}
                </div>

                {/* Payment Method */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                <span className="text-gray-400">Payment Method</span>
                <span className="text-white">
                  {localSubscription.payment_method || 'Credit Card'}
                </span>
                </div>

                {/* Category */}
                {isEditing ? (
                <button
                  onClick={() => setShowCategoryDropdown(true)}
                  className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <span className="text-gray-400">Category</span>
                  <span className="text-white">
                    {categoryLabels[localSubscription.category] || 'Music'}
                  </span>
                </button>
                ) : (
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <span className="text-gray-400">Category</span>
                  <span className="text-white">
                    {categoryLabels[localSubscription.category] || 'Music'}
                  </span>
                </div>
                )}

                {/* URL */}
                <div className="flex items-center justify-between p-4">
                <span className="text-gray-400">URL</span>
                <span className="text-purple-400">
                  {localSubscription.notes || 'spotify.com ↗'}
                </span>
                </div>
                </div>

                {/* Notes */}
                <div className="bg-[#1a1425] rounded-2xl p-4 mb-4">
                <h3 className="text-white font-medium mb-2">Notes</h3>
                {isEditing ? (
                <textarea
                  value={localSubscription.notes || ''}
                  onChange={(e) => setLocalSubscription({...localSubscription, notes: e.target.value})}
                  placeholder="Add notes..."
                  className="w-full bg-transparent text-gray-400 text-sm border-none outline-none resize-none"
                  rows={3}
                />
                ) : (
                <p className="text-gray-400 text-sm">
                  {localSubscription.notes || 'No notes'}
                </p>
                )}
                </div>

              {/* Billing Cycle */}
              {isEditing ? (
                <button
                  onClick={() => setShowBillingPicker(true)}
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                >
                  <span className="text-gray-300">Billing Cycle</span>
                  <span className="text-white">
                    {billingLabels[localSubscription.billing_cycle] || 'Every month'}
                  </span>
                </button>
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
                      <span>
                        {localSubscription.list_id 
                          ? lists.find(l => l.id === localSubscription.list_id)?.name || 'None'
                          : 'None'}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  {showListDropdown && (
                    <div className="mt-3 space-y-2">
                      <button
                        onClick={() => {
                          setLocalSubscription({...localSubscription, list_id: ''});
                          setShowListDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          !localSubscription.list_id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        None
                      </button>
                      {lists.map((list) => (
                        <button
                          key={list.id}
                          onClick={() => {
                            setLocalSubscription({...localSubscription, list_id: list.id});
                            setShowListDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            localSubscription.list_id === list.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          <span>{list.icon || '📝'}</span>
                          <span>{list.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-gray-300">List</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      {localSubscription.list_id 
                        ? lists.find(l => l.id === localSubscription.list_id)?.name || 'None'
                        : 'None'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              )}

              {/* Category */}
              {isEditing ? (
                <button
                  onClick={() => setShowCategoryDropdown(true)}
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                >
                  <span className="text-gray-300">Category</span>
                  <span className="text-white">
                    {categoryLabels[localSubscription.category] || 'Other'}
                  </span>
                </button>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-gray-300">Category</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      {categoryLabels[localSubscription.category] || 'Other'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              )}

              {/* Payment Method */}
              {isEditing ? (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Payment Method</span>
                    <button
                      onClick={() => setShowPaymentMethodDropdown(!showPaymentMethodDropdown)}
                      className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                    >
                      <span>{localSubscription.payment_method || 'None'}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  {showPaymentMethodDropdown && (
                    <div className="mt-3 space-y-2">
                      <button
                        onClick={() => {
                          setLocalSubscription({...localSubscription, payment_method: ''});
                          setShowPaymentMethodDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-gray-400 hover:bg-white/5"
                      >
                        None
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-gray-300">Payment Method</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      {localSubscription.payment_method || 'None'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              )}

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
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      {reminderLabels[localSubscription.reminder_days_before] || '3 days before'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              )}

              {/* Price History */}
              {!isEditing && (
                <button
                  onClick={() => setShowPriceHistory(!showPriceHistory)}
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                >
                  <span className="text-gray-300">Price History</span>
                  <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${showPriceHistory ? 'rotate-90' : ''}`} />
                </button>
              )}

              {showPriceHistory && !isEditing && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                  <PriceHistory 
                    subscriptionId={localSubscription.id} 
                    currentPrice={localSubscription.price}
                  />
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

            {/* Category Dropdown Modal */}
            <AnimatePresence>
            {showCategoryDropdown && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
                onClick={() => setShowCategoryDropdown(false)}
              >
                <motion.div
                  initial={{ y: 300 }}
                  animate={{ y: 0 }}
                  exit={{ y: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#1a1325] rounded-t-3xl w-full max-w-lg max-h-[70vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-[#1a1325] border-b border-white/10 p-4">
                    <h3 className="text-lg font-semibold text-white text-center">Category</h3>
                  </div>
                  <div className="p-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => {
                          setLocalSubscription({...localSubscription, category: cat.value});
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                          localSubscription.category === cat.value 
                            ? 'bg-white/10 text-white' 
                            : 'text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <span>{cat.label}</span>
                        {localSubscription.category === cat.value && (
                          <Check className="w-5 h-5 text-green-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Billing Cycle Picker */}
            <BillingCyclePicker
            value={localSubscription.billing_cycle}
            onChange={(value) => setLocalSubscription({...localSubscription, billing_cycle: value})}
            isOpen={showBillingPicker}
            onClose={() => setShowBillingPicker(false)}
            />

            {/* Numpad */}
            <NumpadInput
            value={localSubscription.price}
            onChange={(value) => setLocalSubscription({...localSubscription, price: parseFloat(value) || 0})}
            isOpen={showNumpad}
            onClose={() => setShowNumpad(false)}
            currency="$"
            />
            </motion.div>
            )}
            </AnimatePresence>
            );
            }