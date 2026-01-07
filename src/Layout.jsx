import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Home, Calendar, PieChart, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Calendar', icon: Calendar, page: 'CalendarPage' },
  { name: 'Analytics', icon: PieChart, page: 'Analytics' },
  { name: 'Settings', icon: Settings, page: 'Settings' },
];

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d2847] to-[#0f3460]">
      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-lg mx-auto px-4 pb-4">
          <div className="bg-gradient-to-r from-[#0d2847]/90 via-[#0a1628]/90 to-[#0d2847]/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl px-2 py-2 shadow-lg shadow-cyan-500/10">
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
                        className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-xl border border-cyan-500/40 shadow-lg shadow-cyan-500/20"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <Icon 
                      className={`relative w-5 h-5 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-white/40'
                      }`}
                    />
                    <span 
                      className={`relative text-xs mt-1 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-white/40'
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