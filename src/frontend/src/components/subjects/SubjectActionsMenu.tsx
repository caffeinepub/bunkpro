// Subject actions dropdown menu

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, RotateCcw, Trash2 } from 'lucide-react';

interface SubjectActionsMenuProps {
  onEdit: () => void;
  onReset: () => void;
  onDelete: () => void;
}

export function SubjectActionsMenu({ onEdit, onReset, onDelete }: SubjectActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Subject
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Attendance
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Subject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
