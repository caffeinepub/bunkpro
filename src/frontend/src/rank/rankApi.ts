// Ranking data access helpers for backend integration

import type { backendInterface, RankingEntry } from '../backend';

export interface RankingData {
  rank: number;
  displayName: string;
  points: number;
}

export async function registerUserDisplayName(
  actor: backendInterface,
  displayName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await actor.registerDisplayName(displayName);
    if (result) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to register display name' };
    }
  } catch (error) {
    console.error('Error registering display name:', error);
    return { success: false, error: 'Network error while registering name' };
  }
}

export async function submitPoints(
  actor: backendInterface,
  displayName: string,
  points: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await actor.addPoints(displayName, BigInt(points));
    return { success: true };
  } catch (error) {
    console.error('Error submitting points:', error);
    return { success: false, error: 'Failed to submit points to leaderboard' };
  }
}

export async function fetchWeeklyRanking(
  actor: backendInterface
): Promise<{ success: boolean; data?: RankingData[]; error?: string }> {
  try {
    const entries: RankingEntry[] = await actor.getCurrentWeekRanking();
    
    const rankingData: RankingData[] = entries.map((entry, index) => ({
      rank: index + 1,
      displayName: entry.displayName,
      points: Number(entry.points),
    }));
    
    return { success: true, data: rankingData };
  } catch (error) {
    console.error('Error fetching ranking:', error);
    return { success: false, error: 'Failed to load leaderboard' };
  }
}
