import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { differenceInDays, format } from 'date-fns';

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const notifications = user.notifications || [];
      return notifications.filter(n => !n.read).length;
    },
  });

  useEffect(() => {
    const checkAndCreateNotifications = async () => {
      if (!subscriptions.length || !user) return;

      const notificationPrefs = user.notification_preferences || {
        enabled: true,
        email_enabled: true,
        in_app_enabled: true,
        reminder_days: [3, 1],
      };

      if (!notificationPrefs.in_app_enabled && !notificationPrefs.email_enabled) return;

      const existingNotifications = user.notifications || [];
      const newNotifications = [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const subscription of subscriptions) {
        if (subscription.status !== 'active' && subscription.status !== 'trial') continue;

        const nextBillingDate = new Date(subscription.next_billing_date);
        nextBillingDate.setHours(0, 0, 0, 0);

        const daysUntil = differenceInDays(nextBillingDate, today);

        // Check if we should create a notification
        if (notificationPrefs.reminder_days.includes(daysUntil)) {
          const notificationId = `${subscription.id}-${daysUntil}`;
          
          // Check if notification already exists
          const exists = existingNotifications.some(n => n.id === notificationId);
          
          if (!exists) {
            const notification = {
              id: notificationId,
              subscription_id: subscription.id,
              type: subscription.status === 'trial' ? 'trial' : 'payment',
              title: subscription.status === 'trial' 
                ? `Free trial ending soon`
                : `Payment due soon`,
              message: subscription.status === 'trial'
                ? `Your ${subscription.name} trial ends in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}. It will auto-renew for $${subscription.price}.`
                : `${subscription.name} payment of $${subscription.price} due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}.`,
              created_at: new Date().toISOString(),
              read: false,
            };

            newNotifications.push(notification);

            // Send email if enabled
            if (notificationPrefs.email_enabled && user.email) {
              try {
                await base44.integrations.Core.SendEmail({
                  to: user.email,
                  subject: notification.title,
                  body: `
                    <h2>${notification.title}</h2>
                    <p>${notification.message}</p>
                    <p>Payment date: ${format(nextBillingDate, 'MMMM d, yyyy')}</p>
                    <p>Amount: $${subscription.price}</p>
                  `,
                });
              } catch (error) {
                console.error('Failed to send email notification:', error);
              }
            }
          }
        }
      }

      // Save new notifications to user
      if (newNotifications.length > 0) {
        const allNotifications = [...existingNotifications, ...newNotifications]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 50); // Keep only last 50 notifications

        await base44.auth.updateMe({ notifications: allNotifications });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      }
    };

    checkAndCreateNotifications();

    // Check every hour
    const interval = setInterval(checkAndCreateNotifications, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [subscriptions, user, queryClient]);

  return { unreadCount };
}