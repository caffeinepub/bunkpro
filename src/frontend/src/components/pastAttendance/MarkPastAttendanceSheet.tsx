// Past attendance marking flow with fixed date selection that properly transitions to subject marking step and renders scheduled subjects based on local weekday computation

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
import { cn, generateId, formatDateString, isFutureDate, getTodayString } from '../../lib/utils';
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
  onSave: (events: ClassEvent[]) => void;
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

  // Reset state only when sheet is explicitly closed (open -> false)
  useEffect(() => {
    if (!open) {
      setStep('select-date');
      setSelectedDate(undefined);
      setPastClasses([]);
    }
  }, [open]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const dateString = formatDateString(date.toISOString());

    // Block future dates
    if (isFutureDate(dateString)) {
      toast.error('You cannot mark attendance for a future date.');
      return;
    }

    // Check if attendance already marked for this date
    const hasExistingAttendance = existingEvents.some(event => event.date === dateString);
    if (hasExistingAttendance) {
      toast.error('Attendance already marked for this date');
      return;
    }

    // Get scheduled classes for this date
    const scheduledClasses = getScheduleForDate(dateString, timetable, subjects, exchanges);

    if (scheduledClasses.length === 0) {
      toast.error('No classes scheduled for this date');
      return;
    }

    // Initialize past classes with default "attended" status
    const classes: PastClass[] = scheduledClasses.map(cls => ({
      subjectId: cls.subjectId,
      subjectName: cls.subjectName,
      timeSlot: cls.timeSlot,
      status: 'attended' as ClassStatus,
    }));

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

  const handleSave = () => {
    if (!selectedDate) return;

    const dateString = formatDateString(selectedDate.toISOString());

    const events: ClassEvent[] = pastClasses.map(cls => ({
      id: generateId(),
      subjectId: cls.subjectId,
      date: dateString,
      status: cls.status,
      isExtra: false,
      timestamp: Date.now(),
    }));

    onSave(events);
    onOpenChange(false); // Close sheet after save
    toast.success('Past attendance saved successfully');
  };

  const handleBack = () => {
    setStep('select-date');
    setSelectedDate(undefined);
    setPastClasses([]);
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
                Select a past date to mark attendance
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 flex flex-col items-center space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You can only mark attendance for past dates. Future dates are not allowed.
                </AlertDescription>
              </Alert>

              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  const dateString = formatDateString(date.toISOString());
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
              <SheetTitle>Mark Attendance</SheetTitle>
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
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Present
                    </Button>
                    <Button
                      variant={cls.status === 'missed' ? 'destructive' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleStatusChange(index, 'missed')}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Absent
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save Attendance
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
