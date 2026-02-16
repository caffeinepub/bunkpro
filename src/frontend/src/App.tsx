// Main app component with 5-tab navigation, login gate, and proper profile sync to canister backend
import React, { useState, useEffect } from 'react';
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
import { Toaster } from '@/components/ui/sonner';
import { initializeTheme } from './theme/themeManager';
import { useActor } from './hooks/useActor';
import { toast } from 'sonner';
import type { UserProfile as DomainUserProfile } from './domain/attendanceTypes';
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

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme(state.settings);
  }, []);

  // Apply theme changes
  useEffect(() => {
    initializeTheme(state.settings);
  }, [state.settings.theme, state.settings.themeVariant]);

  // Sync profile to backend after login
  useEffect(() => {
    const syncProfileToBackend = async () => {
      if (!actor || !state.userProfile || isSyncingProfile) return;

      setIsSyncingProfile(true);

      try {
        const backendProfile: BackendUserProfile = {
          displayName: state.userProfile.displayName,
          college: 'Unknown', // Default value
          email: 'unknown@example.com', // Default value
        };

        await actor.saveCallerUserProfile(backendProfile);
        console.log('Profile synced to backend successfully');
      } catch (error) {
        console.error('Failed to sync profile to backend:', error);
        // Don't show error toast - this is a background sync
      } finally {
        setIsSyncingProfile(false);
      }
    };

    syncProfileToBackend();
  }, [actor, state.userProfile?.displayName]);

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
        {route.type === 'home' && <HomeDashboardPage onNavigate={handleNavigate} />}
        {route.type === 'subject-details' && (
          <SubjectDetailsPage subjectId={route.subjectId} onBack={handleBackToHome} />
        )}
        {route.type === 'timetable' && <TimetablePage />}
        {route.type === 'stats' && <StatsPage />}
        {route.type === 'rank' && <RankPage />}
        {route.type === 'settings' && <SettingsPage />}
      </div>
      <BottomNav activeTab={currentTab} onTabChange={handleTabChange} />
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
