// Settings card for managing browser notification preferences with category toggles, clear limitation messaging using shared copy that explicitly states FCM/background push is not supported, test notification functionality, and Android-only disabled toggle with "Coming Soon" label.

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Bell, BellOff, Info, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
} from '../../notifications/notificationsApi';
import { NOTIFICATION_LIMITATIONS, NOTIFICATION_PERMISSION_MESSAGES } from '../../notifications/notificationLimitationsCopy';
import { isAndroid } from '../../lib/platform';
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
  const isAndroidDevice = isAndroid();

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    setTestResult(null);

    try {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);

      if (newPermission === 'granted') {
        setTestResult({
          success: true,
          message: NOTIFICATION_PERMISSION_MESSAGES.granted,
        });
      } else if (newPermission === 'denied') {
        setTestResult({
          success: false,
          message: NOTIFICATION_PERMISSION_MESSAGES.denied,
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
      const result = await sendTestNotification();

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
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{NOTIFICATION_LIMITATIONS.title}</AlertTitle>
          <AlertDescription className="text-sm space-y-2 mt-2">
            <p>{NOTIFICATION_LIMITATIONS.description}</p>
            <p className="font-medium">{NOTIFICATION_LIMITATIONS.requirement}</p>
            <p className="text-xs text-muted-foreground">
              <strong>Not supported:</strong> {NOTIFICATION_LIMITATIONS.notSupported}
            </p>
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
                  ? NOTIFICATION_PERMISSION_MESSAGES.denied
                  : NOTIFICATION_PERMISSION_MESSAGES.required}
              </AlertDescription>
            </Alert>

            {permission !== 'denied' && (
              <Button
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="w-full"
              >
                {isRequesting ? 'Requesting...' : 'Request Permission'}
              </Button>
            )}
          </div>
        )}

        {/* Main Toggle */}
        {canEnable && (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications-toggle" className="text-base">
                  Enable Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser notifications while app is open
                </p>
              </div>
              <Switch
                id="notifications-toggle"
                checked={enabled}
                onCheckedChange={onToggle}
              />
            </div>

            <Separator />

            {/* Notification Categories */}
            {enabled && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Notification Categories</h4>
                  <p className="text-xs text-muted-foreground italic">
                    {NOTIFICATION_LIMITATIONS.shortDisclaimer}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="streak-reminders" className="text-sm font-normal">
                        Daily Reminders
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Remind me at 7 PM if I haven't marked attendance ({NOTIFICATION_LIMITATIONS.dailyReminderNote})
                      </p>
                    </div>
                    <Switch
                      id="streak-reminders"
                      checked={preferences.streakReminders}
                      onCheckedChange={() => handleTogglePreference('streakReminders')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ranking-alerts" className="text-sm font-normal">
                        Ranking Alerts
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Notify me about ranking changes and achievements
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
                      <Label htmlFor="reward-alerts" className="text-sm font-normal">
                        Reward Alerts
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Notify me when I earn points or rewards
                      </p>
                    </div>
                    <Switch
                      id="reward-alerts"
                      checked={preferences.rewardAlerts}
                      onCheckedChange={() => handleTogglePreference('rewardAlerts')}
                    />
                  </div>

                  {/* Android Notifications - Coming Soon (Android only) */}
                  {isAndroidDevice && (
                    <>
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between opacity-60">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="android-notifications" className="text-sm font-normal">
                              Android Push Notifications
                            </Label>
                            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              Coming Soon
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Native Android push notifications are not available in this build
                          </p>
                        </div>
                        <Switch
                          id="android-notifications"
                          checked={false}
                          disabled={true}
                        />
                      </div>
                    </>
                  )}
                </div>

                <Separator />

                {/* Test Notification */}
                <div className="space-y-3">
                  <Button
                    onClick={handleSendTest}
                    disabled={isSendingTest}
                    variant="outline"
                    className="w-full"
                  >
                    {isSendingTest ? 'Sending...' : 'Send Test Notification'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Test Result Feedback */}
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
      </CardContent>
    </Card>
  );
}
