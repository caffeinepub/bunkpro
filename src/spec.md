# Specification

## Summary
**Goal:** Add a dedicated past-attendance marking flow, prevent duplicate/future-day attendance saves, remove any auto-missed-day marking, and add a once-per-day evening reminder notification for unmarked attendance.

**Planned changes:**
- Add a new Dashboard quick-action button labeled exactly "Mark Past Attendance" below "Mark Today's Classes" that opens a dedicated past-attendance flow.
- Implement a calendar-based past-date picker for the past-attendance flow that blocks future dates with a clear English message.
- For a selected past date, display scheduled subjects based on the existing weekly timetable plus any existing per-date overrides (e.g., exchanges), with an English empty state when no classes exist.
- Allow marking each subject as Present/Absent and saving attendance for the selected date; persist per-subject status plus a timestamp and reflect results via existing event-driven calculations.
- Prevent marking the same date twice: block in the UI and enforce on the backend, showing exactly "Attendance already marked for this date" when applicable.
- Add backend support (Motoko) to store per-caller per-date attendance records and validate "no future dates" and "no duplicate date" on save.
- Ensure streak and milestone points update correctly when past attendance is added, without double-awarding already-awarded milestones.
- Remove/disable any existing automatic "auto-mark absent" or missed-day penalty behavior so unmarked days remain unchanged until the user marks them.
- Add a once-per-day local-time (default 7:00 PM) browser notification reminder when today’s attendance is unmarked, respecting notification settings/permissions, and open the existing "Mark Today's Classes" UI when the notification is clicked.
- Persist reminder de-duplication state (e.g., last local date reminded) via existing IndexedDB plus backup/restore in a backward-compatible way.
- Add clear English messaging for major error states (future date blocked, duplicate date, no subjects scheduled, notifications unsupported/disabled/denied) using existing toast/alert patterns.

**User-visible outcome:** Users can mark attendance for any past date via a new Dashboard action (without affecting the existing “Mark Today” flow), cannot mark future dates or mark the same date twice, missed days are not auto-penalized, and they receive a once-daily evening reminder notification if today’s attendance hasn’t been marked (tapping it opens the existing marking UI).
