// Repository layer for fetching leaderboard data from the canister with pagination support
import type { backendInterface, RankingDetails } from '../backend';
import { mapBackendEntryToUI, type RankingUIEntry } from './RankingModel';

export class RankingRepository {
  constructor(private actor: backendInterface) {}

  /**
   * Fetches a page of ranking entries from the backend using the global ranking endpoint
   * @param start Starting index (0-based)
   * @param count Number of entries to fetch
   * @returns Array of UI-ready ranking entries with correct global ranks
   */
  async fetchPage(start: number, count: number): Promise<RankingUIEntry[]> {
    try {
      // Use the correct backend method: getGlobalRankingPaginated
      const entries: RankingDetails[] = await this.actor.getGlobalRankingPaginated(
        BigInt(start),
        BigInt(count)
      );

      // Map to UI model with correct global rank numbers
      // Ranks are calculated as start + index + 1 to maintain stable numbering across pages
      return entries.map((entry, index) =>
        mapBackendEntryToUI(entry, start + index + 1)
      );
    } catch (error) {
      console.error('Repository: Failed to fetch ranking page:', error);
      throw new Error('Failed to fetch ranking data from backend');
    }
  }

  /**
   * Fetches all ranking entries (for initial load or refresh)
   * Uses pagination internally to avoid overwhelming the backend
   */
  async fetchAll(): Promise<RankingUIEntry[]> {
    try {
      // Fetch first page to determine if we need more
      const firstPage = await this.fetchPage(0, 100);
      
      // If we got less than 100, we have everything
      if (firstPage.length < 100) {
        return firstPage;
      }

      // Otherwise, fetch remaining pages
      const allEntries = [...firstPage];
      let currentStart = 100;
      const pageSize = 100;

      while (true) {
        const page = await this.fetchPage(currentStart, pageSize);
        if (page.length === 0) break;
        
        allEntries.push(...page);
        
        if (page.length < pageSize) break;
        currentStart += pageSize;
      }

      return allEntries;
    } catch (error) {
      console.error('Repository: Failed to fetch all rankings:', error);
      throw error;
    }
  }

  /**
   * Submits points for the current user
   */
  async submitPoints(points: number): Promise<{ success: boolean; newTotal?: number }> {
    try {
      const result = await this.actor.addPoints(BigInt(points));
      
      if (result.__kind__ === 'success') {
        return { success: true, newTotal: Number(result.success) };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Repository: Failed to submit points:', error);
      return { success: false };
    }
  }
}
