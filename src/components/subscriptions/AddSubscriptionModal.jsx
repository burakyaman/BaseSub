import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Image, FileText, Plus, ChevronRight, Search, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import BillingCyclePicker from './BillingCyclePicker';
import NumpadInput from './NumpadInput';

const categories = [
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'productivity', label: 'Productivity', icon: '⚡' },
  { value: 'utilities', label: 'Utilities', icon: '🔧' },
  { value: 'health', label: 'Health & Fitness', icon: '💪' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'gaming', label: 'Gaming', icon: '🎮' },
  { value: 'news', label: 'News & Media', icon: '📰' },
  { value: 'social', label: 'Social', icon: '💬' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'other', label: 'Other', icon: '📦' },
];

const billingCycles = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const presetColors = [
  '#22c55e', '#f97316', '#a855f7', '#3b82f6', 
  '#ec4899', '#eab308', '#06b6d4', '#ef4444',
];

const popularServices = [
  { name: 'Netflix', color: '#E50914', category: 'entertainment', icon: 'https://logo.clearbit.com/netflix.com' },
  { name: 'YouTube Premium', color: '#FF0000', category: 'entertainment', icon: 'https://logo.clearbit.com/youtube.com' },
  { name: 'Amazon Prime Video', color: '#00A8E1', category: 'entertainment', icon: 'https://logo.clearbit.com/amazon.com' },
  { name: 'Disney+', color: '#113CCF', category: 'entertainment', icon: 'https://logo.clearbit.com/disneyplus.com' },
  { name: 'Hulu', color: '#1CE783', category: 'entertainment', icon: 'https://logo.clearbit.com/hulu.com' },
  { name: 'HBO Max', color: '#5822B4', category: 'entertainment', icon: 'https://logo.clearbit.com/hbomax.com' },
  { name: 'Apple TV+', color: '#000000', category: 'entertainment', icon: 'https://logo.clearbit.com/apple.com' },
  { name: 'Spotify', color: '#1DB954', category: 'entertainment', icon: 'https://logo.clearbit.com/spotify.com' },
  { name: 'Apple Music', color: '#FA243C', category: 'entertainment', icon: 'https://logo.clearbit.com/apple.com' },
  { name: 'iCloud', color: '#3693F3', category: 'utilities', icon: 'https://logo.clearbit.com/icloud.com' },
];

