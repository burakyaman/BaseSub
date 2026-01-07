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
  Trash2
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const settingsSections = [
  {
    title: 'Notifications',
    icon: Bell,
    color: '#f97316',
    items: [
      { key: 'renewal_reminders', label: 'Renewal Reminders', type: 'toggle', default: true },
      { key: 'trial_alerts', label: 'Trial End Alerts', type: 'toggle', default: true },
      { key: 'reminder_timing', label: 'Remind Before', type: 'select', options: ['1 day', '3 days', '1 week'], default: '3 days' },
    ]
  },
  {
    title: 'Display',
    icon: Palette,
    color: '#a855f7',
    items: [
      { key: 'currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'], default: 'USD' },
      { key: 'dark_mode', label: 'Dark Mode', type: 'toggle', default: true },
    ]
  },
  {
    title: 'Data',
    icon: Download,
    color: '#22c55e',
    items: [
      { key: 'export', label: 'Export Data', type: 'button' },
    ]
  },
];

export default function Settings() {
  const [settings, setSettings] = useState({
    renewal_reminders: true,
    trial_alerts: true,
    reminder_timing: '3 days',
    currency: 'USD',
    dark_mode: true,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d2847] to-[#0f3460] text-white">
      {/* Underwater background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-cyan-400/15 via-cyan-400/5 to-transparent transform -skew-x-12" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-cyan-400/15 via-cyan-400/5 to-transparent transform skew-x-12" />
      </div>
      
      <div className="relative max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 backdrop-blur-xl border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <SettingsIcon className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-gray-500">Customize your experience</p>
          </div>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section, sectionIndex) => {
            const Icon = section.icon;
            
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/10"
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
                        <button className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-1">
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

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/10"
            >
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 backdrop-blur-xl border border-cyan-500/30 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
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
            className="bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-2xl p-4 shadow-lg shadow-red-500/10"
            >
            <div className="flex items-center gap-3 mb-3">
              <Trash2 className="w-5 h-5 text-red-400" />
              <span className="font-medium text-red-400">Danger Zone</span>
            </div>
            <p className="text-sm text-white/60 mb-4">
              Permanently delete all your subscription data. This action cannot be undone.
            </p>
            <button className="px-4 py-2 bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-xl text-red-400 text-sm hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
              Delete All Data
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}