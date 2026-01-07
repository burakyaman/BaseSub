import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Home, Calendar, Sparkles, Settings, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import NotificationCenter from './components/notifications/NotificationCenter';
import { useNotifications } from './components/notifications/useNotifications';
import { useQuery } from '@tanstack/react-query';

const navItems = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Calendar', icon: Calendar, page: 'CalendarPage' },
  { name: 'Insights', icon: Sparkles, page: 'Insights' },
  { name: 'Settings', icon: Settings, page: 'Settings' },
];

export default function Layout({ children, currentPageName }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Notification Bell - Top Right */}
      <div className="fixed top-4 right-4 z-30">
        <button
          onClick={() => setShowNotifications(true)}
          className="relative w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <Bell className="w-5 h-5 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-lg mx-auto px-4 pb-4">
          <div className="bg-[#12121a]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-2 py-2">
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className="relative flex flex-col items-center py-2 px-4"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white/10 rounded-xl"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <Icon 
                      className={`relative w-5 h-5 transition-colors ${
                        isActive ? 'text-green-400' : 'text-gray-500'
                      }`}
                    />
                    <span 
                      className={`relative text-xs mt-1 transition-colors ${
                        isActive ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}