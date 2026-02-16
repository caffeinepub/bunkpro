/**
 * Centralized authorization error classification and user-safe messaging
 * Ensures no raw backend authorization errors are shown to users
 */

export interface AuthErrorClassification {
  type: 'session-expired' | 'permission-denied' | 'other';
  userMessage: string;
  shouldLogout: boolean;
}

/**
 * Classifies backend authorization-related errors and produces user-safe English messages
 * Never includes raw backend trap text in user-facing messages
 */
export function classifyAuthError(error: unknown): AuthErrorClassification {
  const errorMessage = getErrorMessage(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Session expired / Unauthorized
  if (
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('not authenticated') ||
    lowerMessage.includes('session expired') ||
    lowerMessage.includes('invalid identity')
  ) {
    return {
      type: 'session-expired',
      userMessage: 'Your session expired. Please log in again.',
      shouldLogout: true,
    };
  }

  // Permission denied / Forbidden
  if (
    lowerMessage.includes('permission denied') ||
    lowerMessage.includes('forbidden') ||
    lowerMessage.includes('access denied') ||
    lowerMessage.includes('insufficient permissions')
  ) {
    return {
      type: 'permission-denied',
      userMessage: 'Permission denied.',
      shouldLogout: false,
    };
  }

  // Other errors
  return {
    type: 'other',
    userMessage: 'An error occurred. Please try again.',
    shouldLogout: false,
  };
}

/**
 * Extracts error message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if ('toString' in error && typeof error.toString === 'function') {
      return error.toString();
    }
  }

  return 'Unknown error';
}

/**
 * Checks if an error is authorization-related
 */
export function isAuthError(error: unknown): boolean {
  const classification = classifyAuthError(error);
  return classification.type === 'session-expired' || classification.type === 'permission-denied';
}
