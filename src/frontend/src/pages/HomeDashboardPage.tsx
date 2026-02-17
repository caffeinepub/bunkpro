// Home dashboard with disabled mark-today button when attendance already marked for today, passing correct navigation props and handling subject addition and milestone awards with proper backend integration

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Calendar, TrendingUp, AlertCircle, History } from 'lucide-react';
import { useAppStore } from '../state/appStore';
import { CircularProgress } from '../components/dashboard/CircularProgress';
import { SubjectAttendanceCard } from '../components/dashboard/SubjectAttendanceCard';
import { BunkableClassesCard } from '../components/dashboard/BunkableClassesCard';
import { SubjectFormDialog } from '../components/subjects/SubjectFormDialog';
import { calculateSubjectStats, calculateOverallStats } from '../domain/attendanceCalculations';
import { computeContinuousDayStreak, checkMilestoneEligibility } from '../domain/streakMilestones';
import { getTodayString } from '../lib/utils';
import { useActor } from '../hooks/useActor';
import { RankingService } from '../rank/RankingService';
import { sendNotification } from '../notifications/notificationsApi';
import { toast } from 'sonner';
import type { Subject } from '../domain/attendanceTypes';

interface HomeDashboardPageProps {
  onNavigate: (route: { type: 'subject-details'; subjectId: string }) => void;
  onOpenMarkToday?: () => void;
}

export function HomeDashboardPage({ onNavigate, onOpenMarkToday }: HomeDashboardPageProps) {
  const { state, dispatch } = useAppStore();
  const { actor } = useActor();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const todayString = getTodayString();
  const isTodayMarked = !!state.dailyAttendance[todayString];

  // Check for streak milestones and award points
  useEffect(() => {
    const checkAndAwardMilestones = async () => {
      if (!actor) return;

      const currentStreak = computeContinuousDayStreak(state.events);
      const milestone = checkMilestoneEligibility(
        currentStreak,
        state.streakMilestones
      );

      if (milestone) {
        // Submit points to backend
        try {
          const service = new RankingService(actor);
          const result = await service.submitPoints(milestone.points);
          
          if (result.success) {
            // Award milestone locally
            dispatch({
              type: 'AWARD_MILESTONE',
              payload: {
                points: milestone.points,
                milestone: {
                  streakId: milestone.streakId,
                  milestoneType: milestone.type,
                  awardedAt: Date.now(),
                },
              },
            });

            // Show toast
            toast.success(
              `🎉 ${milestone.type} streak milestone! +${milestone.points} points`,
              { duration: 5000 }
            );

            // Send browser notification if enabled and reward alerts are on
            if (
              state.settings.enableNotifications &&
              state.settings.notificationPreferences.rewardAlerts
            ) {
              await sendNotification(
                'Streak Milestone Achieved! 🎉',
                {
                  body: `You've reached a ${milestone.type} streak! +${milestone.points} points earned.`,
                  tag: 'milestone-reward',
                },
                true
              );
            }
          } else {
            console.error('Failed to submit points to backend');
          }
        } catch (error) {
          console.error('Error submitting milestone points:', error);
        }
      }
    };

    checkAndAwardMilestones();
  }, [state.events, state.streakMilestones, state.settings.enableNotifications, state.settings.notificationPreferences.rewardAlerts, actor, dispatch]);

  const overallStats = calculateOverallStats(
    state.subjects,
    state.events
  );

  const subjectStats = state.subjects.map((subject) =>
    calculateSubjectStats(subject.id, state.events)
  );

  const handleAddSubject = (subject: Subject) => {
    dispatch({ type: 'ADD_SUBJECT', payload: subject });
    setIsAddDialogOpen(false);
  };

  const handleSubjectClick = (subjectId: string) => {
    onNavigate({ type: 'subject-details', subjectId });
  };

  const currentStreak = computeContinuousDayStreak(state.events);

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Track your attendance and stay on target</p>
      </div>

      {/* Overall Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Attendance</CardTitle>
          <CardDescription>
            {overallStats.total > 0
              ? `${overallStats.attended} attended out of ${overallStats.total} classes`
              : 'No attendance data yet'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <CircularProgress
            percentage={overallStats.percentage}
            size={160}
            strokeWidth={12}
          />
          {state.settings.enableStreakCounter && currentStreak > 0 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold text-primary">{currentStreak} days 🔥</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bunkable Classes Card */}
      <BunkableClassesCard 
        attendedClasses={overallStats.attended}
        totalClasses={overallStats.total}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onOpenMarkToday}
          className="h-auto py-4 flex flex-col gap-2"
          disabled={isTodayMarked}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-sm">
            {isTodayMarked ? 'Attendance Marked' : "Mark Today's Classes"}
          </span>
        </Button>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          variant="outline"
          className="h-auto py-4 flex flex-col gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">Add Subject</span>
        </Button>
      </div>

      {/* Subjects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Subjects</h2>
          {state.subjects.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          )}
        </div>

        {state.subjects.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No subjects added yet. Add your first subject to start tracking attendance.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {state.subjects.map((subject, index) => {
              const stats = subjectStats.find(s => s.subjectId === subject.id);
              if (!stats) return null;

              return (
                <SubjectAttendanceCard
                  key={subject.id}
                  subject={subject}
                  stats={stats}
                  targetPercentage={state.settings.targetPercentage}
                  showPremiumInsights={state.settings.enablePremiumInsights}
                  onClick={() => handleSubjectClick(subject.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Add Subject Dialog */}
      <SubjectFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddSubject}
        existingNames={state.subjects.map(s => s.name)}
      />
    </div>
  );
}
