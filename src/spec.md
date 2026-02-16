# Specification

## Summary
**Goal:** Generate a new premium BunkPro logo set (app icon, horizontal wordmark, favicon) per the provided visual spec and integrate it across the app’s branding.

**Planned changes:**
- Add new generated logo assets (icon, horizontal logo/wordmark, favicon) under `frontend/public/assets/generated` using the specified filenames.
- Update `frontend/src/lib/branding.ts` so `getAppIcon(...)` and `getHorizontalLogo(...)` point to the new generated assets (using the same assets for dark/light themes unless separate variants are provided).
- Update `frontend/index.html` to reference the new generated favicon asset.

**User-visible outcome:** The app’s splash/loading screen, Settings → About branding, and the browser tab favicon all display the new BunkPro logo artwork without changing existing app logic or layouts.
