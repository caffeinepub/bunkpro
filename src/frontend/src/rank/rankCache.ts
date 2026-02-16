// Local caching helper for weekly ranking data to support offline viewing with safe error handling
interface CachedRanking {
  data: Array<{
    rank: number;
    displayName: string;
    points: number;
  }>;
  fetchedAt: number;
}

const CACHE_KEY = 'bunkpro_ranking_cache';

export function saveRankingCache(data: CachedRanking['data']): void {
  try {
    const cached: CachedRanking = {
      data,
      fetchedAt: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.error('Failed to save ranking cache:', error);
  }
}

export function loadRankingCache(): CachedRanking | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const parsed = JSON.parse(cached) as CachedRanking;
    
    // Validate cache structure
    if (!parsed.data || !Array.isArray(parsed.data)) {
      console.warn('Invalid cache structure, clearing cache');
      clearRankingCache();
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load ranking cache:', error);
    clearRankingCache();
    return null;
  }
}

export function clearRankingCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Failed to clear ranking cache:', error);
  }
}
