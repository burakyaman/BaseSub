import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';

export default function CalendarView({ subscriptions = [], onDayClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getSubscriptionsForDate = (date) => {
    return subscriptions.filter(sub => {
      if (sub.status === 'cancelled') return false;
      const billingDate = new Date(sub.next_billing_date);
      return isSameDay(billingDate, date);
    });
  };

  const getTotalForDate = (date) => {
    const subs = getSubscriptionsForDate(date);
    return subs.reduce((sum, sub) => sum + (sub.price || 0), 0);
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-all duration-300"
        >
          <ChevronLeft className="w-5 h-5 text-cyan-400" />
        </button>
        <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-all duration-300"
        >
          <ChevronRight className="w-5 h-5 text-cyan-400" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map(day => (
          <div key={day} className="text-center text-xs text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const daySubscriptions = getSubscriptionsForDate(day);
        const total = getTotalForDate(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <motion.div
            key={day.toISOString()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDayClick && onDayClick(cloneDay, daySubscriptions)}
            className={`
              relative min-h-[60px] p-1 rounded-lg cursor-pointer transition-all duration-300
              ${isCurrentMonth ? 'bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/20' : 'bg-transparent'}
              ${isToday ? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/30' : ''}
            `}
          >
            <span className={`
              text-xs font-medium
              ${isCurrentMonth ? 'text-white' : 'text-white/30'}
              ${isToday ? 'text-cyan-400 font-bold' : ''}
            `}>
              {format(day, 'd')}
            </span>

            {daySubscriptions.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {daySubscriptions.slice(0, 2).map((sub, idx) => (
                  <div 
                    key={sub.id || idx}
                    className="w-full h-1.5 rounded-full"
                    style={{ backgroundColor: sub.color || '#22c55e' }}
                  />
                ))}
                {daySubscriptions.length > 2 && (
                  <span className="text-[10px] text-gray-400">
                    +{daySubscriptions.length - 2}
                  </span>
                )}
              </div>
            )}

            {total > 0 && (
              <div className="absolute bottom-1 right-1">
                <span className="text-[10px] text-cyan-400 font-medium">
                  ${total.toFixed(0)}
                </span>
              </div>
            )}
          </motion.div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toISOString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="space-y-1">{rows}</div>;
  };

  // Calculate monthly total
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const monthlyTotal = subscriptions
    .filter(sub => {
      if (sub.status === 'cancelled') return false;
      const date = new Date(sub.next_billing_date);
      return date >= monthStart && date <= monthEnd;
    })
    .reduce((sum, sub) => sum + (sub.price || 0), 0);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 shadow-xl shadow-cyan-500/10">
      {renderHeader()}
      
      {/* Monthly summary */}
      <div className="flex items-center justify-between mb-4 px-2 py-3 bg-cyan-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl">
        <span className="text-sm text-white/70">This month</span>
        <span className="text-lg font-bold text-cyan-400">${monthlyTotal.toFixed(2)}</span>
      </div>

      {renderDays()}
      {renderCells()}
    </div>
  );
}