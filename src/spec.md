# Specification

## Summary
**Goal:** Add name-based login, streak milestone points, and a weekly multi-user ranking screen backed by the Motoko backend.

**Planned changes:**
- Add a first-run Login screen (single name input + continue) that validates “good names” (letters/spaces only, trimmed, non-empty, reasonable length) and persists the user name via existing IndexedDB state persistence.
- Extend persisted frontend state/reducer to include a user profile and gamification fields (user name, total points, streak metadata, and awarded-milestone tracking to prevent re-awards).
- Detect continuous day streaks from existing ClassEvent activity (a day counts if ≥1 event exists for that date) and award milestone points once per milestone: 3-day streak (+5, show “Congrats on your hat-trick! +5 points.”) and 6-day streak (+10, show “Congrats on your 6-day streak! +10 points.”).
- Add a new `frontend/src/rank` folder and a Rank screen (“Weekly Ranking”) reachable from the app, showing an English weekly leaderboard (rank number, display name, points) and an English empty state when no data exists.
- Implement backend weekly ranking in `backend/main.mo` (single actor): register/update display name, record weekly point increments for the caller, and query the current week’s ranking ordered by weekly points.
- Wire frontend milestone awarding to backend: on awarding +5/+10, update local points and submit the weekly increment + ensure display name is registered/updated; show a non-blocking English error if backend calls fail.
- Update backup/export and restore/import to include new user profile/points/streak fields while remaining backward compatible by defaulting missing fields.

**User-visible outcome:** New users enter their name once to continue into the app; the app tracks consecutive-day activity streaks and awards points with congratulatory messages; users can open a Weekly Ranking screen to see a backend-powered leaderboard for the current week.
