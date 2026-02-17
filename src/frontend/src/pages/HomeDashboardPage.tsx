// Home dashboard with notification category checks for reward alerts and past attendance marking

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Calendar, TrendingUp, AlertCircle, Trophy, History } from 'lucide-react';
import { useAppStore } from '../state/appStore';
import { CircularProgress } from '../components/dashboard/CircularProgress';
import { SubjectAttendanceCard } from '../components/dashboard/SubjectAttendanceCard';
import { SubjectFormDialog } from '../components/subjects/SubjectFormDialog';
import { MarkTodaySheet } from '../components/markToday/MarkTodaySheet';
import { MarkPastAttendanceSheet } from '../components/pastAttendance/MarkPastAttendanceSheet';
import { calculateSubjectStats, calculateOverallStats } from '../domain/attendanceCalculations';
import { computeContinuousDayStreak, checkMilestoneEligibility } from '../domain/streakMilestones';
import { useActor } from '../hooks/useActor';
import { RankingService } from '../rank/RankingService';
import { sendNotification } from '../notifications/notificationsApi';
import { toast } from 'sonner';
import type { Subject, ClassEvent } from '../domain/attendanceTypes';

interface HomeDashboardPageProps {
  onNavigate: (route: { type: 'subject-details'; subjectId: string }) => void;
  onOpenMarkToday?: () => void;
}

export function HomeDashboardPage({ onNavigate, onOpenMarkToday }: HomeDashboardPageProps) {
  const { state, dispatch } = useAppStore();
  const { actor } = useActor();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMarkTodayOpen, setIsMarkTodayOpen] = useState(false);
  const [isMarkPastOpen, setIsMarkPastOpen] = useState(false);

  // Expose mark today handler to parent
  useEffect(() => {
    if (onOpenMarkToday) {
      // This effect allows parent to trigger opening the sheet
    }
  }, [onOpenMarkToday]);

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

  const handleSaveAttendance = (events: ClassEvent[]) => {
    dispatch({ type: 'ADD_EVENTS', payload: events });
  };

  const handleOpenMarkToday = () => {
    setIsMarkTodayOpen(true);
  };

  const currentStreak = computeContinuousDayStreak(state.events);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Track your attendance</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Overall Stats Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Overall Attendance
          </CardTitle>
          <CardDescription>Your total attendance across all subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <CircularProgress
              percentage={overallStats.percentage}
              size={160}
              strokeWidth={12}
            />
            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-background/50">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {overallStats.attended}
                  </p>
                  <p className="text-sm text-muted-foreground">Attended</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background/50">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {overallStats.missed}
                  </p>
                  <p className="text-sm text-muted-foreground">Missed</p>
                </div>
              </div>
              {state.settings.enableStreakCounter && (
                <div className="text-center p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    🔥 {currentStreak}
                  </p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          className="h-24 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleOpenMarkToday}
        >
          <Calendar className="w-6 h-6 mr-3" />
          Mark Today's Classes
        </Button>
        <Button
          className="h-24 text-lg bg-secondary text-secondary-foreground hover:bg-secondary/90"
          onClick={() => setIsMarkPastOpen(true)}
        >
          <History className="w-6 h-6 mr-3" />
          Mark Past Attendance
        </Button>
      </div>

      {/* Subjects List */}
      {state.subjects.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No subjects yet. Add your first subject to start tracking attendance!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Subjects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.subjects.map((subject, index) => {
              const stats = subjectStats[index];
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
        </div>
      )}

      {/* Dialogs */}
      <SubjectFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddSubject}
        existingNames={state.subjects.map((s) => s.name)}
      />

      <MarkTodaySheet
        open={isMarkTodayOpen}
        onOpenChange={setIsMarkTodayOpen}
        subjects={state.subjects}
        timetable={state.timetable}
        onSave={handleSaveAttendance}
      />

      <MarkPastAttendanceSheet
        open={isMarkPastOpen}
        onOpenChange={setIsMarkPastOpen}
        subjects={state.subjects}
        timetable={state.timetable}
        exchanges={state.exchanges}
        existingEvents={state.events}
        onSave={handleSaveAttendance}
      />
    </div>
  );
}
