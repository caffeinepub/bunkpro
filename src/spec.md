# Specification

## Summary
**Goal:** Make the Rank screen display a truly global, deterministic, scalable leaderboard from the Internet Computer canister, with correct weekly snapshot logic and clear user messaging.

**Planned changes:**
- Remove any device-specific, cached, or current-user-only filtering so Rank always fetches the global leaderboard from the canister (cache only as clearly-labeled stale fallback when the canister is unreachable).
- Update the backend leaderboard data contract to return required public fields for every user: user_id, name, college, total_points, current_streak, longest_streak, join_date, with no per-caller scoping.
- Compute ranks at runtime from the full global dataset using deterministic sorting tie-breakers: total_points (desc), longest_streak (desc), join_date (asc), with rank = index + 1 and no persisted static rank.
- Fix pagination/incremental loading so the UI can load and render the complete ranked list for 100+ users without truncation (via repeated page fetches until exhausted or an explicit “load more” flow).
- Update the Rank UI to reliably highlight the current user using a stable identifier (not name matching), label them as “You”, and auto-scroll them into view when they are not in the Top 3.
- Implement/correct weekly snapshot/rollover logic using an authoritative last_update_date (or equivalent) so recalculation is idempotent and runs at most once per Sunday 12:00 AM boundary.
- Ensure safe polling/refetching while Rank is visible (no leaking intervals) and prefer fresh backend results over cached/stale data when reachable.
- Ensure all ranking-related UI text is clear English, including explicit stale-data warnings and an error/retry state when the leaderboard cannot be loaded.

**User-visible outcome:** All authenticated users see the same global leaderboard with correct ranks and consistent ordering across devices; the list scales past 100 users, highlights and scrolls to “You” correctly, updates via safe polling, and shows clear English stale/error messaging when needed.
