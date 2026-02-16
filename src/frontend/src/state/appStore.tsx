// Global app state management using React Context with automatic persistence and logout support
import React, { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react';
import type { AppState, Subject, ClassEvent, TimetableSlot, ClassExchange, AppSettings } from '../domain/attendanceTypes';
import { DEFAULT_STATE } from '../domain/attendanceTypes';
import { attendanceReducer, type AttendanceAction } from '../domain/attendanceReducer';
import { loadState, saveState } from './persistence';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AttendanceAction>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(attendanceReducer, DEFAULT_STATE);
  const [isLoading, setIsLoading] = React.useState(true);
  const isResettingRef = useRef(false);

  // Load state on mount
  useEffect(() => {
    let cancelled = false;
    
    loadState()
      .then(loadedState => {
        if (!cancelled && loadedState) {
          dispatch({ type: 'RESTORE_STATE', payload: loadedState });
        }
      })
      .catch(error => {
        console.error('Failed to load state:', error);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, []);

  // Save state on changes (debounced), but skip saving immediately after RESET_ALL
  useEffect(() => {
    if (isLoading) return;
    
    // Check if this is a reset action
    if (state === DEFAULT_STATE && !isResettingRef.current) {
      isResettingRef.current = true;
      // Don't save the reset state immediately
      return;
    }
    
    // Reset the flag after the first render following a reset
    if (isResettingRef.current && state !== DEFAULT_STATE) {
      isResettingRef.current = false;
    }
    
    const timeoutId = setTimeout(() => {
      if (!isResettingRef.current) {
        saveState(state).catch(error => {
          console.error('Failed to save state:', error);
        });
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [state, isLoading]);

  return (
    <AppContext.Provider value={{ state, dispatch, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppProvider');
  }
  return context;
}
