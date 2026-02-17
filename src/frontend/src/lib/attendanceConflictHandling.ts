// Backend error classification for DailyAttendance conflicts with user-safe English messages

export interface ConflictResult {
  isConflict: boolean;
  userMessage: string;
}

/**
 * Classify backend errors for DailyAttendance operations
 * Maps backend trap messages to user-friendly English
 */
export function classifyAttendanceError(error: unknown, dateString: string, isToday: boolean): ConflictResult {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Check for duplicate/conflict patterns
  if (
    errorMessage.includes('already exists') ||
    errorMessage.includes('already marked') ||
    errorMessage.includes('duplicate')
  ) {
    return {
      isConflict: true,
      userMessage: isToday 
        ? 'Attendance already marked for today.'
        : `Attendance already marked for ${dateString}.`,
    };
  }
  
  // Check for unauthorized/auth errors
  if (
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('not authenticated')
  ) {
    return {
      isConflict: false,
      userMessage: 'Your session has expired. Please log in again.',
    };
  }
  
  // Check for future date errors
  if (errorMessage.includes('future date')) {
    return {
      isConflict: false,
      userMessage: 'Cannot mark attendance for a future date.',
    };
  }
  
  // Generic failure
  return {
    isConflict: false,
    userMessage: 'Failed to save attendance. Please try again.',
  };
}

/**
 * Check if an error indicates a session/auth failure requiring logout
 */
export function requiresLogout(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('not authenticated') ||
    errorMessage.includes('session')
  );
}
