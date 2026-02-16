// Browser Notifications API wrapper with permission handling, support detection, and actionable result feedback

export type NotificationPermission = 'default' | 'granted' | 'denied';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

export interface NotificationResult {
  success: boolean;
  notification?: Notification;
  reason?: 'unsupported' | 'permission-denied' | 'error';
  errorMessage?: string;
}

/**
 * Check if the browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Get current notification permission state
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
}

/**
 * Send a notification if permission is granted, returns actionable result
 */
export function sendNotification(options: NotificationOptions): NotificationResult {
  if (!isNotificationSupported()) {
    return {
      success: false,
      reason: 'unsupported',
      errorMessage: 'Notifications are not supported in this browser',
    };
  }

  if (Notification.permission !== 'granted') {
    return {
      success: false,
      reason: 'permission-denied',
      errorMessage: 'Notification permission not granted',
    };
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/assets/generated/bunkpro-logo.dim_1024x1024.png',
      tag: options.tag,
      requireInteraction: false,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return {
      success: true,
      notification,
    };
  } catch (error) {
    console.error('Failed to send notification:', error);
    return {
      success: false,
      reason: 'error',
      errorMessage: error instanceof Error ? error.message : 'Failed to create notification',
    };
  }
}
