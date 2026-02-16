# Specification

## Summary
**Goal:** Add a logout flow that deletes the current user’s leaderboard record from the backend and erases all locally stored app data, fully signing the user out.

**Planned changes:**
- Backend: Add an authenticated endpoint in `backend/main.mo` that deletes only the caller’s user record from the `users` map so they are removed from global ranking results (safe no-op if no record exists).
- Frontend: Add a clearly labeled “Log out” button in Settings with a confirmation step explaining that local data will be erased and leaderboard data will be deleted.
- Frontend: On confirm, call the backend delete endpoint when available; show a clear English error if the backend cannot be reached and do not claim leaderboard deletion succeeded.
- Frontend: Clear local persistence (IndexedDB via the existing client), clear cached ranking data (e.g., `rankCache` in localStorage), reset in-memory state via `RESET_ALL` so `state.userProfile` becomes null, and return to the Login flow.
- Frontend: Log out of Internet Identity using the existing `useInternetIdentity().clear()` API so the next session starts unauthenticated.

**User-visible outcome:** Users can tap “Log out” in Settings, confirm, and have their local app data erased, their leaderboard entry removed (when the backend call succeeds), and be returned to the Login screen fully signed out of Internet Identity.
