# Specification

## Summary
**Goal:** Make the daily attendance reminder notification consistent, deep-link into the existing “Mark Today’s Classes” UI when clicked, and ensure reminder scheduling is robust, leak-free, and user-friendly when notifications can’t be delivered.

**Planned changes:**
- Update the reminder notification content to use the exact required English title/body strings, and keep it deduped to at most once per local calendar day using the existing `settings.lastReminderDate` mechanism.
- Implement reminder notification click behavior so that clicking while the app is running focuses the window and opens the existing “Mark Today’s Classes” bottom sheet (navigating to Home first if needed).
- Harden reminder scheduling/polling so checks only run when notifications and the Streak Reminders category are enabled; ensure intervals/timeouts are cleaned up on unmount/dependency changes; and prevent any notification attempts before 7:00 PM local time.
- Add clear, non-blocking, rate-limited user feedback (toast/alert style consistent with the app) when reminders can’t be sent due to browser notification limitations or permissions, without showing raw technical errors.

**User-visible outcome:** Users receive a correctly-worded daily reminder at most once per day after 7:00 PM, can click it to jump directly into the existing “Mark Today’s Classes” sheet from anywhere in the app, and will see clear non-spammy messages if the browser can’t deliver notifications.
