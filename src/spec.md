# Specification

## Summary
**Goal:** Fix post-logout unauthorized errors by making logout immediately and cleanly transition to Login, and improve notification settings UX and reliability within supported browser notification capabilities.

**Planned changes:**
- Update logout flow to immediately navigate to the Login gate, cancel/ignore in-flight React Query requests, and prevent new backend calls from starting after logout completes.
- Harden SettingsPage logout ordering to reliably clear IndexedDB app state, ranking cache, in-memory state reset, and Internet Identity session; ensure safe completion even if backend cleanup fails.
- Add global, user-friendly handling for authorization failures: map session-expired cases to a clear message and logout-to-login flow; map forbidden/permission-denied cases to a non-crashing “Permission denied.” message; ensure ErrorBoundary does not show raw authorization text.
- Expand Settings → Notifications to include separate preference toggles (at minimum: Enable Notifications, Ranking alerts, Reward alerts, Streak reminders), persisted via existing IndexedDB and included in backup/restore with safe defaults for missing fields.
- Ensure in-app notifications respect category toggles (do not show notifications for disabled categories).
- Improve “Send Test Notification” to always provide visible results or reason-specific English feedback for unsupported/disabled/permission states, without unhandled exceptions.
- Add clear English disclosure in Settings → Notifications describing platform limitations (browser notifications while running; not guaranteed when app/browser is closed).

**User-visible outcome:** Logging out returns the user to the Login screen without “Unauthorized” errors and without stray background calls; authorization problems show clear recovery messaging; notification settings provide category-based toggles with reliable test notifications and accurate platform limitation text.
