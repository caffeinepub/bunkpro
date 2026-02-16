// Settings page with navigation to weekly ranking

import React from 'react';
import { useAppStore } from '../state/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ThemeSelector } from '../components/settings/ThemeSelector';
import { TargetPercentageControl } from '../components/settings/TargetPercentageControl';
import { NotificationsCard } from '../components/settings/NotificationsCard';
import { BackupRestoreCard } from '../components/settings/BackupRestoreCard';
import { AboutCard } from '../components/settings/AboutCard';
import { Sparkles, TrendingUp, Trophy, ChevronRight } from 'lucide-react';
import type { AppState } from '../domain/attendanceTypes';

interface SettingsPageProps {
  onNavigateToRank?: () => void;
}

export function SettingsPage({ onNavigateToRank }: SettingsPageProps) {
  const { state, dispatch } = useAppStore();

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { theme } });
  };

  const handleVariantChange = (variant: 'purple-blue' | 'midnight') => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { themeVariant: variant } });
  };

  const handleTargetChange = (targetPercentage: number) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { targetPercentage } });
  };

  const handleTogglePremiumInsights = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { enablePremiumInsights: enabled } });
  };

  const handleToggleStreakCounter = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { enableStreakCounter: enabled } });
  };

  const handleToggleNotifications = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { enableNotifications: enabled } });
  };

  const handleRestoreState = (restoredState: AppState) => {
    dispatch({ type: 'RESTORE_STATE', payload: restoredState });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your experience</p>
      </div>

      {/* User Profile Card */}
      {state.userProfile && (
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Name</span>
                <span className="font-semibold text-lg">{state.userProfile.displayName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Points</span>
                <span className="font-bold text-2xl text-primary">{state.userProfile.totalPoints}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Ranking Navigation */}
      {onNavigateToRank && (
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onNavigateToRank}>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Weekly Ranking</p>
                <p className="text-sm text-muted-foreground">View leaderboard</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      )}

      <ThemeSelector
        settings={state.settings}
        onThemeChange={handleThemeChange}
        onVariantChange={handleVariantChange}
      />

      <TargetPercentageControl
        value={state.settings.targetPercentage}
        onChange={handleTargetChange}
      />

      <NotificationsCard
        enabled={state.settings.enableNotifications}
        onToggle={handleToggleNotifications}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Premium Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="premium-insights">Premium Insights</Label>
              <p className="text-sm text-muted-foreground">
                Show trends and predictions
              </p>
            </div>
            <Switch
              id="premium-insights"
              checked={state.settings.enablePremiumInsights}
              onCheckedChange={handleTogglePremiumInsights}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="streak-counter">Streak Counter</Label>
              <p className="text-sm text-muted-foreground">
                Track consecutive attendance
              </p>
            </div>
            <Switch
              id="streak-counter"
              checked={state.settings.enableStreakCounter}
              onCheckedChange={handleToggleStreakCounter}
            />
          </div>
        </CardContent>
      </Card>

      <BackupRestoreCard
        currentState={state}
        onRestore={handleRestoreState}
      />

      <AboutCard />
    </div>
  );
}
