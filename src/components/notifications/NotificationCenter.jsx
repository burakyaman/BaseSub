import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Calendar, AlertCircle, Check } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function NotificationCenter({ isOpen, onClose }) {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return user.notifications || [];
    },
    enabled: isOpen,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const user = await base44.auth.me();
      const updatedNotifications = (user.notifications || []).map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      await base44.auth.updateMe({ notifications: updatedNotifications });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe({ notifications: [] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 400 }}
            animate={{ y: 0 }}
            exit={{ y: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0a0a0f] w-full max-w-lg h-[80vh] flex flex-col rounded-t-3xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                {unreadNotifications.length > 0 && (
                  <p className="text-sm text-gray-500">{unreadNotifications.length} unread</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={() => clearAllMutation.mutate()}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <Bell className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border transition-colors ${
                      notification.read
                        ? 'bg-white/5 border-white/10'
                        : 'bg-purple-500/10 border-purple-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          notification.type === 'payment'
                            ? 'bg-orange-500/20'
                            : notification.type === 'trial'
                            ? 'bg-green-500/20'
                            : 'bg-blue-500/20'
                        }`}
                      >
                        {notification.type === 'payment' ? (
                          <Calendar className="w-5 h-5 text-orange-400" />
                        ) : notification.type === 'trial' ? (
                          <AlertCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Bell className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">{notification.title}</h3>
                        <p className="text-sm text-gray-400 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-600">
                          {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}