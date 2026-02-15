// Premium insights calculations

import type { ClassEvent, SubjectStats } from './attendanceTypes';

/**
 * Calculate simple prediction based on recent trend
 */
export function predictNextWeekPercentage(stats: SubjectStats, recentEvents: ClassEvent[]): number | null {
  if (recentEvents.length < 3) return null;
  
  const recentAttended = recentEvents.filter(e => e.status === 'attended').length;
  const recentTotal = recentEvents.filter(e => e.status !== 'cancelled').length;
  
  if (recentTotal === 0) return null;
  
  const recentPercentage = (recentAttended / recentTotal) * 100;
  
  // Simple weighted average: 70% current, 30% recent trend
  return stats.percentage * 0.7 + recentPercentage * 0.3;
}

/**
 * Get trend direction
 */
export function getTrendDirection(stats: SubjectStats, recentEvents: ClassEvent[]): 'up' | 'down' | 'stable' {
  const prediction = predictNextWeekPercentage(stats, recentEvents);
  
  if (prediction === null) return 'stable';
  
  const diff = prediction - stats.percentage;
  
  if (diff > 2) return 'up';
  if (diff < -2) return 'down';
  return 'stable';
}

/**
 * Get motivational message based on streak
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) return '';
  if (streak === 1) return 'Good start! Keep it up! 🎯';
  if (streak < 5) return `${streak} day streak! You're on fire! 🔥`;
  if (streak < 10) return `Amazing ${streak} day streak! Unstoppable! 💪`;
  return `Legendary ${streak} day streak! You're a champion! 🏆`;
}
