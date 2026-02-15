// Timetable page with responsive weekly grid, edit mode for assigning subjects to time slots, and mobile-optimized layout

import React, { useState } from 'react';
import { useAppStore } from '../state/appStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateId } from '../lib/utils';
import type { TimetableSlot } from '../domain/attendanceTypes';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7', 'Period 8'];

export function TimetablePage() {
  const { state, dispatch } = useAppStore();
  const [editMode, setEditMode] = useState(false);

  const getSlot = (day: number, timeSlot: number): TimetableSlot | undefined => {
    return state.timetable.find(s => s.day === day && s.timeSlot === timeSlot);
  };

  const handleSlotChange = (day: number, timeSlot: number, subjectId: string | null) => {
    const slot: TimetableSlot = {
      id: generateId(),
      day,
      timeSlot,
      subjectId,
    };
    dispatch({ type: 'SET_TIMETABLE_SLOT', payload: slot });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Timetable</h1>
          <p className="text-muted-foreground">Manage your weekly schedule</p>
        </div>
        <Button onClick={() => setEditMode(!editMode)} className="w-full sm:w-auto">
          {editMode ? 'Done' : 'Edit'}
        </Button>
      </div>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[640px]">
              <thead>
                <tr>
                  <th className="p-2 sm:p-3 text-left font-semibold border-b sticky left-0 bg-card z-10">
                    <span className="text-xs sm:text-sm">Time</span>
                  </th>
                  {DAYS.map(day => (
                    <th key={day} className="p-2 sm:p-3 text-center font-semibold border-b">
                      <span className="text-xs sm:text-sm">{day.slice(0, 3)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((timeLabel, timeSlot) => (
                  <tr key={timeSlot}>
                    <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm text-muted-foreground border-b sticky left-0 bg-card z-10">
                      {timeLabel}
                    </td>
                    {DAYS.map((_, day) => {
                      const slot = getSlot(day, timeSlot);
                      const subject = slot?.subjectId
                        ? state.subjects.find(s => s.id === slot.subjectId)
                        : null;

                      return (
                        <td key={day} className="p-1 sm:p-2 border-b">
                          {editMode ? (
                            <Select
                              value={slot?.subjectId || 'none'}
                              onValueChange={(value) =>
                                handleSlotChange(day, timeSlot, value === 'none' ? null : value)
                              }
                            >
                              <SelectTrigger className="w-full h-8 text-xs">
                                <SelectValue placeholder="Free" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Free</SelectItem>
                                {state.subjects.map(subject => (
                                  <SelectItem key={subject.id} value={subject.id}>
                                    {subject.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="text-center min-h-[32px] flex items-center justify-center">
                              {subject ? (
                                <div
                                  className="px-2 py-1 rounded text-xs font-medium truncate max-w-full"
                                  style={{
                                    backgroundColor: subject.color + '20',
                                    color: subject.color,
                                  }}
                                  title={subject.name}
                                >
                                  {subject.name}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {state.subjects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Add subjects first to create your timetable
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
