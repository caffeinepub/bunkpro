// Persistence layer with backward-compatible DailyAttendance field merging and theme normalization for safe IndexedDB loading

import type { AppState } from '../domain/attendanceTypes';
import { DEFAULT_STATE, DEFAULT_SETTINGS, DEFAULT_NOTIFICATION_PREFERENCES } from '../domain/attendanceTypes';
import { saveToIndexedDB, loadFromIndexedDB } from '../storage/indexedDbClient';

export async function saveState(state: AppState): Promise<void> {
  try {
    await saveToIndexedDB(state);
  } catch (error) {
    console.error('Failed to persist state:', error);
    throw error;
  }
}

export async function loadState(): Promise<AppState | null> {
  try {
    const state = await loadFromIndexedDB();
    
    if (!state) {
      return null;
    }
    
    // Validate loaded state
    if (!state.subjects || !state.events || !state.settings) {
      console.warn('Invalid state structure, using defaults');
      return DEFAULT_STATE;
    }
    
    // Normalize theme to 'dark' if it's 'light' or 'system'
    const normalizedTheme = (state.settings.theme === 'light' || state.settings.theme === 'system') 
      ? 'dark' 
      : state.settings.theme;
    
    // Merge settings with defaults to ensure new fields are populated
    // Merge notification preferences with defaults
    return {
      ...state,
      settings: {
        ...DEFAULT_SETTINGS,
        ...state.settings,
        theme: normalizedTheme,
        notificationPreferences: {
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          ...(state.settings.notificationPreferences || {}),
        },
        lastReminderDate: state.settings.lastReminderDate || null,
      },
      userProfile: state.userProfile || null,
      streakMilestones: state.streakMilestones || [],
      dailyAttendance: state.dailyAttendance || {},
    };
  } catch (error) {
    console.error('Failed to load state:', error);
    return null;
  }
}
