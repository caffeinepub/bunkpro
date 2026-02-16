/**
 * Centralized hook for handling authorization failures and recovery actions
 * Provides safe helpers for clearing app state and triggering logout
 */

import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../state/appStore';
import { useInternetIdentity } from './useInternetIdentity';
import { clearIndexedDB } from '../storage/indexedDbClient';
import { clearRankingCache } from '../rank/rankCache';
import { classifyAuthError } from '../lib/authErrorHandling';
import { toast } from 'sonner';

export function useAuthRecovery() {
  const queryClient = useQueryClient();
  const { dispatch } = useAppStore();
  const { clear: clearIdentity } = useInternetIdentity();

  /**
   * Performs complete session cleanup and returns to login gate
   * Safe to call multiple times
   */
  const performLogout = async (showToast: boolean = true) => {
    try {
      // 1. Cancel all in-flight queries immediately
      queryClient.cancelQueries();

      // 2. Reset app state to trigger login gate
      dispatch({ type: 'RESET_ALL' });

      // 3. Clear React Query cache
      queryClient.clear();

      // 4. Clear ranking cache
      clearRankingCache();

      // 5. Clear IndexedDB
      await clearIndexedDB();

      // 6. Clear sessionStorage (including any URL param secrets)
      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn('Failed to clear sessionStorage:', e);
      }

      // 7. Clear Internet Identity session
      await clearIdentity();

      if (showToast) {
        toast.info('Session ended. Please log in again.');
      }
    } catch (error) {
      console.error('Error during logout cleanup:', error);
      // Still complete the logout even if cleanup fails
    }
  };

  /**
   * Handles authorization errors with appropriate recovery actions
   * Shows user-safe messages and triggers logout when needed
   */
  const handleAuthError = async (error: unknown) => {
    const classification = classifyAuthError(error);

    // Show user-safe message
    toast.error(classification.userMessage);

    // Trigger logout if needed
    if (classification.shouldLogout) {
      await performLogout(false); // Don't show duplicate toast
    }
  };

  return {
    performLogout,
    handleAuthError,
  };
}
