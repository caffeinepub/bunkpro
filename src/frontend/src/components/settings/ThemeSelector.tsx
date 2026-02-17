// Theme selector component for color variant selection only (Dark mode is permanent)

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AppSettings } from '../../domain/attendanceTypes';

interface ThemeSelectorProps {
  settings: AppSettings;
  onVariantChange: (variant: 'purple-blue' | 'midnight') => void;
}

export function ThemeSelector({ settings, onVariantChange }: ThemeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the color theme of the app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label htmlFor="variant">Color Theme</Label>
        <Select value={settings.themeVariant} onValueChange={(v) => onVariantChange(v as any)}>
          <SelectTrigger id="variant">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="purple-blue">Purple Blue</SelectItem>
            <SelectItem value="midnight">Midnight</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
