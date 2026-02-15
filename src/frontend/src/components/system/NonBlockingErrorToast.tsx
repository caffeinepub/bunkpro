// Non-blocking error notification using toast

import { useEffect } from 'react';
import { toast } from 'sonner';

interface NonBlockingErrorToastProps {
  error: Error | null;
  onDismiss?: () => void;
}

export function NonBlockingErrorToast({ error, onDismiss }: NonBlockingErrorToastProps) {
  useEffect(() => {
    if (error) {
      toast.error(error.message, {
        duration: 5000,
        onDismiss,
      });
    }
  }, [error, onDismiss]);

  return null;
}
