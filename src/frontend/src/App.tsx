// Main app with local-date-safe once-per-day attendance enforcement via DailyAttendance master record, synchronized ClassEvent updates using date-scoped replacement, and backend conflict handling

import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useAppStore } from './state/appStore';
import { ErrorBoundary } from './components/system/ErrorBoundary';
import { AppShell } from './components/layout/AppShell';
import { BottomNav } from './components/navigation/BottomNav';
import { LoginPage } from './pages/LoginPage';
import { HomeDashboardPage } from './pages/HomeDashboardPage';
import { SubjectDetailsPage } from './pages/SubjectDetailsPage';
import { TimetablePage } from './pages/TimetablePage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { RankPage } from './rank/RankPage';
import { MarkTodaySheet } from './components/markToday/MarkTodaySheet';
import { MarkPastAttendanceSheet } from './components/pastAttendance/MarkPastAttendanceSheet';
import { Toaster } from '@/components/ui/sonner';
import { applyTheme } from './theme/themeManager';
import { useActor } from './hooks/useActor';
import { useDailyAttendanceReminder } from './hooks/useDailyAttendanceReminder';
import { classifyAttendanceError } from './lib/attendanceConflictHandling';
import { getTodayString } from './lib/utils';
import { toast } from 'sonner';
import type { UserProfile as DomainUserProfile, ClassEvent, DailyAttendance } from './domain/attendanceTypes';
import type { UserProfile as BackendUserProfile } from './backend';

type Route = 
  | { type: 'home' }
  | { type: 'timetable' }
  | { type: 'stats' }
  | { type: 'rank' }
  | { type: 'settings' }
  | { type: 'subject-details'; subjectId: string };

