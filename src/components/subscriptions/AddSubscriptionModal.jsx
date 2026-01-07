import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, Tag, Bell, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

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
  { name: 'Netflix', color: '#E50914', category: 'entertainment' },
  { name: 'Spotify', color: '#1DB954', category: 'entertainment' },
  { name: 'Amazon Prime', color: '#00A8E1', category: 'entertainment' },
  { name: 'Disney+', color: '#113CCF', category: 'entertainment' },
  { name: 'YouTube Premium', color: '#FF0000', category: 'entertainment' },
  { name: 'Apple Music', color: '#FA243C', category: 'entertainment' },
  { name: 'HBO Max', color: '#5822B4', category: 'entertainment' },
  { name: 'iCloud', color: '#3693F3', category: 'utilities' },
  { name: 'Google One', color: '#4285F4', category: 'utilities' },
  { name: 'Dropbox', color: '#0061FF', category: 'productivity' },
  { name: 'Adobe CC', color: '#FF0000', category: 'productivity' },
  { name: 'Microsoft 365', color: '#D83B01', category: 'productivity' },
  { name: 'ChatGPT Plus', color: '#10A37F', category: 'productivity' },
  { name: 'Notion', color: '#000000', category: 'productivity' },
  { name: 'Slack', color: '#4A154B', category: 'productivity' },
  { name: 'Gym Membership', color: '#FF6B35', category: 'health' },
];

export default function AddSubscriptionModal({ isOpen, onClose, onSave, editingSubscription }) {
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
  });

  const [showPresets, setShowPresets] = useState(!editingSubscription);

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
    }));
    setShowPresets(false);
  };

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
            className="w-full max-w-lg bg-[#12121a] border border-white/10 rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#12121a]/95 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-white">
                {editingSubscription ? 'Edit Subscription' : 'Add Subscription'}
              </h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">
              {/* Popular Services */}
              {showPresets && !editingSubscription && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-400">Quick Add</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularServices.slice(0, 8).map((service) => (
                      <button
                        key={service.name}
                        type="button"
                        onClick={() => selectPreset(service)}
                        className="px-3 py-1.5 rounded-full text-sm font-medium text-white border border-white/10 hover:border-white/30 transition-colors flex items-center gap-2"
                        style={{ backgroundColor: `${service.color}20` }}
                      >
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: service.color }}
                        />
                        {service.name}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowPresets(false)}
                      className="px-3 py-1.5 rounded-full text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Custom →
                    </button>
                  </div>
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label className="text-gray-400">Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Netflix, Spotify"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  required
                />
              </div>

              {/* Price & Billing Cycle */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      className="bg-white/5 border-white/10 text-white pl-9 placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Billing Cycle</Label>
                  <Select 
                    value={formData.billing_cycle}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, billing_cycle: value }))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      {billingCycles.map((cycle) => (
                        <SelectItem key={cycle.value} value={cycle.value} className="text-white">
                          {cycle.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Next Billing Date */}
              <div className="space-y-2">
                <Label className="text-gray-400">Next Billing Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="date"
                    value={formData.next_billing_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, next_billing_date: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white pl-9"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-gray-400">Category</Label>
                <Select 
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-white">
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label className="text-gray-400">Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full transition-transform ${formData.color === color ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#12121a]' : 'hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Free Trial Toggle */}
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                <div>
                  <Label className="text-white">Free Trial</Label>
                  <p className="text-xs text-gray-500 mt-0.5">Get reminded before it converts</p>
                </div>
                <Switch
                  checked={formData.is_free_trial}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_free_trial: checked, status: checked ? 'trial' : 'active' }))}
                />
              </div>

              {/* Trial End Date */}
              {formData.is_free_trial && (
                <div className="space-y-2">
                  <Label className="text-gray-400">Trial Ends On</Label>
                  <Input
                    type="date"
                    value={formData.trial_end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, trial_end_date: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              )}

              {/* Reminder */}
              <div className="space-y-2">
                <Label className="text-gray-400">Remind me</Label>
                <Select 
                  value={String(formData.reminder_days_before)}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, reminder_days_before: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    <SelectItem value="1" className="text-white">1 day before</SelectItem>
                    <SelectItem value="3" className="text-white">3 days before</SelectItem>
                    <SelectItem value="7" className="text-white">1 week before</SelectItem>
                    <SelectItem value="0" className="text-white">Don't remind me</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-gray-400">Notes (optional)</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl"
              >
                {editingSubscription ? 'Save Changes' : 'Add Subscription'}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}