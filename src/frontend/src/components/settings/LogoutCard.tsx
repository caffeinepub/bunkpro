// Logout card with resilient confirmation dialog that completes local logout even if backend deletion fails
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { LogOut } from 'lucide-react';

interface LogoutCardProps {
  onLogout: () => Promise<void>;
}

export function LogoutCard({ onLogout }: LogoutCardProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
      // Dialog will close automatically when app resets to login gate
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, the logout process should complete
      // The error handling is done in the parent component
    } finally {
      setIsLoggingOut(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <LogOut className="w-5 h-5" />
          Logout
        </CardTitle>
        <CardDescription>
          Sign out and clear all local data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full" disabled={isLoggingOut}>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                This will sign you out and delete your leaderboard data from the server. 
                Your local attendance data will also be cleared. 
                {'\n\n'}
                If leaderboard deletion fails, your local data will still be cleared and you will be logged out.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
