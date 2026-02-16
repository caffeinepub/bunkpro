// Service layer orchestrating ranking data fetch, cache, and polling behavior
import type { backendInterface } from '../backend';
import { RankingRepository } from './RankingRepository';
import { saveRankingCache, loadRankingCache, clearRankingCache } from './rankCache';
import type { RankingUIEntry, RankingPageData } from './RankingModel';

export interface FetchResult {
  success: boolean;
  data?: RankingUIEntry[];
  error?: string;
  isStale?: boolean;
}

export class RankingService {
  private repository: RankingRepository;

  constructor(actor: backendInterface) {
    this.repository = new RankingRepository(actor);
  }

  /**
   * Fetches the current week's ranking with cache fallback
   * Backend is always the primary source; cache is only used on failure
   */
  async fetchRanking(): Promise<FetchResult> {
    try {
      // Always fetch from backend first
      const entries = await this.repository.fetchAll();
      
      // On successful fetch, save to cache and clear any stale state
      this.saveToCacheCompat(entries);
      
      return { success: true, data: entries, isStale: false };
    } catch (error) {
      console.error('Service: Failed to fetch ranking from backend:', error);
      
      // Only use cache as fallback when backend is unreachable
      const cached = this.loadFromCacheCompat();
      if (cached && cached.length > 0) {
        return {
          success: true,
          data: cached,
          isStale: true,
          error: 'Showing cached data - leaderboard may be outdated',
        };
      }
      
      return { 
        success: false, 
        error: 'Cannot load leaderboard. Please check your connection and try again.' 
      };
    }
  }

  /**
   * Fetches a specific page for incremental loading
   */
  async fetchPage(start: number, count: number): Promise<FetchResult> {
    try {
      const entries = await this.repository.fetchPage(start, count);
      return { success: true, data: entries };
    } catch (error) {
      console.error('Service: Failed to fetch page:', error);
      return { success: false, error: 'Failed to load more entries' };
    }
  }

  /**
   * Submits points for the current user
   */
  async submitPoints(points: number): Promise<{ success: boolean; error?: string }> {
    const result = await this.repository.submitPoints(points);
    
    if (result.success) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to submit points to leaderboard' };
    }
  }

  /**
   * Saves ranking data to cache (compatibility with existing cache format)
   */
  private saveToCacheCompat(entries: RankingUIEntry[]): void {
    try {
      const compatData = entries.map(e => ({
        rank: e.rank,
        displayName: e.displayName,
        points: e.totalPoints,
      }));
      saveRankingCache(compatData);
    } catch (error) {
      console.error('Service: Failed to save cache:', error);
    }
  }

  /**
   * Loads ranking data from cache (compatibility with existing cache format)
   */
  private loadFromCacheCompat(): RankingUIEntry[] | null {
    try {
      const cached = loadRankingCache();
      if (!cached || !cached.data || cached.data.length === 0) return null;

      return cached.data.map(e => ({
        rank: e.rank,
        displayName: e.displayName,
        college: 'Unknown',
        totalPoints: e.points,
        currentStreak: 0,
        longestStreak: 0,
        joinDate: 0,
      }));
    } catch (error) {
      console.error('Service: Failed to load cache:', error);
      return null;
    }
  }
}
