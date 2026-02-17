# Specification

## Summary
**Goal:** Remove all splash-screen behavior so the app loads immediately into Login (logged out) or Dashboard (logged in), with no startup delay or splash UI.

**Planned changes:**
- Delete `frontend/src/components/system/InitialLoadSplash.tsx` and remove all imports/usages/references to any splash/splash-screen component across the app.
- Remove splash-related initialization gating in `frontend/src/App.tsx`, including the `isInitializing` state and any startup `setTimeout` delay, so the first real screen renders immediately.
- Strip any splash/loading placeholder markup from `frontend/index.html` and any public/static HTML assets so only the React root container remains.
- Remove splash-specific CSS/animations and ensure a solid dark pre-mount document background to prevent any startup background flash.
- If a Service Worker/PWA cache is present, update it to avoid caching/serving any splash-related assets or HTML, and avoid stale cached splash artifacts after deployment (or remove registration references if none should exist).

**User-visible outcome:** On refresh, the app renders directly to Login when logged out or the Dashboard/Home when logged in, with no splash screen, no artificial delay, and no pre-render flashing.
