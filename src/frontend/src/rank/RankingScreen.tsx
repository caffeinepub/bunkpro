// Main ranking screen with polling guards to prevent post-logout background calls
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, AlertCircle, RefreshCw, Crown, Medal, Award } from 'lucide-react';
import type { backendInterface } from '../backend';
import { RankingService } from './RankingService';
import type { RankingUIEntry } from './RankingModel';
import { RankBadge } from './RankBadge';
import { ConfettiBurst } from './ConfettiBurst';

interface RankingScreenProps {
  actor: backendInterface | null;
  currentUserName: string;
  currentUserId?: string; // Stable user identifier (principal as string)
}

const POLLING_INTERVAL = 30000; // 30 seconds

export function RankingScreen({ actor, currentUserName, currentUserId }: RankingScreenProps) {
  const [rankings, setRankings] = useState<RankingUIEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasScrolledToUser, setHasScrolledToUser] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const userRowRef = useRef<HTMLDivElement>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const serviceRef = useRef<RankingService | null>(null);
  const isMountedRef = useRef(true);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initialize service when actor changes
  useEffect(() => {
    if (actor) {
      serviceRef.current = new RankingService(actor);
    } else {
      serviceRef.current = null;
    }
    
    // Clear polling timer when actor changes
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, [actor]);

  // Initial load
  useEffect(() => {
    loadRankings();
  }, [actor]);

  // Setup polling with guards to prevent post-logout calls
  useEffect(() => {
    // Guard: Don't poll if no actor, no service, or not authenticated
    if (!actor || !serviceRef.current || !currentUserName) {
      return;
    }

    // Clear any existing timer first
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
    }

    // Start polling
    pollingTimerRef.current = setInterval(() => {
      // Additional guard inside interval: check if still mounted and authenticated
      if (isMountedRef.current && actor && currentUserName) {
        refreshRankingsQuietly();
      }
    }, POLLING_INTERVAL);

    // Cleanup on unmount or actor/user change
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [actor, currentUserName]);

  // Show confetti if current user is in Top 3
  useEffect(() => {
    if (rankings.length > 0 && currentUserName) {
      const userEntry = findCurrentUser(rankings);
      if (userEntry && userEntry.rank <= 3) {
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [rankings, currentUserName, currentUserId]);

  // Auto-scroll to current user (once per successful load)
  useEffect(() => {
    if (
      !hasScrolledToUser &&
      rankings.length > 0 &&
      currentUserName &&
      userRowRef.current &&
      scrollAreaRef.current
    ) {
      const userEntry = findCurrentUser(rankings);
      
      // Only auto-scroll if user is not in Top 3
      if (userEntry && userEntry.rank > 3) {
        setTimeout(() => {
          userRowRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          setHasScrolledToUser(true);
        }, 300);
      }
    }
  }, [rankings, currentUserName, currentUserId, hasScrolledToUser]);

  /**
   * Finds the current user in the rankings list
   * Uses userId (principal) if available, falls back to displayName
   */
  const findCurrentUser = (rankingsList: RankingUIEntry[]): RankingUIEntry | undefined => {
    // Prefer userId matching if available
    if (currentUserId) {
      const byId = rankingsList.find(r => r.userId === currentUserId);
      if (byId) return byId;
    }
    
    // Fallback to name matching (less reliable but maintains backward compatibility)
    return rankingsList.find(r => r.displayName === currentUserName);
  };

  /**
   * Checks if a ranking entry is the current user
   */
  const isCurrentUser = (entry: RankingUIEntry): boolean => {
    if (currentUserId && entry.userId) {
      return entry.userId === currentUserId;
    }
    return entry.displayName === currentUserName;
  };

  const loadRankings = async () => {
    if (!serviceRef.current) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsStale(false);
    setHasScrolledToUser(false);

    const result = await serviceRef.current.fetchRanking();

    if (result.success && result.data) {
      setRankings(result.data);
      setIsStale(result.isStale || false);
      if (result.error) {
        setError(result.error);
      }
    } else {
      setError(result.error || 'Failed to load rankings');
      setRankings([]);
    }

    setIsLoading(false);
  };

  const refreshRankingsQuietly = async () => {
    // Guard: Don't refresh if not mounted or no service
    if (!isMountedRef.current || !serviceRef.current) {
      return;
    }

    const result = await serviceRef.current.fetchRanking();

    // Guard: Don't update state if unmounted
    if (!isMountedRef.current) {
      return;
    }

    if (result.success && result.data) {
      setRankings(result.data);
      setIsStale(result.isStale || false);
      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRankings();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground">Loading rankings...</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error && rankings.length === 0) {
    return (
      <div className="space-y-6 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground">Global rankings</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} disabled={isRefreshing} className="w-full">
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Retrying...' : 'Retry'}
        </Button>
      </div>
    );
  }

  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);
  const currentUser = findCurrentUser(rankings);

  return (
    <div className="space-y-6 pb-6">
      {showConfetti && <ConfettiBurst />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">Global rankings</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          size="sm"
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stale Data Warning */}
      {isStale && error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Top 3 Showcase */}
      {top3.length > 0 && (
        <Card className="bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top 3
            </CardTitle>
            <CardDescription>The best performers this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {top3.map((entry) => {
                const isUser = isCurrentUser(entry);
                return (
                  <div
                    key={entry.rank}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isUser
                        ? 'bg-primary/10 border-primary shadow-lg scale-105'
                        : 'bg-background/50 border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <RankBadge rank={entry.rank} />
                      <div className="text-center">
                        <p className={`font-bold text-lg ${isUser ? 'text-primary' : ''}`}>
                          {entry.displayName}
                          {isUser && ' (You)'}
                        </p>
                        <p className="text-sm text-muted-foreground">{entry.college}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-bold text-xl text-primary">{entry.totalPoints}</p>
                          <p className="text-xs text-muted-foreground">Points</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-lg text-orange-500">🔥 {entry.currentStreak}</p>
                          <p className="text-xs text-muted-foreground">Streak</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rest of Rankings */}
      {rest.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Rankings</CardTitle>
            <CardDescription>
              {currentUser && currentUser.rank > 3
                ? `You are ranked #${currentUser.rank}`
                : 'Complete leaderboard'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]" ref={scrollAreaRef}>
              <div className="space-y-2">
                {rest.map((entry) => {
                  const isUser = isCurrentUser(entry);
                  return (
                    <div
                      key={entry.rank}
                      ref={isUser ? userRowRef : null}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        isUser
                          ? 'bg-primary/10 border-primary shadow-md'
                          : 'bg-background/50 border-border hover:bg-accent/50'
                      }`}
                    >
                      <RankBadge rank={entry.rank} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${isUser ? 'text-primary' : ''}`}>
                          {entry.displayName}
                          {isUser && ' (You)'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{entry.college}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <p className="font-bold text-primary">{entry.totalPoints}</p>
                          <p className="text-xs text-muted-foreground">pts</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-500">🔥 {entry.currentStreak}</p>
                          <p className="text-xs text-muted-foreground">streak</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {rankings.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No rankings available yet. Start tracking attendance to appear on the leaderboard!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
