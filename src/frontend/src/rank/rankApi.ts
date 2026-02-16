// Compatibility layer for ranking API - delegates to RankingService while preserving existing imports
import type { backendInterface } from '../backend';
import { RankingService } from './RankingService';
import type { RankingUIEntry } from './RankingModel';

export interface RankingData {
  rank: number;
  displayName: string;
  points: number;
}

/**
 * Submits points for the current user
 * @deprecated Use RankingService directly for new code
 */
export async function submitPoints(
  actor: backendInterface,
  points: number
): Promise<{ success: boolean; error?: string }> {
  const service = new RankingService(actor);
  return service.submitPoints(points);
}

/**
 * Fetches the weekly ranking with cache fallback
 * @deprecated Use RankingService directly for new code
 */
export async function fetchWeeklyRanking(
  actor: backendInterface
): Promise<{ success: boolean; data?: RankingData[]; error?: string; isStale?: boolean }> {
  const service = new RankingService(actor);
  const result = await service.fetchRanking();
  
  if (result.success && result.data) {
    // Convert to legacy format
    const legacyData: RankingData[] = result.data.map(entry => ({
      rank: entry.rank,
      displayName: entry.displayName,
      points: entry.totalPoints,
    }));
    
    return {
      success: true,
      data: legacyData,
      isStale: result.isStale,
      error: result.error,
    };
  }
  
  return {
    success: false,
    error: result.error,
  };
}
