// Backup and restore settings card

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { exportBackup, importBackup } from '../../backup/backupIO';
import { ConfirmDestructiveDialog } from '../subjects/ConfirmDestructiveDialog';
import { toast } from 'sonner';
import type { AppState } from '../../domain/attendanceTypes';

interface BackupRestoreCardProps {
  currentState: AppState;
  onRestore: (state: AppState) => void;
}

export function BackupRestoreCard({ currentState, onRestore }: BackupRestoreCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingRestore, setPendingRestore] = useState<AppState | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExport = () => {
    try {
      exportBackup(currentState);
      toast.success('Backup exported successfully');
    } catch (error) {
      toast.error('Failed to export backup');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const state = await importBackup(file);
      setPendingRestore(state);
      setShowConfirm(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import backup');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmRestore = () => {
    if (pendingRestore) {
      onRestore(pendingRestore);
      toast.success('Backup restored successfully');
      setPendingRestore(null);
    }
    setShowConfirm(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
          <CardDescription>
            Export your data to a file or restore from a previous backup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleExport} className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Backup
          </Button>
          
          <Button onClick={handleImportClick} className="w-full" variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Backup
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      <ConfirmDestructiveDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Restore Backup?"
        description="This will replace all your current data with the backup. This action cannot be undone."
        actionLabel="Restore"
        onConfirm={handleConfirmRestore}
      />
    </>
  );
}
