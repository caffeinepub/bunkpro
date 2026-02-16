// Centralized ranking UI models and types for the global leaderboard system
import type { RankingDetails } from '../backend';

export interface RankingUIEntry {
  rank: number;
  userId?: string; // Stable user identifier (principal as string) - optional for backward compat
  displayName: string;
  college: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  joinDate: number;
}

export interface RankingPageData {
  entries: RankingUIEntry[];
  totalCount: number;
  hasMore: boolean;
}

export interface RankingLoadState {
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  isStale: boolean;
}

/**
 * Safely maps backend RankingDetails to UI model with proper type conversions
 */
export function mapBackendEntryToUI(
  entry: RankingDetails,
  rank: number
): RankingUIEntry {
  return {
    rank,
    displayName: entry.displayName,
    college: entry.college || 'Unknown',
    totalPoints: Number(entry.points),
    currentStreak: Number(entry.streak),
    longestStreak: Number(entry.longestStreak),
    joinDate: Number(entry.joinDate),
  };
}

/**
 * Validates that a ranking entry has all required display fields
 */
export function isValidRankingEntry(entry: RankingUIEntry): boolean {
  return (
    typeof entry.rank === 'number' &&
    entry.rank > 0 &&
    typeof entry.displayName === 'string' &&
    entry.displayName.trim().length > 0 &&
    typeof entry.totalPoints === 'number' &&
    entry.totalPoints >= 0
  );
}
