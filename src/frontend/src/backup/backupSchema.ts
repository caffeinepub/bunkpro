// Backup schema with backward-compatible DailyAttendance field migration and theme normalization for safe restore

import type { AppState } from '../domain/attendanceTypes';
import { DEFAULT_SETTINGS, DEFAULT_NOTIFICATION_PREFERENCES } from '../domain/attendanceTypes';

export interface BackupData {
  version: number;
  timestamp: number;
  appName: string;
  data: AppState;
}

export function createBackup(state: AppState): BackupData {
  return {
    version: 1,
    timestamp: Date.now(),
    appName: 'BunkPro',
    data: state,
  };
}

export function validateBackup(data: unknown): data is BackupData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  
  const backup = data as Partial<BackupData>;
  
  if (typeof backup.version !== 'number') return false;
  if (typeof backup.timestamp !== 'number') return false;
  if (backup.appName !== 'BunkPro') return false;
  if (!backup.data) return false;
  
  const appData = backup.data;
  if (!Array.isArray(appData.subjects)) return false;
  if (!Array.isArray(appData.events)) return false;
  if (!Array.isArray(appData.timetable)) return false;
  if (!appData.settings) return false;
  
  return true;
}

export function migrateBackup(backup: BackupData): AppState {
  // Normalize theme to 'dark' if it's 'light' or 'system'
  const normalizedTheme = (backup.data.settings.theme === 'light' || backup.data.settings.theme === 'system') 
    ? 'dark' 
    : backup.data.settings.theme;
  
  // Future-proof: handle version migrations
  // Merge with DEFAULT_SETTINGS and default gamification/notification/reminder/dailyAttendance fields
  if (backup.version === 1) {
    return {
      ...backup.data,
      settings: {
        ...DEFAULT_SETTINGS,
        ...backup.data.settings,
        theme: normalizedTheme,
        notificationPreferences: {
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          ...(backup.data.settings.notificationPreferences || {}),
        },
        lastReminderDate: backup.data.settings.lastReminderDate || null,
      },
      userProfile: backup.data.userProfile || null,
      streakMilestones: backup.data.streakMilestones || [],
      dailyAttendance: backup.data.dailyAttendance || {},
    };
  }
  
  return backup.data;
}
