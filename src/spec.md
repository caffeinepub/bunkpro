# Specification

## Summary
**Goal:** Remove Light/System theme options and enforce permanent Dark mode throughout the BunkPro app.

**Planned changes:**
- Update Settings Appearance/Theme UI to remove any selectable “Light” or “System” theme mode options, leaving only Dark mode available.
- Update theme application logic to always apply Dark mode on load and at runtime, ignoring OS/system theme and any stored theme mode preferences.
- Set Dark as the default theme mode for first-time users with no saved state.
- Normalize any persisted/imported/restored theme mode values (“light”/“system”) to resolve to Dark mode to maintain backward compatibility without errors.

**User-visible outcome:** Users can no longer switch to Light or System theme anywhere; the app always displays in Dark mode, including after refresh, restore/import, or OS theme changes.
