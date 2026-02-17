// Past attendance sheet with local-date-safe calendar selection, debug logging for schedule lookup failures, and date-scoped upsert via async onSave handler

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { cn, generateId, formatDate, isFutureDate, getTodayString } from '../../lib/utils';
import { getScheduleForDate } from '../../domain/scheduleForDate';
import { toast } from 'sonner';
import type { Subject, TimetableSlot, ClassEvent, ClassStatus, ClassExchange } from '../../domain/attendanceTypes';

interface PastClass {
  subjectId: string;
  subjectName: string;
  timeSlot: number;
  status: ClassStatus;
}

interface MarkPastAttendanceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  timetable: TimetableSlot[];
  exchanges: ClassExchange[];
  existingEvents: ClassEvent[];
  onSave: (date: string, events: ClassEvent[], isEdit: boolean) => Promise<void>;
}

type FlowStep = 'select-date' | 'mark-attendance';

export function MarkPastAttendanceSheet({
  open,
  onOpenChange,
  subjects,
  timetable,
  exchanges,
  existingEvents,
  onSave,
}: MarkPastAttendanceSheetProps) {
  const [step, setStep] = useState<FlowStep>('select-date');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [pastClasses, setPastClasses] = useState<PastClass[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state only when sheet is explicitly closed (open -> false)
  useEffect(() => {
    if (!open) {
      setStep('select-date');
      setSelectedDate(undefined);
      setPastClasses([]);
      setIsEditMode(false);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    // Use local calendar date (no UTC conversion)
    const dateString = formatDate(date);

    // Block future dates
    if (isFutureDate(dateString)) {
      toast.error('You cannot mark attendance for a future date.');
      return;
    }

    // Check if attendance already marked for this date
    const existingEventsForDate = existingEvents.filter(event => event.date === dateString && !event.isExtra);
    const hasExistingAttendance = existingEventsForDate.length > 0;

    // Get scheduled classes for this date
    const scheduledClasses = getScheduleForDate(dateString, timetable, subjects, exchanges);

    if (scheduledClasses.length === 0) {
      // Debug logging before showing error
      const weekday = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      const timetableDays = [...new Set(timetable.map(slot => slot.day))].sort();
      
      console.log('[MarkPastAttendance] No classes found for selected date:', {
        selectedDate: dateString,
        weekday,
        weekdayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekday],
        timetableDaysConfigured: timetableDays,
        totalTimetableSlots: timetable.length,
        slotsForThisDay: timetable.filter(slot => slot.day === weekday).length,
      });
      
      toast.error('No classes scheduled for this date');
      return;
    }

    let classes: PastClass[];

    if (hasExistingAttendance) {
      // Edit mode: prefill from existing events
      setIsEditMode(true);
      classes = scheduledClasses.map(cls => {
        const existingEvent = existingEventsForDate.find(e => e.subjectId === cls.subjectId);
        return {
          subjectId: cls.subjectId,
          subjectName: cls.subjectName,
          timeSlot: cls.timeSlot,
          status: existingEvent?.status || 'attended',
        };
      });
      toast.info('Editing existing attendance for this date');
    } else {
      // Create mode: default to attended
      setIsEditMode(false);
      classes = scheduledClasses.map(cls => ({
        subjectId: cls.subjectId,
        subjectName: cls.subjectName,
        timeSlot: cls.timeSlot,
        status: 'attended' as ClassStatus,
      }));
    }

    // Set state and transition to mark-attendance step
    setSelectedDate(date);
    setPastClasses(classes);
    setStep('mark-attendance');
  };

  const handleStatusChange = (index: number, status: ClassStatus) => {
    setPastClasses(prev =>
      prev.map((cls, i) => (i === index ? { ...cls, status } : cls))
    );
  };

  const handleSave = async () => {
    if (!selectedDate || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Use local calendar date
      const dateString = formatDate(selectedDate);

      const events: ClassEvent[] = pastClasses.map(cls => ({
        id: generateId(),
        subjectId: cls.subjectId,
        date: dateString,
        status: cls.status,
        isExtra: false,
        timestamp: Date.now(),
      }));

      await onSave(dateString, events, isEditMode);
      onOpenChange(false);
      toast.success(isEditMode ? 'Attendance updated successfully' : 'Past attendance saved successfully');
    } catch (error) {
      // Error handling is done in parent (App.tsx)
      console.error('Save failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep('select-date');
    setSelectedDate(undefined);
    setPastClasses([]);
    setIsEditMode(false);
  };

  const handleSheetOpenChange = (newOpen: boolean) => {
    // Only allow closing the sheet, not opening
    if (!newOpen) {
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        {step === 'select-date' && (
          <>
            <SheetHeader>
              <SheetTitle>Mark Past Attendance</SheetTitle>
              <SheetDescription>
                Select a past date to mark or edit attendance
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 flex flex-col items-center space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You can mark or edit attendance for past dates. Future dates are not allowed.
                </AlertDescription>
              </Alert>

              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  const dateString = formatDate(date);
                  return isFutureDate(dateString) || date > new Date();
                }}
                className="premium-calendar"
              />
            </div>
          </>
        )}

        {step === 'mark-attendance' && (
          <>
            <SheetHeader>
              <SheetTitle>{isEditMode ? 'Edit Attendance' : 'Mark Attendance'}</SheetTitle>
              <SheetDescription>
                {selectedDate && (
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4 max-h-[calc(80vh-220px)] overflow-y-auto">
              {pastClasses.map((cls, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{cls.subjectName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Period {cls.timeSlot + 1}
                      </p>
                    </div>
                    <Badge
                      variant={
                        cls.status === 'attended'
                          ? 'default'
                          : cls.status === 'missed'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {cls.status}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={cls.status === 'attended' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleStatusChange(index, 'attended')}
                      disabled={isSubmitting}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Present
                    </Button>
                    <Button
                      variant={cls.status === 'missed' ? 'destructive' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleStatusChange(index, 'missed')}
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Absent
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleBack} 
                className="flex-1"
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button 
                onClick={handleSave} 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Attendance' : 'Save Attendance'}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
