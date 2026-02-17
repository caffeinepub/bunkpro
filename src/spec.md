# Specification

## Summary
**Goal:** Fix the calendar header layout/spacing in the “Mark Past Attendance” modal so the navigation header, weekday row, and date grid are clearly separated with no overlap, and the month title stays perfectly centered between the left/right arrows on all screen sizes.

**Planned changes:**
- Update the “Mark Past Attendance” calendar header layout to a 3-section structure: navigation header row, weekday row, and date grid with consistent vertical spacing.
- Implement a flexbox-based navigation header (left arrow | centered month+year | right arrow) with adequate horizontal padding and bottom margin, ensuring the month title remains visually centered and does not shift when navigating months.
- Adjust spacing/padding to prevent any collisions between header elements, weekday row, and date grid across viewport sizes, while preserving existing calendar behavior.

**User-visible outcome:** The past attendance date picker displays a clean, non-overlapping calendar layout with a stable centered month title and comfortable navigation arrows, without changing how date selection or month navigation works.
