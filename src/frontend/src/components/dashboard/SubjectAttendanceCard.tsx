// Subject attendance card component

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircularProgress } from './CircularProgress';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Subject, SubjectStats } from '../../domain/attendanceTypes';

interface SubjectAttendanceCardProps {
  subject: Subject;
  stats: SubjectStats;
  targetPercentage: number;
  streak?: number;
  trend?: 'up' | 'down' | 'stable';
  showPremiumInsights?: boolean;
  onClick?: () => void;
}

export function SubjectAttendanceCard({
  subject,
  stats,
  targetPercentage,
  streak,
  trend,
  showPremiumInsights,
  onClick,
}: SubjectAttendanceCardProps) {
  const isDanger = stats.percentage < targetPercentage && stats.total > 0;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
        'bg-gradient-to-br from-card to-card/50 backdrop-blur-sm',
        isDanger && 'ring-2 ring-destructive/50'
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: subject.color }}
              />
              <h3 className="font-semibold text-lg truncate">{subject.name}</h3>
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Attended:</span>
                <span className="font-medium text-foreground">{stats.attended}</span>
              </div>
              <div className="flex justify-between">
                <span>Missed:</span>
                <span className="font-medium text-foreground">{stats.missed}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium text-foreground">{stats.total}</span>
              </div>
            </div>

            {showPremiumInsights && (
              <div className="flex flex-wrap gap-2 pt-2">
                {isDanger && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Danger Zone
                  </Badge>
                )}
                {streak && streak > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    🔥 {streak} streak
                  </Badge>
                )}
                {trend && trend !== 'stable' && (
                  <Badge variant="outline" className="gap-1">
                    {trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    {trend}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <CircularProgress percentage={stats.percentage} size={100} />
        </div>
      </CardContent>
    </Card>
  );
}
