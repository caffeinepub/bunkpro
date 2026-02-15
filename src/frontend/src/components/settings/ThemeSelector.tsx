// Theme selector component

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AppSettings } from '../../domain/attendanceTypes';

interface ThemeSelectorProps {
  settings: AppSettings;
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onVariantChange: (variant: 'purple-blue' | 'midnight') => void;
}

export function ThemeSelector({ settings, onThemeChange, onVariantChange }: ThemeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the look and feel of the app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Theme Mode</Label>
          <RadioGroup value={settings.theme} onValueChange={(v) => onThemeChange(v as any)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="font-normal cursor-pointer">Light</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="font-normal cursor-pointer">Dark</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system" className="font-normal cursor-pointer">System</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
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
        </div>
      </CardContent>
    </Card>
  );
}
