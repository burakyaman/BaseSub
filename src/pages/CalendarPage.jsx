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
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/10 pointer-events-none" />
      
      <div className="relative max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-sm text-gray-500">View all your renewals</p>
          </div>
        </motion.div>

        {/* Calendar */}
        {isLoading ? (
          <div className="bg-white/5 rounded-2xl h-96 animate-pulse" />
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
                className="w-full max-w-lg bg-[#12121a] border border-white/10 rounded-3xl overflow-hidden"
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
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl mt-4">
                        <span className="text-gray-400">Total</span>
                        <span className="text-xl font-bold text-green-400">
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