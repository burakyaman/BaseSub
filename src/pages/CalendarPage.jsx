import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { X, Calendar } from 'lucide-react';

import CalendarView from '@/components/subscriptions/CalendarView';
import SubscriptionCard from '@/components/subscriptions/SubscriptionCard';

export default function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [daySubscriptions, setDaySubscriptions] = useState([]);

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-next_billing_date'),
  });

  const handleDayClick = (date, subs) => {
    setSelectedDay(date);
    setDaySubscriptions(subs);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d2847] to-[#0f3460] text-white">
      {/* Underwater background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Light rays */}
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
            <Calendar className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-sm text-gray-500">View all your renewals</p>
          </div>
        </motion.div>

        {/* Calendar */}
        {isLoading ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl h-96 animate-pulse" />
        ) : (
          <CalendarView
            subscriptions={subscriptions}
            onDayClick={handleDayClick}
          />
        )}

        {/* Selected Day Modal */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center p-4"
              onClick={() => setSelectedDay(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-gradient-to-b from-[#0d2847]/95 to-[#0a1628]/95 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/20"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div>
                    <h3 className="font-semibold text-white">
                      {format(selectedDay, 'EEEE, MMMM d')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {daySubscriptions.length} renewal{daySubscriptions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedDay(null)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                  {daySubscriptions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No renewals on this day</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {daySubscriptions.map((subscription) => (
                        <SubscriptionCard
                          key={subscription.id}
                          subscription={subscription}
                        />
                      ))}
                      
                      {/* Total */}
                      <div className="flex items-center justify-between p-4 bg-cyan-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl mt-4">
                        <span className="text-white/70">Total</span>
                        <span className="text-xl font-bold text-cyan-400">
                          ${daySubscriptions.reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}