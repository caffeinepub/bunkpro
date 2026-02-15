// Subject details page with responsive stats display, safe bunk and required-to-target calculators, recent activity, and action menu

import React, { useState } from 'react';
import { useAppStore } from '../state/appStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircularProgress } from '../components/dashboard/CircularProgress';
import { SubjectActionsMenu } from '../components/subjects/SubjectActionsMenu';
import { SubjectFormDialog } from '../components/subjects/SubjectFormDialog';
import { ConfirmDestructiveDialog } from '../components/subjects/ConfirmDestructiveDialog';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { calculateSubjectStats, calculateSafeBunk, calculateRequiredToTarget } from '../domain/attendanceCalculations';
import type { Subject } from '../domain/attendanceTypes';

interface SubjectDetailsPageProps {
  subjectId: string;
  onBack: () => void;
}

export function SubjectDetailsPage({ subjectId, onBack }: SubjectDetailsPageProps) {
  const { state, dispatch } = useAppStore();
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const subject = state.subjects.find(s => s.id === subjectId);
  
  if (!subject) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Subject not found</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  const stats = calculateSubjectStats(subjectId, state.events);
  const safeBunk = calculateSafeBunk(stats, state.settings.targetPercentage);
  const requiredToTarget = calculateRequiredToTarget(stats, state.settings.targetPercentage);

  const handleEdit = (updatedSubject: Subject) => {
    dispatch({ type: 'UPDATE_SUBJECT', payload: updatedSubject });
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_SUBJECT', payload: subjectId });
    onBack();
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_SUBJECT', payload: subjectId });
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: subject.color }}
            />
            <h1 className="text-2xl sm:text-3xl font-bold truncate">{subject.name}</h1>
          </div>
        </div>
        <SubjectActionsMenu
          onEdit={() => setShowEdit(true)}
          onReset={() => setShowResetConfirm(true)}
          onDelete={() => setShowDeleteConfirm(true)}
        />
      </div>

      {/* Stats Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="grid grid-cols-3 gap-4 sm:gap-8 w-full sm:w-auto">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-sm text-muted-foreground">Attended</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.attended}</p>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-sm text-muted-foreground">Missed</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.missed}</p>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl sm:text-3xl font-bold text-muted-foreground">{stats.cancelled}</p>
              </div>
            </div>
            <CircularProgress percentage={stats.percentage} size={140} />
          </div>
        </CardContent>
      </Card>

      {/* Calculators */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingDown className="w-5 h-5 text-orange-500 shrink-0" />
              Safe Bunk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl sm:text-4xl font-bold">{safeBunk}</p>
              <p className="text-sm text-muted-foreground">
                {safeBunk === 0
                  ? `You're at or below ${state.settings.targetPercentage}%. Attend next class!`
                  : `You can miss ${safeBunk} more ${safeBunk === 1 ? 'class' : 'classes'} safely`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="w-5 h-5 text-green-500 shrink-0" />
              Required to Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl sm:text-4xl font-bold">{requiredToTarget}</p>
              <p className="text-sm text-muted-foreground">
                {requiredToTarget === 0
                  ? `You're above ${state.settings.targetPercentage}%! Great job!`
                  : `Attend ${requiredToTarget} more ${requiredToTarget === 1 ? 'class' : 'classes'} to reach ${state.settings.targetPercentage}%`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.total === 0 ? (
            <p className="text-center text-muted-foreground py-8">No classes recorded yet</p>
          ) : (
            <div className="space-y-2">
              {state.events
                .filter(e => e.subjectId === subjectId)
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 10)
                .map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 gap-4">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{new Date(event.date).toLocaleDateString()}</p>
                      {event.isExtra && (
                        <Badge variant="outline" className="mt-1">Extra Class</Badge>
                      )}
                    </div>
                    <Badge 
                      variant={
                        event.status === 'attended' ? 'default' :
                        event.status === 'missed' ? 'destructive' :
                        'secondary'
                      }
                      className="shrink-0"
                    >
                      {event.status}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SubjectFormDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        subject={subject}
        existingNames={state.subjects.filter(s => s.id !== subjectId).map(s => s.name)}
        onSave={handleEdit}
      />

      <ConfirmDestructiveDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Subject"
        description={`Are you sure you want to delete "${subject.name}"? This will also delete all attendance records for this subject. This action cannot be undone.`}
        onConfirm={handleDelete}
      />

      <ConfirmDestructiveDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="Reset Subject"
        description={`Are you sure you want to reset all attendance records for "${subject.name}"? This action cannot be undone.`}
        onConfirm={handleReset}
      />
    </div>
  );
}
