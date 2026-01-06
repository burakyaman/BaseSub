import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-next_billing_date'),
  });

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');

  const getSubscriptionsForDate = (date) => {
    return activeSubscriptions.filter(sub => {
      const billingDate = new Date(sub.next_billing_date);
      return isSameDay(billingDate, date);
    });
  };

  const getTotalForMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return activeSubscriptions
      .filter(sub => {
        const date = new Date(sub.next_billing_date);
        return date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, sub) => sum + (sub.price || 0), 0);
  };

  const getUpcomingTotal = () => {
    const today = new Date();
    const monthEnd = endOfMonth(currentMonth);
    return activeSubscriptions
      .filter(sub => {
        const date = new Date(sub.next_billing_date);
        return date >= today && date <= monthEnd;
      })
      .reduce((sum, sub) => sum + (sub.price || 0), 0);
  };

  const renderCalendar = () => {
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
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toISOString()}
            className={`relative aspect-square flex flex-col items-center justify-start pt-2 ${
              isCurrentMonth ? '' : 'opacity-30'
            }`}
          >
            <span className={`text-sm mb-2 ${isToday ? 'text-white font-bold' : 'text-gray-400'}`}>
              {format(day, 'd')}
            </span>
            
            {daySubscriptions.length > 0 && (
              <div className="flex flex-col gap-1 items-center">
                {daySubscriptions.slice(0, 3).map((sub, idx) => (
                  <div
                    key={sub.id || idx}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: sub.color || '#22c55e' }}
                  >
                    {sub.icon_url ? (
                      <img 
                        src={sub.icon_url} 
                        alt={sub.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xs font-bold">
                        {sub.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toISOString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return rows;
  };

  const monthTotal = getTotalForMonth();
  const upcomingTotal = getUpcomingTotal();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-lg mx-auto px-5 py-6 pb-24">
        {/* Header with Today button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
          
          <button 
            onClick={() => setCurrentMonth(new Date())}
            className="px-5 py-2 bg-white/10 hover:bg-white/15 rounded-full text-white text-sm font-medium transition-colors"
          >
            Today
          </button>
        </div>

        {/* Month Title */}
        <h1 className="text-4xl font-bold mb-4">
          {format(currentMonth, 'MMMM')}
        </h1>

        {/* Totals */}
        <div className="flex items-center gap-4 mb-6">
          <div>
            <span className="text-2xl font-bold text-white">${monthTotal.toFixed(2)}</span>
            <span className="text-gray-500 ml-2">Total</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-white">${upcomingTotal.toFixed(2)}</span>
            <span className="text-gray-500 ml-2">Upcoming</span>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-sm text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-0"
        >
          {renderCalendar()}
        </motion.div>
      </div>
    </div>
  );
}