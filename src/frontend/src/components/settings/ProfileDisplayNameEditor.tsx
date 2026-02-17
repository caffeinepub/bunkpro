// Profile display name editor component for Settings with Edit/Save/Cancel flow and validation

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Edit2, Check, X } from 'lucide-react';
import { validateDisplayName } from '../../domain/validateDisplayName';

interface ProfileDisplayNameEditorProps {
  currentName: string;
  totalPoints: number;
  onSave: (newName: string) => void;
  isSaving?: boolean;
}

export function ProfileDisplayNameEditor({
  currentName,
  totalPoints,
  onSave,
  isSaving = false,
}: ProfileDisplayNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(currentName);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedName(currentName);
    setError(null);
  };

  const handleSave = () => {
    const validation = validateDisplayName(editedName);
    
    if (!validation.isValid) {
      setError(validation.error || 'Only letters, numbers, spaces and underscore are allowed.');
      return;
    }
    
    onSave(validation.normalizedValue);
    setIsEditing(false);
    setError(null);
  };

  const handleInputChange = (value: string) => {
    setEditedName(value);
    setError(null);
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">Name</Label>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  id="display-name"
                  type="text"
                  value={editedName}
                  onChange={(e) => handleInputChange(e.target.value)}
                  disabled={isSaving}
                  className="text-lg"
                  autoFocus
                  placeholder="e.g., name_clg name"
                />
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    disabled={isSaving}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">{currentName}</span>
                <Button
                  onClick={handleEdit}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-muted-foreground">Total Points</span>
            <span className="font-bold text-2xl text-primary">{totalPoints}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
