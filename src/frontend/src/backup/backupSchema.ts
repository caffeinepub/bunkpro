// Backup file schema and validation with migration support for notification preferences

import type { AppState } from '../domain/attendanceTypes';
import { DEFAULT_SETTINGS } from '../domain/attendanceTypes';

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
  // Future-proof: handle version migrations
  // Merge with DEFAULT_SETTINGS to ensure new fields (like enableNotifications) are populated
  if (backup.version === 1) {
    return {
      ...backup.data,
      settings: {
        ...DEFAULT_SETTINGS,
        ...backup.data.settings,
      },
    };
  }
  
  return backup.data;
}
