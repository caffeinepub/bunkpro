// Mark today's classes sheet

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
import { Check, X, Ban } from 'lucide-react';
import { cn, getTodayString, getDayOfWeek, generateId } from '../../lib/utils';
import type { Subject, TimetableSlot, ClassEvent, ClassStatus } from '../../domain/attendanceTypes';

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
  onSave: (events: ClassEvent[]) => void;
}

export function MarkTodaySheet({
  open,
  onOpenChange,
  subjects,
  timetable,
  onSave,
}: MarkTodaySheetProps) {
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);

  useEffect(() => {
    if (open) {
      const today = getDayOfWeek(getTodayString());
      const todaySlots = timetable.filter(slot => slot.day === today && slot.subjectId);
      
      const classes: TodayClass[] = todaySlots.map(slot => {
        const subject = subjects.find(s => s.id === slot.subjectId);
        return {
          subjectId: slot.subjectId!,
          subjectName: subject?.name || 'Unknown',
          timeSlot: slot.timeSlot,
          status: 'attended' as ClassStatus,
        };
      });
      
      setTodayClasses(classes);
    }
  }, [open, timetable, subjects]);

  const handleStatusChange = (index: number, status: ClassStatus) => {
    setTodayClasses(prev => 
      prev.map((cls, i) => i === index ? { ...cls, status } : cls)
    );
  };

  const handleSave = () => {
    const events: ClassEvent[] = todayClasses.map(cls => ({
      id: generateId(),
      subjectId: cls.subjectId,
      date: getTodayString(),
      status: cls.status,
      isExtra: false,
      timestamp: Date.now(),
    }));
    
    onSave(events);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Mark Today's Classes</SheetTitle>
          <SheetDescription>
            {todayClasses.length === 0
              ? 'No classes scheduled for today'
              : `Mark attendance for ${todayClasses.length} ${todayClasses.length === 1 ? 'class' : 'classes'}`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 max-h-[calc(80vh-200px)] overflow-y-auto">
          {todayClasses.map((cls, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border bg-card space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{cls.subjectName}</h4>
                  <p className="text-sm text-muted-foreground">Period {cls.timeSlot + 1}</p>
                </div>
                <Badge variant={
                  cls.status === 'attended' ? 'default' :
                  cls.status === 'missed' ? 'destructive' :
                  'secondary'
                }>
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
                  Attended
                </Button>
                <Button
                  variant={cls.status === 'missed' ? 'destructive' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStatusChange(index, 'missed')}
                >
                  <X className="w-4 h-4 mr-2" />
                  Missed
                </Button>
                <Button
                  variant={cls.status === 'cancelled' ? 'secondary' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStatusChange(index, 'cancelled')}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Cancelled
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1" disabled={todayClasses.length === 0}>
            Save Attendance
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
