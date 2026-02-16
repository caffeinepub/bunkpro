// Main ranking screen with Top-3 showcase, current user highlight, auto-scroll, and polling
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

  // Setup polling while mounted and actor is available
  useEffect(() => {
    if (!actor || !serviceRef.current) return;

    // Clear any existing timer first
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
    }

    // Start polling
    pollingTimerRef.current = setInterval(() => {
      refreshRankingsQuietly();
    }, POLLING_INTERVAL);

    // Cleanup on unmount or actor change
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [actor]);

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
      
      // Clear error if backend fetch succeeded
      if (!result.isStale) {
        setError(null);
      } else if (result.error) {
        setError(result.error);
      }
    } else {
      setError(result.error || 'Failed to load rankings');
      setRankings([]);
    }

    setIsLoading(false);
  };

  const handleRefresh = async () => {
    if (!serviceRef.current || isRefreshing) return;

    setIsRefreshing(true);
    setError(null);
    setIsStale(false);

    const result = await serviceRef.current.fetchRanking();

    if (result.success && result.data) {
      setRankings(result.data);
      setIsStale(result.isStale || false);
      
      // Clear error if backend fetch succeeded
      if (!result.isStale) {
        setError(null);
      } else if (result.error) {
        setError(result.error);
      }
    } else {
      setError(result.error || 'Failed to load rankings');
    }

    setIsRefreshing(false);
  };

  const refreshRankingsQuietly = async () => {
    if (!serviceRef.current || isRefreshing || isLoading) return;

    const result = await serviceRef.current.fetchRanking();

    if (result.success && result.data) {
      setRankings(result.data);
      setIsStale(result.isStale || false);
      
      // Clear error if backend fetch succeeded
      if (!result.isStale) {
        setError(null);
      } else if (result.error) {
        setError(result.error);
      }
    }
    // Don't update error state on quiet refresh failure to avoid UI flicker
  };

  const topThree = rankings.slice(0, 3);
  const remaining = rankings.slice(3);

  return (
    <div className="space-y-6 relative">
      {showConfetti && <ConfettiBurst />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weekly Ranking</h1>
          <p className="text-muted-foreground">Global leaderboard - all users</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stale Data Warning */}
      {isStale && error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Error Alert with Retry */}
      {!isStale && error && rankings.length === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-6">
          {/* Top 3 Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
          {/* List Skeleton */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-14 h-14 rounded-full" />
                  <Skeleton className="h-6 flex-1" />
                  <Skeleton className="w-24 h-6" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : rankings.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <Trophy className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-lg font-medium">
                No rankings yet this week
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Be the first to earn points by maintaining your attendance streak!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top 3 Premium Section */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topThree.map((entry) => {
                const isCurrent = isCurrentUser(entry);
                let bgGradient = '';
                let icon: React.ReactElement | null = null;
                let iconColor = '';

                if (entry.rank === 1) {
                  bgGradient = 'from-yellow-400/20 via-yellow-500/10 to-yellow-600/5';
                  icon = <Crown className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />;
                  iconColor = 'text-yellow-600 dark:text-yellow-400';
                } else if (entry.rank === 2) {
                  bgGradient = 'from-gray-300/20 via-gray-400/10 to-gray-500/5';
                  icon = <Medal className="w-8 h-8 text-gray-600 dark:text-gray-400" />;
                  iconColor = 'text-gray-600 dark:text-gray-400';
                } else if (entry.rank === 3) {
                  bgGradient = 'from-amber-500/20 via-amber-600/10 to-amber-700/5';
                  icon = <Award className="w-8 h-8 text-amber-600 dark:text-amber-400" />;
                  iconColor = 'text-amber-600 dark:text-amber-400';
                }

                return (
                  <Card
                    key={`${entry.rank}-${entry.displayName}`}
                    className={`bg-gradient-to-br ${bgGradient} border-2 ${
                      isCurrent ? 'border-primary shadow-lg shadow-primary/20' : 'border-transparent'
                    } animate-in fade-in slide-in-from-bottom-4 duration-500`}
                    style={{ animationDelay: `${entry.rank * 100}ms` }}
                  >
                    <CardContent className="pt-6 text-center space-y-4">
                      <div className="flex justify-center">
                        {icon}
                      </div>
                      <RankBadge rank={entry.rank} />
                      <div>
                        <p className="font-bold text-xl truncate flex items-center justify-center gap-2">
                          {entry.displayName}
                          {isCurrent && (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary text-primary-foreground">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {entry.college}
                        </p>
                        <p className={`text-3xl font-bold mt-3 ${iconColor}`}>
                          {entry.totalPoints}
                        </p>
                        <p className="text-sm text-muted-foreground">points</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          🔥 {entry.currentStreak} day streak
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Remaining Users List */}
          {remaining.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Leaderboard
                </CardTitle>
                <CardDescription>
                  Rankings reset every week. Keep your streak going to earn more points!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4" ref={scrollAreaRef}>
                  <div className="space-y-3">
                    {remaining.map((entry) => {
                      const isCurrent = isCurrentUser(entry);
                      return (
                        <div
                          key={`${entry.rank}-${entry.displayName}`}
                          ref={isCurrent ? userRowRef : null}
                          className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                            isCurrent
                              ? 'bg-primary/10 border-2 border-primary shadow-md'
                              : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                          }`}
                        >
                          <RankBadge rank={entry.rank} />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-lg truncate flex items-center gap-2">
                              {entry.displayName}
                              {isCurrent && (
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary text-primary-foreground">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {entry.college}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{entry.totalPoints}</p>
                            <p className="text-xs text-muted-foreground">points</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              🔥 {entry.currentStreak}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
