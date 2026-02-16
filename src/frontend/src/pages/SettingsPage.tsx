// Settings page with profile editor, theme controls, backend profile sync, and logout functionality
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
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { UserProfile as BackendUserProfile } from '../backend';
import type { AppState } from '../domain/attendanceTypes';
import { clearIndexedDB } from '../storage/indexedDbClient';
import { clearRankingCache } from '../rank/rankCache';

export function SettingsPage() {
  const { state, dispatch } = useAppStore();
  const { actor } = useActor();
  const { clear: clearIdentity } = useInternetIdentity();
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
    try {
      // Step 1: Delete user data from backend
      if (actor) {
        try {
          await actor.deleteCallerUser();
        } catch (error: any) {
          console.error('Failed to delete user from backend:', error);
          const errorMessage = error?.message || 'Unknown error';
          toast.error(`Failed to delete leaderboard data: ${errorMessage}`);
          throw error; // Stop logout process if backend deletion fails
        }
      } else {
        toast.error('Not connected to backend. Cannot delete leaderboard data.');
        throw new Error('Backend actor not available');
      }

      // Step 2: Clear ranking cache
      clearRankingCache();

      // Step 3: Clear IndexedDB
      await clearIndexedDB();

      // Step 4: Reset app state
      dispatch({ type: 'RESET_ALL' });

      // Step 5: Clear Internet Identity session
      await clearIdentity();

      toast.success('Logged out successfully. All data has been deleted.');
    } catch (error) {
      console.error('Logout error:', error);
      // Error toast already shown in specific steps above
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
        onToggle={handleToggleNotifications}
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
