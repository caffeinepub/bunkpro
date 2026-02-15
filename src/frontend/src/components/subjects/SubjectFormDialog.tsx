// Subject add/edit form dialog

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Subject } from '../../domain/attendanceTypes';
import { generateId, getSubjectColor } from '../../lib/utils';

interface SubjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject;
  existingNames: string[];
  onSave: (subject: Subject) => void;
}

export function SubjectFormDialog({
  open,
  onOpenChange,
  subject,
  existingNames,
  onSave,
}: SubjectFormDialogProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(subject?.name || '');
      setError('');
    }
  }, [open, subject]);

  const handleSave = () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Subject name is required');
      return;
    }
    
    if (existingNames.includes(trimmedName) && trimmedName !== subject?.name) {
      setError('A subject with this name already exists');
      return;
    }
    
    const newSubject: Subject = subject
      ? { ...subject, name: trimmedName }
      : {
          id: generateId(),
          name: trimmedName,
          color: getSubjectColor(existingNames.length),
          createdAt: Date.now(),
        };
    
    onSave(newSubject);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{subject ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
          <DialogDescription>
            {subject ? 'Update the subject name' : 'Create a new subject to track attendance'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subject Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g., Mathematics"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {subject ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