export default function AddSubscriptionModal({ isOpen, onClose, onSave, editingSubscription }) {
  const [step, setStep] = useState(editingSubscription ? 'form' : 'select');
  const [searchQuery, setSearchQuery] = useState('');
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [showBillingPicker, setShowBillingPicker] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showNumpad, setShowNumpad] = useState(false);
  const [formData, setFormData] = useState(editingSubscription || {
    name: '',
    price: '',
    billing_cycle: 'monthly',
    next_billing_date: new Date().toISOString().split('T')[0],
    category: 'other',
    color: '#22c55e',
    is_free_trial: false,
    trial_end_date: '',
    reminder_days_before: 3,
    notes: '',
    status: 'active',
    icon_url: '',
    list_id: '',
  });

  const { data: lists = [] } = useQuery({
    queryKey: ['lists'],
    queryFn: () => base44.entities.List.list(),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
    });
  };

  const selectPreset = (service) => {
    setFormData(prev => ({
      ...prev,
      name: service.name,
      color: service.color,
      category: service.category,
      icon_url: service.icon || '',
    }));
    setStep('form');
  };

  const filteredServices = popularServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const billingLabels = {
    weekly: 'Every week',
    monthly: 'Every month',
    quarterly: 'Every quarter',
    yearly: 'Every year',
  };

  const reminderLabels = {
    0: 'Never',
    1: '1 day before',
    3: '3 days before',
    7: '1 week before',
  };

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
              {step === 'form' ? (
                <button 
                  onClick={() => editingSubscription ? onClose() : setStep('select')}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              ) : (
                <button 
                  onClick={onClose}
                  className="px-5 py-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
                >
                  Cancel
                </button>
              )}
              <h1 className="text-lg font-semibold text-white">Add Subscription</h1>
              {step === 'form' ? (
                <button 
                  onClick={handleSubmit}
                  className="px-5 py-2 bg-white/10 hover:bg-white/15 rounded-full text-white font-medium transition-colors"
                >
                  Save
                </button>
              ) : (
                <div className="w-20" />
              )}
            </div>

            {step === 'select' ? (
              <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
                {/* Import Options */}
                <div className="space-y-3">
                  <button className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Image className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-white font-medium">Import from photos</h3>
                      <p className="text-sm text-gray-500">Receipt, bill or renewal screenshots</p>
                    </div>
                    <Lock className="w-4 h-4 text-gray-600" />
                  </button>

                  <button className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-white font-medium">Import a file</h3>
                      <p className="text-sm text-gray-500">Bank statement or spreadsheet (PDF or CSV)</p>
                    </div>
                    <Lock className="w-4 h-4 text-gray-600" />
                  </button>

                  <button 
                    onClick={() => setStep('form')}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-white font-medium">Custom subscription</h3>
                    </div>
                  </button>
                </div>

                {/* Streaming Section */}
                <div>
                  <h2 className="text-xs text-gray-500 font-semibold tracking-wider mb-3">STREAMING</h2>
                  <div className="space-y-0">
                    {filteredServices.map((service) => (
                      <button
                        key={service.name}
                        onClick={() => selectPreset(service)}
                        className="w-full flex items-center gap-4 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${service.color}20` }}
                        >
                          {service.icon ? (
                            <img src={service.icon} alt={service.name} className="w-7 h-7 rounded-lg" />
                          ) : (
                            <span className="text-xl font-bold" style={{ color: service.color }}>
                              {service.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="flex-1 text-left text-white font-medium">{service.name}</span>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="fixed bottom-20 left-0 right-0 px-4 pb-4">
                  <div className="max-w-lg mx-auto relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search"
                      className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">

                {/* Main Card */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: formData.color || '#22c55e' }}
                    >
                      {formData.icon_url ? (
                        <img 
                          src={formData.icon_url} 
                          alt={formData.name} 
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-white">
                          {formData.name?.charAt(0).toUpperCase() || 'S'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Service name"
                        className="text-xl font-semibold text-white bg-transparent border-none outline-none mb-1 w-full"
                        required
                      />
                      <div className="flex items-baseline gap-1">
                        <span className="text-gray-500 text-lg">$</span>
                        <button
                          type="button"
                          onClick={() => setShowNumpad(true)}
                          className="text-2xl font-bold text-white bg-transparent border-none outline-none text-left"
                        >
                          {formData.price || '0.00'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Date */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-gray-300">Payment date</span>
                  <input
                    type="date"
                    value={formData.next_billing_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, next_billing_date: e.target.value }))}
                    className="text-white font-medium bg-transparent outline-none"
                    required
                  />
                </div>

                {/* Billing Cycle */}
                <button
                  type="button"
                  onClick={() => setShowBillingPicker(true)}
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                >
                  <span className="text-gray-300">Billing Cycle</span>
                  <span className="text-white">
                    {billingLabels[formData.billing_cycle] || 'Every month'}
                  </span>
                </button>

                {/* Free Trial */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-gray-300">Free Trial</span>
                  <Switch 
                    checked={formData.is_free_trial}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_free_trial: checked, status: checked ? 'trial' : 'active' }))}
                  />
                </div>

                {/* List */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">List</span>
                    <button
                      type="button"
                      onClick={() => setShowListDropdown(!showListDropdown)}
                      className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                    >
                      <span>
                        {formData.list_id 
                          ? lists.find(l => l.id === formData.list_id)?.name || 'None'
                          : 'None'}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${showListDropdown ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                  {showListDropdown && (
                    <div className="mt-3 space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, list_id: '' }));
                          setShowListDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          !formData.list_id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        None
                      </button>
                      {lists.map((list) => (
                        <button
                          key={list.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, list_id: list.id }));
                            setShowListDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            formData.list_id === list.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          <span>{list.icon || '📝'}</span>
                          <span>{list.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category */}
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(true)}
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                >
                  <span className="text-gray-300">Category</span>
                  <span className="text-white">
                    {categories.find(c => c.value === formData.category)?.label || 'Other'}
                  </span>
                </button>

                {/* Payment Method */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-gray-300">Payment Method</span>
                  <span className="text-gray-400">None</span>
                </div>

                {/* Notification */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-gray-300">Notification</span>
                  <span className="text-gray-400">
                    {reminderLabels[formData.reminder_days_before] || '3 days before'}
                  </span>
                </div>

                {/* Price History */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-gray-300">Price History</span>
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </div>

              </form>
              )}

              {/* Category Dropdown Modal */}
              <AnimatePresence>
              {showCategoryDropdown && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center"
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
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, category: cat.value }));
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                            formData.category === cat.value 
                              ? 'bg-white/10 text-white' 
                              : 'text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          <span>{cat.label}</span>
                          {formData.category === cat.value && (
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
              value={formData.billing_cycle}
              onChange={(value) => setFormData(prev => ({ ...prev, billing_cycle: value }))}
              isOpen={showBillingPicker}
              onClose={() => setShowBillingPicker(false)}
              />

              {/* Numpad */}
              <NumpadInput
              value={formData.price}
              onChange={(value) => setFormData(prev => ({ ...prev, price: value }))}
              isOpen={showNumpad}
              onClose={() => setShowNumpad(false)}
              currency="$"
              />
              </div>
              </motion.div>
              )}
              </AnimatePresence>
              );
              }