// Mark today's classes sheet with local-date-safe today string generation, duplicate prevention guard, loading/disabled state during save, and async onSave handler

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { generateId, getTodayString } from '../../lib/utils';
import { getScheduleForDate } from '../../domain/scheduleForDate';
import { toast } from 'sonner';
import type { Subject, TimetableSlot, ClassEvent, ClassStatus, ClassExchange } from '../../domain/attendanceTypes';

interface TodayClass {
  subjectId: string;
  subjectName: string;
  timeSlot: number;
  status: ClassStatus;
}

interface MarkTodaySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  timetable: TimetableSlot[];
  exchanges: ClassExchange[];
  onSave: (events: ClassEvent[]) => Promise<void>;
  isAlreadyMarked: boolean;
}

export function MarkTodaySheet({
  open,
  onOpenChange,
  subjects,
  timetable,
  exchanges,
  onSave,
  isAlreadyMarked,
}: MarkTodaySheetProps) {
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize classes when sheet opens
  React.useEffect(() => {
    if (open && !isAlreadyMarked) {
      const todayString = getTodayString();
      const scheduledClasses = getScheduleForDate(todayString, timetable, subjects, exchanges);
      
      if (scheduledClasses.length === 0) {
        toast.error('No classes scheduled for today');
        onOpenChange(false);
        return;
      }

      const classes = scheduledClasses.map(cls => ({
        subjectId: cls.subjectId,
        subjectName: cls.subjectName,
        timeSlot: cls.timeSlot,
        status: 'attended' as ClassStatus,
      }));

      setTodayClasses(classes);
    }
  }, [open, isAlreadyMarked, timetable, subjects, exchanges, onOpenChange]);

  const handleStatusChange = (index: number, status: ClassStatus) => {
    setTodayClasses(prev =>
      prev.map((cls, i) => (i === index ? { ...cls, status } : cls))
    );
  };

  const handleSave = async () => {
    if (isSubmitting || isAlreadyMarked) return;

    setIsSubmitting(true);

    try {
      const todayString = getTodayString();

      const events: ClassEvent[] = todayClasses.map(cls => ({
        id: generateId(),
        subjectId: cls.subjectId,
        date: todayString,
        status: cls.status,
        isExtra: false,
        timestamp: Date.now(),
      }));

      await onSave(events);
      onOpenChange(false);
      toast.success('Today\'s attendance marked successfully');
    } catch (error) {
      // Error handling is done in parent (App.tsx)
      console.error('Save failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Mark Today's Attendance</SheetTitle>
          <SheetDescription>
            Mark your attendance for today's classes
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 max-h-[calc(80vh-180px)] overflow-y-auto">
          {todayClasses.map((cls, index) => (
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

        <div className="mt-6">
          <Button 
            onClick={handleSave} 
            className="w-full"
            disabled={isSubmitting || isAlreadyMarked}
          >
            {isSubmitting ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
