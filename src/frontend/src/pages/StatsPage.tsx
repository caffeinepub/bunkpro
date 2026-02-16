// Stats page displaying overall attendance summary with responsive layout and English copy
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, CheckCircle2, XCircle, Ban } from 'lucide-react';
import { useAppStore } from '../state/appStore';
import { calculateOverallStats } from '../domain/attendanceCalculations';
import { CircularProgress } from '../components/dashboard/CircularProgress';

export function StatsPage() {
  const { state } = useAppStore();
  const overallStats = calculateOverallStats(state.subjects, state.events);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Statistics</h1>
        <p className="text-muted-foreground">Your overall attendance performance</p>
      </div>

      {/* Overall Attendance Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Overall Attendance
          </CardTitle>
          <CardDescription>
            Across all {state.subjects.length} {state.subjects.length === 1 ? 'subject' : 'subjects'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <CircularProgress
            percentage={overallStats.percentage}
            size={160}
            strokeWidth={12}
          />
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">
              {overallStats.percentage.toFixed(1)}%
            </p>
            <p className="text-muted-foreground mt-1">
              {overallStats.attended} of {overallStats.total} classes attended
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallStats.attended}</p>
                <p className="text-sm text-muted-foreground">Attended</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-500/10">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallStats.missed}</p>
                <p className="text-sm text-muted-foreground">Missed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Ban className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallStats.cancelled}</p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Classes</span>
            <span className="font-semibold">{overallStats.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Target Percentage</span>
            <span className="font-semibold">{state.settings.targetPercentage}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status</span>
            <span className={`font-semibold ${
              overallStats.percentage >= state.settings.targetPercentage
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {overallStats.percentage >= state.settings.targetPercentage
                ? 'On Track'
                : 'Below Target'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
