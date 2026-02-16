// Settings page with resilient logout flow, notification category preferences, and proper error handling
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '../state/appStore';
import { BackupRestoreCard } from '../components/settings/BackupRestoreCard';
import { TargetPercentageControl } from '../components/settings/TargetPercentageControl';
import { ThemeSelector } from '../components/settings/ThemeSelector';
import { AboutCard } from '../components/settings/AboutCard';
import { NotificationsCard } from '../components/settings/NotificationsCard';
import { ProfileDisplayNameEditor } from '../components/settings/ProfileDisplayNameEditor';
import { LogoutCard } from '../components/settings/LogoutCard';
import { useActor } from '../hooks/useActor';
import { useAuthRecovery } from '../hooks/useAuthRecovery';
import { toast } from 'sonner';
import type { UserProfile as BackendUserProfile } from '../backend';
import type { AppState, NotificationPreferences } from '../domain/attendanceTypes';
import { clearAllSessionParameters } from '../utils/urlParams';

export function SettingsPage() {
  const { state, dispatch } = useAppStore();
  const { actor } = useActor();
  const { performLogout } = useAuthRecovery();
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSaveDisplayName = async (newName: string) => {
    if (!actor) {
      toast.error('Not connected to backend');
      return;
    }

    setIsSavingProfile(true);

    try {
      // Update local state
      if (state.userProfile) {
        dispatch({
          type: 'SET_USER_PROFILE',
          payload: {
            ...state.userProfile,
            displayName: newName,
          },
        });
      }

      // Sync to backend
      const backendProfile: BackendUserProfile = {
        displayName: newName,
        college: 'Unknown',
        email: 'unknown@example.com',
      };

      await actor.saveCallerUserProfile(backendProfile);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    // Step 1: Immediately trigger login gate by resetting app state
    dispatch({ type: 'RESET_ALL' });

    // Step 2: Perform complete cleanup (best-effort)
    try {
      // Try to delete from backend if actor is available
      if (actor) {
        try {
          await actor.deleteCallerUser();
        } catch (error: any) {
          console.error('Failed to delete user from backend:', error);
          const errorMessage = error?.message || 'Unknown error';
          toast.error(`Failed to delete leaderboard data: ${errorMessage}. Local data will still be cleared.`);
          // Continue with local cleanup even if backend deletion fails
        }
      }

      // Complete local cleanup via auth recovery hook
      await performLogout(false); // Don't show duplicate toast

      // Clear sessionStorage including URL param secrets
      clearAllSessionParameters();

      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout cleanup error:', error);
      // Local logout already completed via RESET_ALL
      toast.info('Logged out (some cleanup steps failed)');
    }
  };

  const handleTargetChange = (newTarget: number) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { targetPercentage: newTarget },
    });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { theme },
    });
  };

  const handleThemeVariantChange = (variant: 'purple-blue' | 'midnight') => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { themeVariant: variant },
    });
  };

  const handleTogglePremiumInsights = () => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { enablePremiumInsights: !state.settings.enablePremiumInsights },
    });
  };

  const handleToggleStreakCounter = () => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { enableStreakCounter: !state.settings.enableStreakCounter },
    });
  };

  const handleToggleDangerZone = () => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { enableDangerZone: !state.settings.enableDangerZone },
    });
  };

  const handleToggleNotifications = () => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { enableNotifications: !state.settings.enableNotifications },
    });
  };

  const handleNotificationPreferencesChange = (preferences: NotificationPreferences) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { notificationPreferences: preferences },
    });
  };

  const handleRestore = (restoredState: AppState) => {
    dispatch({ type: 'RESTORE_STATE', payload: restoredState });
  };

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and data</p>
      </div>

      {/* Profile Section */}
      {state.userProfile && (
        <ProfileDisplayNameEditor
          currentName={state.userProfile.displayName}
          totalPoints={state.userProfile.totalPoints}
          onSave={handleSaveDisplayName}
          isSaving={isSavingProfile}
        />
      )}

      <Separator />

      {/* Target Percentage */}
      <TargetPercentageControl
        value={state.settings.targetPercentage}
        onChange={handleTargetChange}
      />

      <Separator />

      {/* Theme Settings */}
      <ThemeSelector
        settings={state.settings}
        onThemeChange={handleThemeChange}
        onVariantChange={handleThemeVariantChange}
      />

      <Separator />

      {/* Notifications */}
      <NotificationsCard
        enabled={state.settings.enableNotifications}
        preferences={state.settings.notificationPreferences}
        onToggle={handleToggleNotifications}
        onPreferencesChange={handleNotificationPreferencesChange}
      />

      <Separator />

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>Enable or disable premium features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Premium Insights</p>
              <p className="text-sm text-muted-foreground">
                Show trend predictions and motivational messages
              </p>
            </div>
            <Button
              variant={state.settings.enablePremiumInsights ? 'default' : 'outline'}
              size="sm"
              onClick={handleTogglePremiumInsights}
            >
              {state.settings.enablePremiumInsights ? 'On' : 'Off'}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Streak Counter</p>
              <p className="text-sm text-muted-foreground">
                Display your current attendance streak
              </p>
            </div>
            <Button
              variant={state.settings.enableStreakCounter ? 'default' : 'outline'}
              size="sm"
              onClick={handleToggleStreakCounter}
            >
              {state.settings.enableStreakCounter ? 'On' : 'Off'}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Danger Zone Alerts</p>
              <p className="text-sm text-muted-foreground">
                Warn when attendance is critically low
              </p>
            </div>
            <Button
              variant={state.settings.enableDangerZone ? 'default' : 'outline'}
              size="sm"
              onClick={handleToggleDangerZone}
            >
              {state.settings.enableDangerZone ? 'On' : 'Off'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Backup & Restore */}
      <BackupRestoreCard
        currentState={state}
        onRestore={handleRestore}
      />

      <Separator />

      {/* Logout */}
      <LogoutCard onLogout={handleLogout} />

      <Separator />

      {/* About */}
      <AboutCard />
    </div>
  );
}
