# Specification

## Summary
**Goal:** Use the uploaded logo (image.png) exactly everywhere in the app (including favicon) and add in-browser notification features with user controls and persistence.

**Planned changes:**
- Replace all in-app logo usages (initial loading splash, Settings → About, and any other placements) to use only the uploaded image.png exactly as provided, with no redesign or alterations.
- Update the browser tab icon/favicon to match the uploaded image.png exactly and ensure it’s referenced from frontend static assets via frontend/index.html.
- Add a Notifications section in Settings with an enable/disable toggle, a permission request flow, and a “Send test notification” action using the browser Notifications API.
- Implement in-app “local notifications” triggered by app events while the app is running (e.g., after successfully marking a class attended/missed/cancelled), respecting the notifications toggle and permission state.
- Persist notification preference(s) through the existing local persistence and backup/restore flow (IndexedDB + export/import), remaining compatible with older backups.
- Add clear English explanatory copy in Settings describing permission requirements and limitations (e.g., no guaranteed delivery when the app is closed).

**User-visible outcome:** The app shows only the uploaded logo everywhere (including the favicon). Users can enable/disable notifications in Settings, grant permission, send a test notification, and receive in-app notifications after marking a class while the app is running; the preference is saved and included in backups.
