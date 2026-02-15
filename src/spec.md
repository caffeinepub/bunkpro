# Specification

## Summary
**Goal:** Refresh BunkPro branding by generating a new modern, minimal logo set (icon + horizontal wordmark) with dark/light variants, and integrate it across the app with theme-aware selection.

**Planned changes:**
- Generate four new logo assets (square app icon + horizontal logo with “BunkPro” and tagline “Track Smart.”), each with light-background and dark-background variants.
- Add the new logo assets under `frontend/public/assets/generated` and update branding placements (at minimum: initial loading splash and Settings → About) to use theme-appropriate variants via absolute `/assets/generated/...` paths.
- Update branding constants to (a) use the exact tagline text “Track Smart.” and (b) provide theme-aware logo path selection for splash and about views.
- Generate a matching 32×32 favicon derived from the new app icon and update `frontend/index.html` to reference it.

**User-visible outcome:** The app displays the new BunkPro icon/wordmark and the exact “Track Smart.” tagline on the splash and About screen, automatically switching the correct light/dark logo variant with the current theme, and the browser tab favicon matches the new icon.
