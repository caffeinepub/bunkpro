// Main application component with routing

import React, { useState, useEffect } from 'react';
import { AppProvider, useAppStore } from './state/appStore';
import { ErrorBoundary } from './components/system/ErrorBoundary';
import { InitialLoadSplash } from './components/system/InitialLoadSplash';
import { AppShell } from './components/layout/AppShell';
import { BottomNav } from './components/navigation/BottomNav';
import { HomeDashboardPage } from './pages/HomeDashboardPage';
import { SubjectDetailsPage } from './pages/SubjectDetailsPage';
import { TimetablePage } from './pages/TimetablePage';
import { SettingsPage } from './pages/SettingsPage';
import { Toaster } from '@/components/ui/sonner';
import { initializeTheme } from './theme/themeManager';

type Route = 
  | { type: 'home' }
  | { type: 'subject-details'; subjectId: string }
  | { type: 'timetable' }
  | { type: 'settings' };

function AppContent() {
  const { state, isLoading } = useAppStore();
  const [route, setRoute] = useState<Route>({ type: 'home' });

  useEffect(() => {
    initializeTheme(state.settings);
  }, [state.settings]);

  if (isLoading) {
    return <InitialLoadSplash />;
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

  return (
    <AppShell>
      {route.type === 'home' && (
        <HomeDashboardPage onSubjectClick={handleSubjectClick} />
      )}
      {route.type === 'subject-details' && (
        <SubjectDetailsPage subjectId={route.subjectId} onBack={handleBack} />
      )}
      {route.type === 'timetable' && <TimetablePage />}
      {route.type === 'settings' && <SettingsPage />}

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