function AppContent() {
  const { state, dispatch } = useAppStore();
  const { actor } = useActor();
  const [route, setRoute] = useState<Route>({ type: 'home' });
  const [isSyncingProfile, setIsSyncingProfile] = useState(false);
  const [isMarkTodayOpen, setIsMarkTodayOpen] = useState(false);
  const [isMarkPastOpen, setIsMarkPastOpen] = useState(false);
  
  // Cancellation flag to prevent post-logout sync
  const syncCancelledRef = useRef(false);

  const todayString = getTodayString();
  const isTodayMarked = !!state.dailyAttendance[todayString];

  // Clean up service worker and cache on mount to prevent stale splash artifacts
  useEffect(() => {
    const cleanupServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        } catch (error) {
          console.warn('Failed to unregister service workers:', error);
        }
      }

      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        } catch (error) {
          console.warn('Failed to clear caches:', error);
        }
      }
    };

    cleanupServiceWorker();
  }, []);

  // Initialize theme on mount (always dark)
  useEffect(() => {
    applyTheme(state.settings);
  }, []);

  // Apply theme variant changes (mode is always dark)
  useEffect(() => {
    applyTheme(state.settings);
  }, [state.settings.themeVariant]);

  // Reset cancellation flag when user logs in
  useEffect(() => {
    if (state.userProfile) {
      syncCancelledRef.current = false;
    } else {
      // User logged out - cancel any in-flight sync
      syncCancelledRef.current = true;
    }
  }, [state.userProfile]);

  // Sync profile to backend after login with cancellation support
  useEffect(() => {
    const syncProfileToBackend = async () => {
      // Guard: Don't sync if no actor, no profile, already syncing, or cancelled
      if (!actor || !state.userProfile || isSyncingProfile || syncCancelledRef.current) {
        return;
      }

      setIsSyncingProfile(true);

      try {
        // Check cancellation before async operation
        if (syncCancelledRef.current) {
          return;
        }

        const backendProfile: BackendUserProfile = {
          displayName: state.userProfile.displayName,
          college: 'Unknown',
          email: 'unknown@example.com',
        };

        await actor.saveCallerUserProfile(backendProfile);

        // Check cancellation after async operation
        if (syncCancelledRef.current) {
          return;
        }

        console.log('Profile synced to backend successfully');
      } catch (error) {
        console.error('Failed to sync profile to backend:', error);
      } finally {
        setIsSyncingProfile(false);
      }
    };

    syncProfileToBackend();
  }, [actor, state.userProfile, isSyncingProfile]);

  // Daily attendance reminder
  useDailyAttendanceReminder({
    events: state.events,
    settings: state.settings,
    onReminderSent: (date: string) => {
      dispatch({
        type: 'UPDATE_SETTINGS',
        payload: { lastReminderDate: date },
      });
    },
    onNotificationClick: () => setIsMarkTodayOpen(true),
  });

  const handleLogin = (profile: DomainUserProfile) => {
    dispatch({ type: 'SET_USER_PROFILE', payload: profile });
  };

  const handleMarkToday = async (events: ClassEvent[]) => {
    if (!actor) {
      toast.error('Backend not available');
      return;
    }

    // Guard: Check if already marked
    if (isTodayMarked) {
      const result = classifyAttendanceError(
        new Error('Attendance already marked for today.'),
        todayString,
        true
      );
      toast.error(result.userMessage);
      return;
    }

    try {
      // Step 1: Create master record
      await actor.createDailyAttendanceRecord(todayString);

      // Step 2: Update local state with unsynced master record
      const masterRecord: DailyAttendance = {
        date: todayString,
        timestamp: Date.now(),
        courseCount: events.length,
        isSynced: false,
      };

      dispatch({
        type: 'UPSERT_DAILY_ATTENDANCE',
        payload: masterRecord,
      });

      // Step 3: Replace events for today (date-scoped)
      dispatch({
        type: 'REPLACE_EVENTS_FOR_DATE',
        payload: { date: todayString, events },
      });

      // Step 4: Sync to backend
      await actor.updateDailyAttendanceRecord(todayString, BigInt(events.length));

      // Step 5: Mark as synced
      dispatch({
        type: 'UPSERT_DAILY_ATTENDANCE',
        payload: { ...masterRecord, isSynced: true },
      });

      toast.success('Attendance marked successfully');
      setIsMarkTodayOpen(false);
    } catch (error: any) {
      console.error('Failed to mark attendance:', error);
      const result = classifyAttendanceError(error, todayString, true);
      toast.error(result.userMessage);
    }
  };

  const handleMarkPast = async (date: string, events: ClassEvent[]) => {
    if (!actor) {
      toast.error('Backend not available');
      return;
    }

    const isAlreadyMarked = !!state.dailyAttendance[date];

    try {
      if (!isAlreadyMarked) {
        // Step 1: Create master record
        await actor.createDailyAttendanceRecord(date);
      }

      // Step 2: Update local state with unsynced master record
      const masterRecord: DailyAttendance = {
        date,
        timestamp: Date.now(),
        courseCount: events.length,
        isSynced: false,
      };

      dispatch({
        type: 'UPSERT_DAILY_ATTENDANCE',
        payload: masterRecord,
      });

      // Step 3: Replace events for the date (date-scoped)
      dispatch({
        type: 'REPLACE_EVENTS_FOR_DATE',
        payload: { date, events },
      });

      // Step 4: Sync to backend
      await actor.updateDailyAttendanceRecord(date, BigInt(events.length));

      // Step 5: Mark as synced
      dispatch({
        type: 'UPSERT_DAILY_ATTENDANCE',
        payload: { ...masterRecord, isSynced: true },
      });

      toast.success('Attendance updated successfully');
      setIsMarkPastOpen(false);
    } catch (error: any) {
      console.error('Failed to mark past attendance:', error);
      const result = classifyAttendanceError(error, date, false);
      toast.error(result.userMessage);
    }
  };

  const handleNavigate = (routeData: Route) => {
    setRoute(routeData);
  };

  const handleTabChange = (tab: 'home' | 'timetable' | 'stats' | 'rank' | 'settings') => {
    setRoute({ type: tab });
  };

  // Show login page if no user profile
  if (!state.userProfile) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <AppShell>
        {route.type === 'home' && (
          <HomeDashboardPage
            onNavigate={handleNavigate}
            onOpenMarkToday={() => setIsMarkTodayOpen(true)}
          />
        )}
        {route.type === 'subject-details' && (
          <SubjectDetailsPage
            subjectId={route.subjectId}
            onBack={() => setRoute({ type: 'home' })}
          />
        )}
        {route.type === 'timetable' && <TimetablePage />}
        {route.type === 'stats' && <StatsPage />}
        {route.type === 'rank' && <RankPage />}
        {route.type === 'settings' && <SettingsPage />}

        <BottomNav
          activeTab={route.type === 'subject-details' ? 'home' : route.type}
          onTabChange={handleTabChange}
        />
      </AppShell>

      <MarkTodaySheet
        open={isMarkTodayOpen}
        onOpenChange={setIsMarkTodayOpen}
        subjects={state.subjects}
        timetable={state.timetable}
        exchanges={state.exchanges}
        onSave={handleMarkToday}
        isAlreadyMarked={isTodayMarked}
      />

      <MarkPastAttendanceSheet
        open={isMarkPastOpen}
        onOpenChange={setIsMarkPastOpen}
        subjects={state.subjects}
        timetable={state.timetable}
        exchanges={state.exchanges}
        existingEvents={state.events}
        onSave={handleMarkPast}
      />

      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
