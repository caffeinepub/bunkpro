// Settings card for managing browser notification preferences with permission handling and test notification

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, BellOff, AlertCircle } from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendNotification,
} from '@/notifications/notificationsApi';

interface NotificationsCardProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function NotificationsCard({ enabled, onToggle }: NotificationsCardProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const supported = isNotificationSupported();

  useEffect(() => {
    if (supported) {
      setPermission(getNotificationPermission());
    }
  }, [supported]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted' && !enabled) {
        onToggle(true);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSendTest = () => {
    setIsSendingTest(true);
    sendNotification({
      title: '🎉 Test Notification',
      body: 'Notifications are working! You will receive updates when you mark classes.',
      tag: 'test-notification',
    });
    
    setTimeout(() => {
      setIsSendingTest(false);
    }, 1000);
  };

  const canSendNotifications = supported && permission === 'granted';
  const needsPermission = supported && permission === 'default';
  const permissionDenied = supported && permission === 'denied';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </CardTitle>
        <CardDescription>
          Get notified when you mark classes. Notifications only work while the app is open in your browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Browser Support Warning */}
        {!supported && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your browser does not support notifications.
            </AlertDescription>
          </Alert>
        )}

        {/* Permission Denied Warning */}
        {permissionDenied && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Notification permission was denied. Please enable notifications in your browser settings to use this feature.
            </AlertDescription>
          </Alert>
        )}

        {/* Request Permission */}
        {needsPermission && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-3">
              <span>Browser permission is required to send notifications.</span>
              <Button 
                onClick={handleRequestPermission}
                disabled={isRequesting}
                size="sm"
                className="w-fit"
              >
                {isRequesting ? 'Requesting...' : 'Grant Permission'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <Label htmlFor="enable-notifications" className="flex items-center gap-2 cursor-pointer">
              {enabled ? (
                <Bell className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <BellOff className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span>Enable Notifications</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications when marking attendance
            </p>
          </div>
          <Switch
            id="enable-notifications"
            checked={enabled}
            onCheckedChange={onToggle}
            disabled={!canSendNotifications}
          />
        </div>

        {/* Test Notification Button */}
        {canSendNotifications && enabled && (
          <div className="pt-4 border-t">
            <Button 
              onClick={handleSendTest}
              disabled={isSendingTest}
              variant="outline"
              className="w-full"
            >
              {isSendingTest ? 'Sending...' : 'Send Test Notification'}
            </Button>
          </div>
        )}

        {/* Explanatory Text */}
        <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
          <p className="font-medium">About Notifications:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Notifications require browser permission</li>
            <li>Only triggered while the app is running</li>
            <li>No delivery guarantee when app/browser is closed</li>
            <li>Works on desktop and mobile browsers that support notifications</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
