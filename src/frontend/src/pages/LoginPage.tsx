// Login page with name-only authentication using shared validation logic

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { UserProfile } from '../domain/attendanceTypes';
import { validateDisplayName } from '../domain/validateDisplayName';

interface LoginPageProps {
  onLogin: (profile: UserProfile) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validation = validateDisplayName(name);
    if (!validation.isValid) {
      setError(validation.error || 'Only letters, numbers, spaces and underscore are allowed.');
      return;
    }
    
    setIsSubmitting(true);
    
    const profile: UserProfile = {
      displayName: validation.normalizedValue,
      totalPoints: 0,
      registeredAt: Date.now(),
    };
    
    // Simulate async operation
    setTimeout(() => {
      onLogin(profile);
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to BunkPro</CardTitle>
          <CardDescription className="text-base mt-2">
            Enter your name to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="name_clg_sem"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                disabled={isSubmitting}
                className="text-lg"
                autoFocus
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Continuing...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
