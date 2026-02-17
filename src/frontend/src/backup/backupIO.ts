// Backup export/import utilities with support for user profile, gamification fields, and theme normalization

import type { AppState } from '../domain/attendanceTypes';
import { createBackup, validateBackup, migrateBackup } from './backupSchema';

export function exportBackup(state: AppState): void {
  const backup = createBackup(state);
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `bunkpro-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importBackup(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        
        if (!validateBackup(data)) {
          reject(new Error('Invalid backup file format'));
          return;
        }
        
        const state = migrateBackup(data);
        resolve(state);
      } catch (error) {
        reject(new Error('Failed to parse backup file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
