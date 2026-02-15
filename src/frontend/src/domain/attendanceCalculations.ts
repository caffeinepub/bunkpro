// Pure calculation utilities for attendance tracking

import type { ClassEvent, Subject, SubjectStats, AppSettings } from './attendanceTypes';

/**
 * Calculate attendance statistics for a single subject
 */
export function calculateSubjectStats(subjectId: string, events: ClassEvent[]): SubjectStats {
  const subjectEvents = events.filter(e => e.subjectId === subjectId);
  
  const attended = subjectEvents.filter(e => e.status === 'attended').length;
  const missed = subjectEvents.filter(e => e.status === 'missed').length;
  const cancelled = subjectEvents.filter(e => e.status === 'cancelled').length;
  
  const total = attended + missed;
  const percentage = total > 0 ? (attended / total) * 100 : 0;
  
  return {
    subjectId,
    attended,
    missed,
    cancelled,
    total,
    percentage,
  };
}

/**
 * Calculate overall attendance across all subjects
 */
export function calculateOverallStats(subjects: Subject[], events: ClassEvent[]): SubjectStats {
  let totalAttended = 0;
  let totalMissed = 0;
  let totalCancelled = 0;
  
  subjects.forEach(subject => {
    const stats = calculateSubjectStats(subject.id, events);
    totalAttended += stats.attended;
    totalMissed += stats.missed;
    totalCancelled += stats.cancelled;
  });
  
  const total = totalAttended + totalMissed;
  const percentage = total > 0 ? (totalAttended / total) * 100 : 0;
  
  return {
    subjectId: 'overall',
    attended: totalAttended,
    missed: totalMissed,
    cancelled: totalCancelled,
    total,
    percentage,
  };
}

/**
 * Calculate how many classes can be safely bunked without dropping below target
 */
export function calculateSafeBunk(stats: SubjectStats, targetPercentage: number): number {
  if (stats.total === 0) return 0;
  if (stats.percentage < targetPercentage) return 0;
  
  const { attended, total } = stats;
  
  // Formula: safeBunk = floor((attended - target * total) / target)
  // where target is expressed as decimal (e.g., 0.75 for 75%)
  const target = targetPercentage / 100;
  const safeBunk = Math.floor((attended - target * total) / target);
  
  return Math.max(0, safeBunk);
}

/**
 * Calculate how many consecutive attended classes needed to reach target
 */
export function calculateRequiredToTarget(stats: SubjectStats, targetPercentage: number): number {
  if (stats.percentage >= targetPercentage) return 0;
  if (stats.total === 0) {
    // Need at least one class to reach any target
    return 1;
  }
  
  const { attended, total } = stats;
  const target = targetPercentage / 100;
  
  // Formula: required = ceil((target * total - attended) / (1 - target))
  const required = Math.ceil((target * total - attended) / (1 - target));
  
  return Math.max(0, required);
}

/**
 * Get insight message based on current stats and target
 */
export function getInsightMessage(stats: SubjectStats, targetPercentage: number): string {
  if (stats.total === 0) {
    return 'No classes recorded yet. Start tracking!';
  }
  
  if (stats.percentage >= targetPercentage) {
    const safeBunk = calculateSafeBunk(stats, targetPercentage);
    if (safeBunk === 0) {
      return `You're at ${stats.percentage.toFixed(1)}%. Attend next class to maintain target.`;
    }
    return `You can bunk ${safeBunk} more ${safeBunk === 1 ? 'class' : 'classes'} safely!`;
  } else {
    const required = calculateRequiredToTarget(stats, targetPercentage);
    return `Attend next ${required} ${required === 1 ? 'class' : 'classes'} to reach ${targetPercentage}%`;
  }
}

/**
 * Calculate streak of consecutive attended classes
 */
export function calculateStreak(subjectId: string, events: ClassEvent[]): number {
  const subjectEvents = events
    .filter(e => e.subjectId === subjectId && e.status !== 'cancelled')
    .sort((a, b) => b.timestamp - a.timestamp);
  
  let streak = 0;
  for (const event of subjectEvents) {
    if (event.status === 'attended') {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Check if subject is in danger zone (below target)
 */
export function isInDangerZone(stats: SubjectStats, targetPercentage: number): boolean {
  return stats.total > 0 && stats.percentage < targetPercentage;
}
