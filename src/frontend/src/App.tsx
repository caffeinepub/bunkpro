// Main application component with login gate and ranking navigation

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
import { SettingsPage } from './pages/SettingsPage';
import { RankPage } from './rank/RankPage';
import { Toaster } from '@/components/ui/sonner';
import { initializeTheme } from './theme/themeManager';
import { useActor } from './hooks/useActor';
import { registerUserDisplayName } from './rank/rankApi';
import { toast } from 'sonner';
import type { UserProfile } from './domain/attendanceTypes';

type Route = 
  | { type: 'home' }
  | { type: 'subject-details'; subjectId: string }
  | { type: 'timetable' }
  | { type: 'settings' }
  | { type: 'rank' };

function AppContent() {
  const { state, dispatch, isLoading } = useAppStore();
  const { actor } = useActor();
  const [route, setRoute] = useState<Route>({ type: 'home' });

  useEffect(() => {
    initializeTheme(state.settings);
  }, [state.settings]);

  const handleLogin = async (profile: UserProfile) => {
    dispatch({ type: 'SET_USER_PROFILE', payload: profile });

    // Register display name with backend
    if (actor) {
      const result = await registerUserDisplayName(actor, profile.displayName);
      if (!result.success) {
        toast.error(result.error || 'Failed to sync profile to server', {
          duration: 4000,
        });
      }
    }
  };

  if (isLoading) {
    return <InitialLoadSplash />;
  }

  // Show login page if no user profile
  if (!state.userProfile) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const getActiveTab = (): 'home' | 'timetable' | 'settings' => {
    if (route.type === 'timetable') return 'timetable';
    if (route.type === 'settings') return 'settings';
    return 'home';
  };

  const handleTabChange = (tab: 'home' | 'timetable' | 'settings') => {
    if (tab === 'home') setRoute({ type: 'home' });
    else if (tab === 'timetable') setRoute({ type: 'timetable' });
    else if (tab === 'settings') setRoute({ type: 'settings' });
  };

  const handleSubjectClick = (subjectId: string) => {
    setRoute({ type: 'subject-details', subjectId });
  };

  const handleBack = () => {
    setRoute({ type: 'home' });
  };

  const handleNavigateToRank = () => {
    setRoute({ type: 'rank' });
  };

  const handleBackFromRank = () => {
    setRoute({ type: 'settings' });
  };

  return (
    <AppShell>
      {route.type === 'home' && (
        <HomeDashboardPage onSubjectClick={handleSubjectClick} />
      )}
      {route.type === 'subject-details' && (
        <SubjectDetailsPage subjectId={route.subjectId} onBack={handleBack} />
      )}
      {route.type === 'timetable' && <TimetablePage />}
      {route.type === 'settings' && (
        <SettingsPage onNavigateToRank={handleNavigateToRank} />
      )}
      {route.type === 'rank' && (
        <RankPage onBack={handleBackFromRank} />
      )}

      <BottomNav activeTab={getActiveTab()} onTabChange={handleTabChange} />
      <Toaster />
    </AppShell>
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
