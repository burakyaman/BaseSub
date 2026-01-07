import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Palette, 
  CreditCard, 
  HelpCircle, 
  Shield,
  ChevronRight,
  Moon,
  Globe,
  Download,
  Trash2,
  List as ListIcon,
  Upload
} from 'lucide-react';
import ListManagement from '../components/settings/ListManagement';
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const settingsSections = [
  {
    title: 'Display',
    icon: Palette,
    color: '#a855f7',
    items: [
      { key: 'currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'], default: 'USD' },
      { key: 'dark_mode', label: 'Dark Mode', type: 'toggle', default: true },
    ]
  },
];

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const notificationPrefs = user?.notification_preferences || {
    enabled: true,
    email_enabled: true,
    in_app_enabled: true,
    reminder_days: [3, 1],
  };

  const [settings, setSettings] = useState({
    renewal_reminders: true,
    trial_alerts: true,
    reminder_timing: '3 days',
    currency: 'USD',
    dark_mode: true,
  });

  const updateNotificationPrefsMutation = useMutation({
    mutationFn: async (prefs) => {
      await base44.auth.updateMe({ notification_preferences: prefs });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
  });

  const { data: allPriceHistory = [] } = useQuery({
    queryKey: ['all-price-history'],
    queryFn: () => base44.entities.PriceHistory.list(),
  });

  // Calculate total savings across all subscriptions
  const totalSavings = allPriceHistory.reduce((sum, item) => {
    if (item.change_type === 'decrease' || item.change_type === 'switch') {
      return sum + (item.old_price - item.new_price);
    }
    return sum;
  }, 0);

  // Count price changes
  const priceIncreases = allPriceHistory.filter(h => h.change_type === 'increase').length;
  const priceDecreases = allPriceHistory.filter(h => h.change_type === 'decrease').length;
  const switches = allPriceHistory.filter(h => h.change_type === 'switch').length;

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleExportData = () => {
    const exportData = {
      subscriptions,
      exported_at: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/50 via-transparent to-purple-900/10 pointer-events-none" />
      
      <div className="relative max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-500/20 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-gray-500">Customize your experience</p>
          </div>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Bell className="w-4 h-4 text-orange-400" />
              </div>
              <span className="font-medium">Notifications</span>
            </div>

            <div className="divide-y divide-white/5">
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="text-gray-300">Enable Notifications</div>
                  <div className="text-xs text-gray-500">Get reminders for upcoming payments</div>
                </div>
                <Switch
                  checked={notificationPrefs.enabled}
                  onCheckedChange={(checked) => {
                    updateNotificationPrefsMutation.mutate({
                      ...notificationPrefs,
                      enabled: checked,
                    });
                  }}
                />
              </div>

              {notificationPrefs.enabled && (
                <>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <div className="text-gray-300">In-App Notifications</div>
                      <div className="text-xs text-gray-500">Show notifications in the app</div>
                    </div>
                    <Switch
                      checked={notificationPrefs.in_app_enabled}
                      onCheckedChange={(checked) => {
                        updateNotificationPrefsMutation.mutate({
                          ...notificationPrefs,
                          in_app_enabled: checked,
                        });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4">
                    <div>
                      <div className="text-gray-300">Email Notifications</div>
                      <div className="text-xs text-gray-500">Receive email reminders</div>
                    </div>
                    <Switch
                      checked={notificationPrefs.email_enabled}
                      onCheckedChange={(checked) => {
                        updateNotificationPrefsMutation.mutate({
                          ...notificationPrefs,
                          email_enabled: checked,
                        });
                      }}
                    />
                  </div>

                  <div className="p-4">
                    <div className="text-gray-300 mb-3">Remind me before</div>
                    <div className="flex flex-wrap gap-2">
                      {[1, 3, 7].map((days) => (
                        <button
                          key={days}
                          onClick={() => {
                            const newDays = notificationPrefs.reminder_days.includes(days)
                              ? notificationPrefs.reminder_days.filter(d => d !== days)
                              : [...notificationPrefs.reminder_days, days].sort((a, b) => b - a);

                            updateNotificationPrefsMutation.mutate({
                              ...notificationPrefs,
                              reminder_days: newDays,
                            });
                          }}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            notificationPrefs.reminder_days.includes(days)
                              ? 'bg-green-500/20 border-2 border-green-500/50 text-green-400'
                              : 'bg-white/5 border-2 border-white/10 text-gray-400'
                          }`}
                        >
                          {days === 1 ? '1 day' : days === 7 ? '1 week' : `${days} days`}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      You can select multiple reminder times
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {settingsSections.map((section, sectionIndex) => {
            const Icon = section.icon;
            
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                {/* Section Header */}
                <div className="flex items-center gap-3 p-4 border-b border-white/5">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${section.color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: section.color }} />
                  </div>
                  <span className="font-medium">{section.title}</span>
                </div>

                {/* Section Items */}
                <div className="divide-y divide-white/5">
                  {section.items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4">
                      <span className="text-gray-300">{item.label}</span>
                      
                      {item.type === 'toggle' && (
                        <Switch
                          checked={settings[item.key]}
                          onCheckedChange={() => handleToggle(item.key)}
                        />
                      )}
                      
                      {item.type === 'select' && (
                        <Select 
                          value={settings[item.key]} 
                          onValueChange={(value) => handleSelect(item.key, value)}
                        >
                          <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a2e] border-white/10">
                            {item.options.map((option) => (
                              <SelectItem key={option} value={option} className="text-white">
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      {item.type === 'button' && (
                        <button 
                          onClick={handleExportData}
                          className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm">Export</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {/* Analytics Section */}
          {totalSavings > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Total Savings</h3>
                  <p className="text-sm text-gray-400">From price optimizations</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-3">
                <div className="text-3xl font-bold text-green-400 mb-1">
                  ${totalSavings.toFixed(2)}
                </div>
                <p className="text-sm text-gray-400">Saved from {allPriceHistory.length} price changes</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-red-400 text-lg font-semibold">{priceIncreases}</div>
                  <div className="text-xs text-gray-500">Increases</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-green-400 text-lg font-semibold">{priceDecreases}</div>
                  <div className="text-xs text-gray-500">Decreases</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-blue-400 text-lg font-semibold">{switches}</div>
                  <div className="text-xs text-gray-500">Switches</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Data & Backup Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Download className="w-4 h-4 text-green-400" />
              </div>
              <span className="font-medium">Data & Backup</span>
            </div>

            <div className="divide-y divide-white/5">
              <button 
                onClick={handleExportData}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-gray-300">Export backup</span>
                <Download className="w-4 h-4 text-gray-500" />
              </button>
              <div className="p-4">
                <p className="text-xs text-gray-500">
                  Export all your subscription data as JSON. You can re-import this file later to restore your data.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Lists Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4"
          >
            <ListManagement />
          </motion.div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-blue-400" />
              </div>
              <span className="font-medium">About</span>
            </div>

            <div className="divide-y divide-white/5">
              <button className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors">
                <span className="text-gray-300">Help & Support</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
              <button className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors">
                <span className="text-gray-300">Privacy Policy</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
              <button className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors">
                <span className="text-gray-300">Terms of Service</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
              <div className="flex items-center justify-between p-4">
                <span className="text-gray-300">Version</span>
                <span className="text-gray-500">1.0.0</span>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <Trash2 className="w-5 h-5 text-red-400" />
              <span className="font-medium text-red-400">Danger Zone</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Permanently delete all your subscription data. This action cannot be undone.
            </p>
            <button className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm hover:bg-red-500/30 transition-colors">
              Delete All Data
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}