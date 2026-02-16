/**
 * Browser Notifications API wrapper with comprehensive result feedback
 * Provides support detection, permission handling, and notification sending
 * Limited to web browser notifications (no FCM/push infrastructure)
 */

export type NotificationResult =
  | { success: true }
  | { success: false; reason: 'unsupported' | 'permission-denied' | 'permission-default' | 'disabled' | 'error'; message: string };

/**
 * Checks if the browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Gets the current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Requests notification permission from the user
 * Returns the new permission status
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Sends a browser notification with comprehensive error handling
 * Returns detailed result with reason for failure
 */
export async function sendNotification(
  title: string,
  options?: NotificationOptions,
  enabled: boolean = true
): Promise<NotificationResult> {
  // Check if notifications are enabled in app settings
  if (!enabled) {
    return {
      success: false,
      reason: 'disabled',
      message: 'Notifications are disabled in settings',
    };
  }

  // Check browser support
  if (!isNotificationSupported()) {
    return {
      success: false,
      reason: 'unsupported',
      message: 'Your browser does not support notifications',
    };
  }

  // Check permission status
  const permission = Notification.permission;

  if (permission === 'denied') {
    return {
      success: false,
      reason: 'permission-denied',
      message: 'Notification permission was denied. Please enable it in your browser settings.',
    };
  }

  if (permission === 'default') {
    return {
      success: false,
      reason: 'permission-default',
      message: 'Please grant notification permission first',
    };
  }

  // Permission is granted, send notification
  try {
    const notification = new Notification(title, {
      icon: '/assets/generated/bunkpro-favicon.dim_32x32.png',
      badge: '/assets/generated/bunkpro-favicon.dim_32x32.png',
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      success: false,
      reason: 'error',
      message: 'Failed to send notification',
    };
  }
}

/**
 * Sends a test notification to verify setup
 */
export async function sendTestNotification(enabled: boolean): Promise<NotificationResult> {
  return sendNotification(
    'BunkPro Test Notification',
    {
      body: 'Notifications are working! You will receive alerts for important events.',
      tag: 'test-notification',
    },
    enabled
  );
}
