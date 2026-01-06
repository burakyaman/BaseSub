import React from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = '#22c55e',
  trend,
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 overflow-hidden"
    >
      {/* Background glow */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: color }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">{title}</span>
          {Icon && (
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
          )}
        </div>

        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-white">{value}</span>
          {subtitle && (
            <span className="text-sm text-gray-500 mb-1">{subtitle}</span>
          )}
        </div>

        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trend > 0 ? 'text-red-400' : 'text-green-400'}`}>
            <span>{trend > 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(trend)}% vs last month</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}