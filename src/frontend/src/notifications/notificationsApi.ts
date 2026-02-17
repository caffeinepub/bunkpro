/**
 * Browser Notifications API wrapper with comprehensive result feedback and click handler support
 * Provides support detection, permission handling, and notification sending
 * Limited to web browser notifications (no FCM/push infrastructure)
 */

export type NotificationResult =
  | { success: true }
  | { success: false; reason: 'unsupported' | 'permission-denied' | 'permission-default' | 'disabled' | 'error'; message: string };

export type NotificationClickHandler = () => void;

/**
 * Checks if the browser supports the Notifications API
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
 * Sends a browser notification with optional click handler
 * @param title - Notification title
 * @param options - Notification options (body, icon, tag, etc.)
 * @param requireInteraction - Whether the notification should remain visible until user interaction
 * @param onClick - Optional click handler to execute when notification is clicked
 * @returns Result object indicating success or failure with reason
 */
export async function sendNotification(
  title: string,
  options: NotificationOptions = {},
  requireInteraction: boolean = false,
  onClick?: NotificationClickHandler
): Promise<NotificationResult> {
  // Check if notifications are supported
  if (!isNotificationSupported()) {
    return {
      success: false,
      reason: 'unsupported',
      message: 'Notifications are not supported in this browser',
    };
  }

  // Check permission status
  const permission = getNotificationPermission();
  
  if (permission === 'denied') {
    return {
      success: false,
      reason: 'permission-denied',
      message: 'Notification permission has been denied',
    };
  }

  if (permission === 'default') {
    return {
      success: false,
      reason: 'permission-default',
      message: 'Notification permission has not been granted yet',
    };
  }

  // Permission is granted, send notification
  try {
    const notification = new Notification(title, {
      ...options,
      requireInteraction,
    });

    // Attach click handler if provided
    if (onClick) {
      notification.onclick = () => {
        onClick();
        notification.close();
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      success: false,
      reason: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Sends a test notification to verify the setup
 */
export async function sendTestNotification(): Promise<NotificationResult> {
  return sendNotification(
    'Test Notification',
    {
      body: 'Notifications are working correctly!',
      tag: 'test-notification',
    },
    false
  );
}
