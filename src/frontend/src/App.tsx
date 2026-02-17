// Main app component with daily reminder integration, mark-today sheet control at app level, and notification click handling

import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useAppStore } from './state/appStore';
import { ErrorBoundary } from './components/system/ErrorBoundary';
import { InitialLoadSplash } from './components/system/InitialLoadSplash';
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
import { Toaster } from '@/components/ui/sonner';
import { initializeTheme } from './theme/themeManager';
import { useActor } from './hooks/useActor';
import { useDailyAttendanceReminder } from './hooks/useDailyAttendanceReminder';
import type { UserProfile as DomainUserProfile, ClassEvent } from './domain/attendanceTypes';
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
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSyncingProfile, setIsSyncingProfile] = useState(false);
  const [isMarkTodayOpen, setIsMarkTodayOpen] = useState(false);
  
  // Cancellation flag to prevent post-logout sync
  const syncCancelledRef = useRef(false);

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme(state.settings);
  }, []);

  // Apply theme changes
  useEffect(() => {
    initializeTheme(state.settings);
  }, [state.settings.theme, state.settings.themeVariant]);

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
        // Only log error if not cancelled
        if (!syncCancelledRef.current) {
          console.error('Failed to sync profile to backend:', error);
        }
      } finally {
        setIsSyncingProfile(false);
      }
    };

    syncProfileToBackend();
  }, [actor, state.userProfile?.displayName]);

  // Daily attendance reminder with notification click handler
  const handleReminderSent = (date: string) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { lastReminderDate: date },
    });
  };

  const handleReminderNotificationClick = () => {
    // Focus window
    window.focus();
    
    // Navigate to home if not already there
    if (route.type !== 'home') {
      setRoute({ type: 'home' });
    }
    
    // Open mark today sheet
    setIsMarkTodayOpen(true);
  };

  useDailyAttendanceReminder({
    events: state.events,
    settings: state.settings,
    onReminderSent: handleReminderSent,
    onNotificationClick: handleReminderNotificationClick,
  });

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (newRoute: Route) => {
    setRoute(newRoute);
  };

  const handleTabChange = (tab: 'home' | 'timetable' | 'stats' | 'rank' | 'settings') => {
    setRoute({ type: tab });
  };

  const handleLogin = (profile: DomainUserProfile) => {
    dispatch({ type: 'SET_USER_PROFILE', payload: profile });
  };

  const handleBackToHome = () => {
    setRoute({ type: 'home' });
  };

  const handleSaveAttendance = (events: ClassEvent[]) => {
    dispatch({ type: 'ADD_EVENTS', payload: events });
    setIsMarkTodayOpen(false);
  };

  if (isInitializing) {
    return <InitialLoadSplash />;
  }

  // Login gate
  if (!state.userProfile) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const currentTab = route.type === 'subject-details' ? 'home' : route.type;

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        {route.type === 'home' && (
          <HomeDashboardPage 
            onNavigate={handleNavigate}
            onOpenMarkToday={() => setIsMarkTodayOpen(true)}
          />
        )}
        {route.type === 'subject-details' && (
          <SubjectDetailsPage subjectId={route.subjectId} onBack={handleBackToHome} />
        )}
        {route.type === 'timetable' && <TimetablePage />}
        {route.type === 'stats' && <StatsPage />}
        {route.type === 'rank' && <RankPage />}
        {route.type === 'settings' && <SettingsPage />}
      </div>
      <BottomNav activeTab={currentTab} onTabChange={handleTabChange} />
      
      {/* App-level Mark Today Sheet */}
      <MarkTodaySheet
        open={isMarkTodayOpen}
        onOpenChange={setIsMarkTodayOpen}
        subjects={state.subjects}
        timetable={state.timetable}
        onSave={handleSaveAttendance}
      />
    </AppShell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
        <Toaster />
      </AppProvider>
    </ErrorBoundary>
  );
}
