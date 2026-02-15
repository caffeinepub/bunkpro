// Settings page with theme controls, target percentage, premium features, notifications, backup/restore, and about section

import React from 'react';
import { useAppStore } from '../state/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ThemeSelector } from '../components/settings/ThemeSelector';
import { TargetPercentageControl } from '../components/settings/TargetPercentageControl';
import { NotificationsCard } from '../components/settings/NotificationsCard';
import { BackupRestoreCard } from '../components/settings/BackupRestoreCard';
import { AboutCard } from '../components/settings/AboutCard';
import { Sparkles, TrendingUp } from 'lucide-react';
import type { AppState } from '../domain/attendanceTypes';

export function SettingsPage() {
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

  const handleRestore = (restoredState: AppState) => {
    dispatch({ type: 'RESTORE_STATE', payload: restoredState });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your experience</p>
      </div>

      {/* Theme Settings */}
      <ThemeSelector
        settings={state.settings}
        onThemeChange={handleThemeChange}
        onVariantChange={handleVariantChange}
      />

      {/* Target Percentage */}
      <TargetPercentageControl
        value={state.settings.targetPercentage}
        onChange={handleTargetChange}
      />

      {/* Notifications */}
      <NotificationsCard
        enabled={state.settings.enableNotifications}
        onToggle={handleToggleNotifications}
      />

      {/* Premium Features */}
      <Card>
        <CardHeader>
          <CardTitle>Premium Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <Label htmlFor="premium-insights" className="flex items-center gap-2 cursor-pointer">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span>Premium Insights</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Show trend predictions and danger zone warnings
              </p>
            </div>
            <Switch
              id="premium-insights"
              checked={state.settings.enablePremiumInsights}
              onCheckedChange={handleTogglePremiumInsights}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <Label htmlFor="streak-counter" className="flex items-center gap-2 cursor-pointer">
                <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                <span>Streak Counter</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Track consecutive attendance streaks
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

      {/* Backup & Restore */}
      <BackupRestoreCard
        currentState={state}
        onRestore={handleRestore}
      />

      {/* About */}
      <AboutCard />
    </div>
  );
}
