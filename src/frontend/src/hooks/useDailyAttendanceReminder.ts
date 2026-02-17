// Hook for daily attendance reminder at 7:00 PM

import { useEffect, useRef } from 'react';
import { sendNotification } from '../notifications/notificationsApi';
import { getTodayString } from '../lib/utils';
import type { ClassEvent, AppSettings } from '../domain/attendanceTypes';

interface UseDailyAttendanceReminderProps {
  events: ClassEvent[];
  settings: AppSettings;
  onReminderSent: (date: string) => void;
}

export function useDailyAttendanceReminder({
  events,
  settings,
  onReminderSent,
}: UseDailyAttendanceReminderProps) {
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run if notifications are enabled and streak reminders are on
    if (!settings.enableNotifications || !settings.notificationPreferences.streakReminders) {
      return;
    }

    const checkAndSendReminder = async () => {
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
        // Send reminder notification
        const result = await sendNotification(
          'Attendance Not Marked 📢',
          {
            body: "You haven't marked today's attendance. Tap to update now.",
            tag: 'daily-attendance-reminder',
          },
          true
        );

        if (result.success) {
          // Mark reminder as sent for today
          onReminderSent(today);
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
      }
    };
  }, [events, settings, onReminderSent]);
}
