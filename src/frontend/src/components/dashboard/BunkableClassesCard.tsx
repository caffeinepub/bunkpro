import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useBunkableClasses } from '../../hooks/useBunkableClasses';

interface BunkableClassesCardProps {
  attendedClasses: number;
  totalClasses: number;
}

export function BunkableClassesCard({ attendedClasses, totalClasses }: BunkableClassesCardProps) {
  const { data, isLoading, isError } = useBunkableClasses(attendedClasses, totalClasses);

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-muted/30 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
            Bunkable Classes
          </CardTitle>
          <CardDescription>Calculating safe bunk limit...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <Card className="bg-gradient-to-br from-muted/30 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
            Bunkable Classes
          </CardTitle>
          <CardDescription>Could not load bunkable class count</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to calculate at this time. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { maxBunkableClasses, isBelowRequired } = data;

  // Determine status styling
  const isCritical = maxBunkableClasses === 0 || isBelowRequired;
  const isRisk = !isCritical && maxBunkableClasses <= 2;
  const isSafe = !isCritical && !isRisk;

  const statusColor = isCritical
    ? 'text-red-600 dark:text-red-400'
    : isRisk
    ? 'text-orange-600 dark:text-orange-400'
    : 'text-green-600 dark:text-green-400';

  const borderColor = isCritical
    ? 'border-red-500/50 ring-2 ring-red-500/20'
    : isRisk
    ? 'border-orange-500/50 ring-2 ring-orange-500/20'
    : 'border-green-500/50 ring-2 ring-green-500/20';

  const bgGradient = isCritical
    ? 'from-red-500/10 to-red-500/5'
    : isRisk
    ? 'from-orange-500/10 to-orange-500/5'
    : 'from-green-500/10 to-green-500/5';

  const StatusIcon = isCritical ? AlertCircle : isRisk ? AlertTriangle : CheckCircle;

  return (
    <Card className={cn('bg-gradient-to-br', bgGradient, borderColor, 'transition-all duration-300')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className={cn('w-5 h-5', statusColor)} />
          Bunkable Classes
        </CardTitle>
        <CardDescription>
          Based on {data.requiredPercentage}% minimum attendance requirement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isBelowRequired ? (
            <div className="text-center py-4">
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                You cannot bunk any more classes. Attendance is below required limit.
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className={cn('text-5xl font-bold mb-2', statusColor)}>
                {maxBunkableClasses}
              </div>
              <p className="text-lg font-medium">
                You can bunk {maxBunkableClasses} more {maxBunkableClasses === 1 ? 'class' : 'classes'} safely.
              </p>
            </div>
          )}

          {/* Status message */}
          <div className={cn('text-center text-sm p-3 rounded-lg', isCritical ? 'bg-red-500/10' : isRisk ? 'bg-orange-500/10' : 'bg-green-500/10')}>
            {isCritical && (
              <p className="text-red-600 dark:text-red-400 font-medium">
                ⚠️ Critical: Attend all upcoming classes
              </p>
            )}
            {isRisk && (
              <p className="text-orange-600 dark:text-orange-400 font-medium">
                ⚡ Caution: Limited bunks remaining
              </p>
            )}
            {isSafe && (
              <p className="text-green-600 dark:text-green-400 font-medium">
                ✓ Safe: You have buffer classes available
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
