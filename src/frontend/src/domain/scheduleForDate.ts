// Domain helper to compute scheduled subjects for a given date

import type { TimetableSlot, Subject, ClassExchange } from './attendanceTypes';
import { getDayOfWeek } from '../lib/utils';

export interface ScheduledClass {
  subjectId: string;
  subjectName: string;
  timeSlot: number;
}

/**
 * Derives the scheduled subjects for a given date by:
 * 1. Selecting timetable slots for the date's weekday
 * 2. Applying any exchange overrides for that exact date
 * 3. Filtering out empty slots
 */
export function getScheduleForDate(
  date: string,
  timetableSlots: TimetableSlot[],
  subjects: Subject[],
  exchanges: ClassExchange[]
): ScheduledClass[] {
  const dayOfWeek = getDayOfWeek(date);
  
  // Get base timetable for this weekday
  const daySlots = timetableSlots.filter(slot => slot.day === dayOfWeek && slot.subjectId);
  
  // Apply exchanges for this specific date
  const dateExchanges = exchanges.filter(ex => ex.date === date);
  
  const scheduledClasses: ScheduledClass[] = [];
  
  for (const slot of daySlots) {
    // Check if there's an exchange for this slot on this date
    const exchange = dateExchanges.find(
      ex => ex.timeSlot === slot.timeSlot && ex.originalSubjectId === slot.subjectId
    );
    
    const effectiveSubjectId = exchange ? exchange.newSubjectId : slot.subjectId!;
    const subject = subjects.find(s => s.id === effectiveSubjectId);
    
    if (subject) {
      scheduledClasses.push({
        subjectId: effectiveSubjectId,
        subjectName: subject.name,
        timeSlot: slot.timeSlot,
      });
    }
  }
  
  // Sort by time slot
  return scheduledClasses.sort((a, b) => a.timeSlot - b.timeSlot);
}
