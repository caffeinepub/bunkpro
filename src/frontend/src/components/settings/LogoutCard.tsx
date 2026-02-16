import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDestructiveDialog } from '../subjects/ConfirmDestructiveDialog';
import { LogOut } from 'lucide-react';

interface LogoutCardProps {
  onLogout: () => Promise<void>;
}

export function LogoutCard({ onLogout }: LogoutCardProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    setIsConfirmOpen(false);
    try {
      await onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Error handling is done in the parent component
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Log Out</CardTitle>
          <CardDescription>
            Sign out and remove all your data from this device and the leaderboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setIsConfirmOpen(true)}
            className="w-full sm:w-auto"
            disabled={isLoggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDestructiveDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleConfirmLogout}
        title="Log Out"
        description="Are you sure you want to log out? This will permanently delete all your local data and remove you from the leaderboard. This action cannot be undone."
        actionLabel="Log Out"
      />
    </>
  );
}
