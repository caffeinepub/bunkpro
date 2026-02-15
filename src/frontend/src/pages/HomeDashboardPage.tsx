// Home dashboard page with responsive layout, overall stats, subject cards with premium insights, Mark Today functionality, and notification support

import React, { useState } from 'react';
import { useAppStore } from '../state/appStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubjectAttendanceCard } from '../components/dashboard/SubjectAttendanceCard';
import { CircularProgress } from '../components/dashboard/CircularProgress';
import { MarkTodaySheet } from '../components/markToday/MarkTodaySheet';
import { SubjectFormDialog } from '../components/subjects/SubjectFormDialog';
import { Plus, Calendar } from 'lucide-react';
import { calculateSubjectStats, calculateOverallStats, getInsightMessage, calculateStreak } from '../domain/attendanceCalculations';
import { getTrendDirection } from '../domain/premiumInsights';
import { sendNotification, getNotificationPermission } from '../notifications/notificationsApi';
import { getMultipleMarkingsNotification } from '../notifications/localNotificationMessages';
import type { Subject, ClassEvent } from '../domain/attendanceTypes';

interface HomeDashboardPageProps {
  onSubjectClick: (subjectId: string) => void;
}

export function HomeDashboardPage({ onSubjectClick }: HomeDashboardPageProps) {
  const { state, dispatch } = useAppStore();
  const [showMarkToday, setShowMarkToday] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);

  const overallStats = calculateOverallStats(state.subjects, state.events);
  const overallInsight = getInsightMessage(overallStats, state.settings.targetPercentage);

  const handleAddSubject = (subject: Subject) => {
    dispatch({ type: 'ADD_SUBJECT', payload: subject });
  };

  const handleSaveMarkToday = (events: ClassEvent[]) => {
    dispatch({ type: 'ADD_EVENTS', payload: events });

    // Send notification if enabled and permission granted
    if (state.settings.enableNotifications && getNotificationPermission() === 'granted') {
      const attended = events.filter(e => e.status === 'attended').length;
      const missed = events.filter(e => e.status === 'missed').length;
      const cancelled = events.filter(e => e.status === 'cancelled').length;

      if (attended > 0 || missed > 0 || cancelled > 0) {
        const notification = getMultipleMarkingsNotification(attended, missed, cancelled);
        sendNotification({
          title: notification.title,
          body: notification.body,
          tag: 'mark-classes',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Track your attendance</p>
        </div>
        <Button onClick={() => setShowAddSubject(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Overall Stats Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <CardHeader>
          <CardTitle>Overall Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="grid grid-cols-3 gap-6 sm:gap-8 w-full sm:w-auto">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{overallStats.total}</p>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-sm text-muted-foreground">Attended</p>
                <p className="text-xl font-semibold text-green-600">{overallStats.attended}</p>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-sm text-muted-foreground">Missed</p>
                <p className="text-xl font-semibold text-red-600">{overallStats.missed}</p>
              </div>
            </div>
            <CircularProgress percentage={overallStats.percentage} size={140} />
          </div>
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium">{overallInsight}</p>
          </div>
        </CardContent>
      </Card>

      {/* Mark Today Button */}
      <Button 
        onClick={() => setShowMarkToday(true)} 
        size="lg" 
        className="w-full"
      >
        <Calendar className="w-5 h-5 mr-2" />
        Mark Today's Classes
      </Button>

      {/* Subjects List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Subjects</h2>
        {state.subjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No subjects yet</p>
              <Button onClick={() => setShowAddSubject(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Subject
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.subjects.map(subject => {
              const stats = calculateSubjectStats(subject.id, state.events);
              const recentEvents = state.events
                .filter(e => e.subjectId === subject.id)
                .slice(-5);
              const streak = state.settings.enableStreakCounter 
                ? calculateStreak(subject.id, state.events)
                : undefined;
              const trend = state.settings.enablePremiumInsights
                ? getTrendDirection(stats, recentEvents)
                : undefined;

              return (
                <SubjectAttendanceCard
                  key={subject.id}
                  subject={subject}
                  stats={stats}
                  targetPercentage={state.settings.targetPercentage}
                  streak={streak}
                  trend={trend}
                  showPremiumInsights={state.settings.enablePremiumInsights}
                  onClick={() => onSubjectClick(subject.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <MarkTodaySheet
        open={showMarkToday}
        onOpenChange={setShowMarkToday}
        subjects={state.subjects}
        timetable={state.timetable}
        onSave={handleSaveMarkToday}
      />

      <SubjectFormDialog
        open={showAddSubject}
        onOpenChange={setShowAddSubject}
        existingNames={state.subjects.map(s => s.name)}
        onSave={handleAddSubject}
      />
    </div>
  );
}
