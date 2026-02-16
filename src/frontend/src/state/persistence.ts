// Persistence layer connecting app store to IndexedDB with validation and fallback to defaults for new fields

import type { AppState } from '../domain/attendanceTypes';
import { DEFAULT_STATE, DEFAULT_SETTINGS } from '../domain/attendanceTypes';
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
    
    // Merge settings with defaults to ensure new fields are populated
    // Merge user profile and gamification fields with defaults
    return {
      ...state,
      settings: {
        ...DEFAULT_SETTINGS,
        ...state.settings,
      },
      userProfile: state.userProfile || null,
      streakMilestones: state.streakMilestones || [],
    };
  } catch (error) {
    console.error('Failed to load state:', error);
    return null;
  }
}
