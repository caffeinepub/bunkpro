// Helper functions to build notification messages for attendance marking actions

import type { ClassStatus } from '../domain/attendanceTypes';

export interface NotificationMessage {
  title: string;
  body: string;
}

/**
 * Generate notification message for marking classes
 */
export function getMarkClassesNotification(
  count: number,
  status: ClassStatus
): NotificationMessage {
  const statusText = {
    attended: 'attended',
    missed: 'missed',
    cancelled: 'cancelled',
  }[status];

  const emoji = {
    attended: '✅',
    missed: '❌',
    cancelled: '🚫',
  }[status];

  const title = `${emoji} Classes ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`;
  
  const body = count === 1
    ? `You marked 1 class as ${statusText}`
    : `You marked ${count} classes as ${statusText}`;

  return { title, body };
}

/**
 * Generate notification message for multiple status updates
 */
export function getMultipleMarkingsNotification(
  attended: number,
  missed: number,
  cancelled: number
): NotificationMessage {
  const parts: string[] = [];
  
  if (attended > 0) {
    parts.push(`${attended} attended`);
  }
  if (missed > 0) {
    parts.push(`${missed} missed`);
  }
  if (cancelled > 0) {
    parts.push(`${cancelled} cancelled`);
  }

  const title = '📚 Classes Marked';
  const body = parts.length > 0 
    ? `You marked: ${parts.join(', ')}`
    : 'Classes updated successfully';

  return { title, body };
}
