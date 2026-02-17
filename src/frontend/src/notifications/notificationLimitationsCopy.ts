// Shared copy module exporting consistent, user-friendly strings describing notification support and limitations: browser Notifications API only while the app is open/active; no Firebase Cloud Messaging (FCM); no background/app-closed delivery; no Android APK push.

export const NOTIFICATION_LIMITATIONS = {
  title: 'Browser Notifications Only',
  
  description: 
    'This app uses browser-based notifications that work while the app is running in an open tab or window.',
  
  notSupported: 
    'Firebase Cloud Messaging (FCM), background push notifications, app-closed delivery, and Android APK push notifications are not supported in this build.',
  
  requirement: 
    'Notifications require the app to be open and running. They are not guaranteed when the browser or app is closed.',
  
  dailyReminderNote: 
    'Daily reminders work only while the app is open at 7 PM',
  
  shortDisclaimer: 
    'Requires app to be open',
} as const;

export const NOTIFICATION_PERMISSION_MESSAGES = {
  denied: 
    'Notification permission was denied. Please enable it in your browser settings to receive notifications.',
  
  required: 
    'Notification permission is required to receive alerts while the app is open.',
  
  granted: 
    'Permission granted! You can now enable notifications.',
} as const;
