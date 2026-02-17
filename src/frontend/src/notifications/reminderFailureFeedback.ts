/**
 * User-friendly feedback for reminder notification failures with rate limiting
 */

const RATE_LIMIT_KEY = 'bunkpro_reminder_failure_last_shown';
const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour

type FailureReason = 'unsupported' | 'permission-denied' | 'permission-default' | 'disabled' | 'error';

const FRIENDLY_MESSAGES: Record<FailureReason, string> = {
  unsupported: 'Your browser doesn\'t support notifications. Please use a modern browser to receive attendance reminders.',
  'permission-denied': 'Notifications are blocked. Please enable them in your browser settings to receive attendance reminders.',
  'permission-default': 'Please allow notifications to receive attendance reminders.',
  disabled: 'Notifications are disabled in settings. Enable them to receive attendance reminders.',
  error: 'Unable to send reminder notification. Please check your browser settings.',
};

/**
 * Check if enough time has passed since last failure message
 */
function shouldShowMessage(): boolean {
  try {
    const lastShown = localStorage.getItem(RATE_LIMIT_KEY);
    if (!lastShown) return true;
    
    const lastShownTime = parseInt(lastShown, 10);
    const now = Date.now();
    
    return (now - lastShownTime) >= RATE_LIMIT_MS;
  } catch {
    return true;
  }
}

/**
 * Update the last shown timestamp
 */
function updateLastShown(): void {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get user-friendly message for a failure reason, respecting rate limits
 * Returns null if rate-limited
 */
export function getReminderFailureMessage(reason: FailureReason): string | null {
  if (!shouldShowMessage()) {
    return null;
  }
  
  updateLastShown();
  return FRIENDLY_MESSAGES[reason] || FRIENDLY_MESSAGES.error;
}
