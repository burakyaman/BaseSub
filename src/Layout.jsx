import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Circle, Calendar, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import NotificationCenter from './components/notifications/NotificationCenter';
import { useNotifications } from './components/notifications/useNotifications';
import { useQuery } from '@tanstack/react-query';

const navItems = [
  { name: 'Subscriptions', icon: Circle, page: 'Home' },
  { name: 'Calendar', icon: Calendar, page: 'CalendarPage' },
  { name: 'Settings', icon: Settings, page: 'Settings' },
];

export default function Layout({ children, currentPageName }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className="min-h-screen bg-[#0f0a1f]">
      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f0a1f]">
        <div className="max-w-lg mx-auto">
          <div className="bg-[#1a1425] border-t border-white/5">
            <div className="flex items-center justify-around px-4 py-2">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className="flex flex-col items-center py-2 px-6 transition-colors"
                  >
                    <Icon 
                      className={`w-6 h-6 mb-1 transition-colors ${
                        isActive ? 'text-white' : 'text-gray-600'
                      }`}
                    />
                    <span 
                      className={`text-xs transition-colors ${
                        isActive ? 'text-white' : 'text-gray-600'
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