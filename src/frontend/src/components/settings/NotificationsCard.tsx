// Settings card for managing browser notification preferences with category toggles and clear limitation messaging
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Bell, BellOff, Info, CheckCircle2, XCircle } from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
} from '../../notifications/notificationsApi';
import type { NotificationPreferences } from '../../domain/attendanceTypes';

interface NotificationsCardProps {
  enabled: boolean;
  preferences: NotificationPreferences;
  onToggle: () => void;
  onPreferencesChange: (preferences: NotificationPreferences) => void;
}

export function NotificationsCard({ enabled, preferences, onToggle, onPreferencesChange }: NotificationsCardProps) {
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [isRequesting, setIsRequesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const supported = isNotificationSupported();
  const canEnable = supported && permission === 'granted';

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    setTestResult(null);

    try {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);

      if (newPermission === 'granted') {
        setTestResult({
          success: true,
          message: 'Permission granted! You can now enable notifications.',
        });
      } else if (newPermission === 'denied') {
        setTestResult({
          success: false,
          message: 'Permission denied. Please enable notifications in your browser settings.',
        });
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      setTestResult({
        success: false,
        message: 'Failed to request permission. Please try again.',
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setTestResult(null);

    try {
      const result = await sendTestNotification(enabled);

      if (result.success) {
        setTestResult({
          success: true,
          message: 'Test notification sent successfully! Check your notifications.',
        });
      } else {
        setTestResult({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setTestResult({
        success: false,
        message: 'Failed to send test notification',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleTogglePreference = (key: keyof NotificationPreferences) => {
    onPreferencesChange({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          Notifications
        </CardTitle>
        <CardDescription>
          Manage browser notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Platform Limitations Notice */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Browser notifications only:</strong> Notifications require browser permission and work only while the app is open. 
            Delivery is not guaranteed when the browser or app is closed. Behavior depends on your browser's notification support.
          </AlertDescription>
        </Alert>

        {/* Browser Support Check */}
        {!supported && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Your browser does not support notifications. Please use a modern browser like Chrome, Firefox, or Safari.
            </AlertDescription>
          </Alert>
        )}

        {/* Permission Status */}
        {supported && permission !== 'granted' && (
          <div className="space-y-3">
            <Alert variant={permission === 'denied' ? 'destructive' : 'default'}>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {permission === 'denied'
                  ? 'Notification permission was denied. Please enable it in your browser settings to receive notifications.'
                  : 'Notification permission is required. Click the button below to grant permission.'}
              </AlertDescription>
            </Alert>

            {permission === 'default' && (
              <Button
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="w-full"
              >
                {isRequesting ? 'Requesting Permission...' : 'Grant Notification Permission'}
              </Button>
            )}
          </div>
        )}

        {/* Master Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enable-notifications" className="text-base font-medium">
              Enable Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Master switch for all notifications
            </p>
          </div>
          <Switch
            id="enable-notifications"
            checked={enabled}
            onCheckedChange={onToggle}
            disabled={!canEnable}
          />
        </div>

        {/* Category Toggles */}
        {enabled && canEnable && (
          <>
            <Separator />

            <div className="space-y-4">
              <p className="text-sm font-medium">Notification Categories</p>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ranking-alerts" className="text-sm font-medium">
                    Ranking Alerts
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified about leaderboard changes
                  </p>
                </div>
                <Switch
                  id="ranking-alerts"
                  checked={preferences.rankingAlerts}
                  onCheckedChange={() => handleTogglePreference('rankingAlerts')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reward-alerts" className="text-sm font-medium">
                    Reward Alerts
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when you earn points or achievements
                  </p>
                </div>
                <Switch
                  id="reward-alerts"
                  checked={preferences.rewardAlerts}
                  onCheckedChange={() => handleTogglePreference('rewardAlerts')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="streak-reminders" className="text-sm font-medium">
                    Streak Reminders
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get reminded about your attendance streaks
                  </p>
                </div>
                <Switch
                  id="streak-reminders"
                  checked={preferences.streakReminders}
                  onCheckedChange={() => handleTogglePreference('streakReminders')}
                />
              </div>
            </div>
          </>
        )}

        {/* Test Notification */}
        {enabled && canEnable && (
          <>
            <Separator />

            <div className="space-y-3">
              <Button
                onClick={handleSendTest}
                disabled={isSendingTest}
                variant="outline"
                className="w-full"
              >
                {isSendingTest ? 'Sending...' : 'Send Test Notification'}
              </Button>

              {testResult && (
                <Alert variant={testResult.success ? 'default' : 'destructive'}>
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
