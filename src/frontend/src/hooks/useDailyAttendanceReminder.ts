// Hook for daily attendance reminder at 7:00 PM with robust scheduling and click handling

import { useEffect, useRef } from 'react';
import { sendNotification } from '../notifications/notificationsApi';
import { getReminderFailureMessage } from '../notifications/reminderFailureFeedback';
import { getTodayString } from '../lib/utils';
import { toast } from 'sonner';
import type { ClassEvent, AppSettings } from '../domain/attendanceTypes';

interface UseDailyAttendanceReminderProps {
  events: ClassEvent[];
  settings: AppSettings;
  onReminderSent: (date: string) => void;
  onNotificationClick?: () => void;
}

export function useDailyAttendanceReminder({
  events,
  settings,
  onReminderSent,
  onNotificationClick,
}: UseDailyAttendanceReminderProps) {
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Clean up any existing interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }

    // Only run if notifications are enabled AND streak reminders are on
    if (!settings.enableNotifications || !settings.notificationPreferences.streakReminders) {
      return;
    }

    const checkAndSendReminder = async () => {
      // Guard: component unmounted
      if (!isMountedRef.current) {
        return;
      }

      const today = getTodayString();
      const now = new Date();
      const currentHour = now.getHours();

      // Only check at or after 7:00 PM (19:00)
      if (currentHour < 19) {
        return;
      }

      // Check if reminder already sent today
      if (settings.lastReminderDate === today) {
        return;
      }

      // Check if today's attendance is marked
      const hasTodayAttendance = events.some(event => event.date === today);

      if (!hasTodayAttendance) {
        // Send reminder notification with exact required strings
        const result = await sendNotification(
          'Attendance Not Marked 📢',
          {
            body: "You haven't marked today's attendance. Tap to update now.",
            tag: 'daily-attendance-reminder',
          },
          true,
          onNotificationClick
        );

        if (result.success) {
          // Mark reminder as sent for today
          if (isMountedRef.current) {
            onReminderSent(today);
          }
        } else {
          // Show user-friendly error message (rate-limited)
          const message = getReminderFailureMessage(result.reason);
          if (message && isMountedRef.current) {
            toast.error(message, { duration: 5000 });
          }
        }
      }
    };

    // Check immediately
    checkAndSendReminder();

    // Check every 30 minutes
    checkIntervalRef.current = setInterval(checkAndSendReminder, 30 * 60 * 1000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [events, settings.enableNotifications, settings.notificationPreferences.streakReminders, settings.lastReminderDate, onReminderSent, onNotificationClick]);
}
