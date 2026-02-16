// Pure utilities for computing continuous day streaks and milestone awards

import type { ClassEvent, StreakMilestone } from './attendanceTypes';

/**
 * Computes the current continuous day streak ending today.
 * A streak is the number of consecutive calendar dates (ending today) where at least one class event exists.
 */
export function computeContinuousDayStreak(events: ClassEvent[]): number {
  if (events.length === 0) return 0;

  // Get unique dates sorted descending
  const uniqueDates = Array.from(new Set(events.map(e => e.date))).sort().reverse();
  
  const today = new Date().toISOString().split('T')[0];
  
  // If no events today, streak is 0
  if (uniqueDates[0] !== today) return 0;

  let streak = 0;
  let currentDate = new Date(today);

  for (const eventDate of uniqueDates) {
    const expectedDate = currentDate.toISOString().split('T')[0];
    
    if (eventDate === expectedDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Generates a stable streak identifier based on the streak start date.
 */
export function getStreakIdentifier(streakLength: number): string {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - streakLength + 1);
  return startDate.toISOString().split('T')[0];
}

/**
 * Checks if a milestone has already been awarded for the current streak.
 */
export function isMilestoneAwarded(
  streakId: string,
  milestoneType: '3-day' | '6-day',
  awardedMilestones: StreakMilestone[]
): boolean {
  return awardedMilestones.some(
    m => m.streakId === streakId && m.milestoneType === milestoneType
  );
}

/**
 * Determines which milestone (if any) should be awarded based on current streak.
 * Returns null if no new milestone should be awarded.
 */
export function checkMilestoneEligibility(
  currentStreak: number,
  awardedMilestones: StreakMilestone[]
): { type: '3-day' | '6-day'; points: number; streakId: string } | null {
  if (currentStreak < 3) return null;

  const streakId = getStreakIdentifier(currentStreak);

  // Check 6-day milestone first (higher priority)
  if (currentStreak >= 6) {
    if (!isMilestoneAwarded(streakId, '6-day', awardedMilestones)) {
      return { type: '6-day', points: 10, streakId };
    }
  }

  // Check 3-day milestone
  if (currentStreak >= 3) {
    if (!isMilestoneAwarded(streakId, '3-day', awardedMilestones)) {
      return { type: '3-day', points: 5, streakId };
    }
  }

  return null;
}
