# Specification

## Summary
**Goal:** Remove any purple/pink flash on initial load by forcing a solid dark splash/background color, and update the splash logo to the finalized uploaded BunkPro dark-mode logo.

**Planned changes:**
- Force the splash overlay background to a single solid dark color (e.g., `#0D0D0D`) that does not depend on theme variables (avoid `bg-background`/CSS variable-driven backgrounds) to prevent any purple/pink tint.
- Set the initial document (`html, body`) background to the same solid dark color before React mounts, and add/update `meta name="theme-color"` to match to prevent browser UI tinting.
- Add the uploaded logo `Bunkpro.logo_dark_mode.png` to `frontend/public/assets/generated/` and update branding so `BRANDING.getAppIcon(...)` resolves to this asset for both dark and light.
- Update the splash layout to a minimal, full-screen flex-centered logo (centered horizontally/vertically; responsive sizing; `object-contain` to avoid distortion).
- Remove/replace any remaining references to old splash icon assets in the splash rendering path so refreshes consistently show the new logo/background (and ensure existing caching does not keep stale splash assets).

**User-visible outcome:** On cold load and hard refresh, users see a full-screen splash with a crisp, centered BunkPro logo on a solid dark background with no purple/pink flash at any point.
