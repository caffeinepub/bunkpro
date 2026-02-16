// Weekly ranking leaderboard page

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Trophy, Medal, Award, AlertCircle } from 'lucide-react';
import { useActor } from '../hooks/useActor';
import { fetchWeeklyRanking, type RankingData } from './rankApi';

interface RankPageProps {
  onBack: () => void;
}

export function RankPage({ onBack }: RankPageProps) {
  const { actor } = useActor();
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRankings();
  }, [actor]);

  const loadRankings = async () => {
    if (!actor) return;
    
    setIsLoading(true);
    setError(null);
    
    const result = await fetchWeeklyRanking(actor);
    
    if (result.success && result.data) {
      setRankings(result.data);
    } else {
      setError(result.error || 'Failed to load rankings');
    }
    
    setIsLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Weekly Ranking</h1>
          <p className="text-muted-foreground">Top performers this week</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Leaderboard Card */}
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
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-6 flex-1" />
                  <Skeleton className="w-16 h-6" />
                </div>
              ))}
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-lg font-medium">
                No rankings yet this week
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Be the first to earn points by maintaining your attendance streak!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {rankings.map((entry) => (
                <div
                  key={`${entry.rank}-${entry.displayName}`}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                    entry.rank <= 3
                      ? 'bg-primary/5 border border-primary/20'
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 border-primary/20 font-bold text-lg">
                    {getRankIcon(entry.rank) || entry.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg truncate">
                      {entry.displayName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {entry.points}
                    </p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">How to earn points:</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Maintain a 3-day streak: +5 points</li>
            <li>• Maintain a 6-day streak: +10 points</li>
            <li>• Keep marking your attendance daily to build streaks!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
