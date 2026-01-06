import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Home, Calendar, Sparkles, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Calendar', icon: Calendar, page: 'CalendarPage' },
  { name: 'Insights', icon: Sparkles, page: 'Insights' },
  { name: 'Settings', icon: Settings, page: 'Settings' },
];

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Main Content */}
      <main>
        {children}
      </main>

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