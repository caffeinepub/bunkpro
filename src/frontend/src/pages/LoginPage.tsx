// Login page with name-only authentication and validation

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { UserProfile } from '../domain/attendanceTypes';

interface LoginPageProps {
  onLogin: (profile: UserProfile) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateName = (input: string): string | null => {
    const trimmed = input.trim();
    
    if (trimmed.length === 0) {
      return 'Please enter your name';
    }
    
    if (trimmed.length < 2) {
      return 'Name must be at least 2 characters';
    }
    
    if (trimmed.length > 50) {
      return 'Name must be less than 50 characters';
    }
    
    // Only allow letters (A-Z, a-z) and spaces
    if (!/^[A-Za-z\s]+$/.test(trimmed)) {
      return 'Name can only contain letters and spaces';
    }
    
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsSubmitting(true);
    
    const profile: UserProfile = {
      displayName: name.trim(),
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
                placeholder="e.g., Chittya"
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
