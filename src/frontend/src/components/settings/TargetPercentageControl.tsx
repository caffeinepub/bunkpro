// Target percentage control

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface TargetPercentageControlProps {
  value: number;
  onChange: (value: number) => void;
}

export function TargetPercentageControl({ value, onChange }: TargetPercentageControlProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    if (!isNaN(num) && num >= 1 && num <= 100) {
      onChange(num);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Target Attendance</CardTitle>
        <CardDescription>
          Set your minimum attendance goal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Slider
              value={[value]}
              onValueChange={([v]) => onChange(v)}
              min={1}
              max={100}
              step={1}
            />
          </div>
          <div className="w-20">
            <Input
              type="number"
              value={value}
              onChange={handleInputChange}
              min={1}
              max={100}
              className="text-center"
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Current target: <span className="font-semibold text-foreground">{value}%</span>
        </p>
      </CardContent>
    </Card>
  );
}
