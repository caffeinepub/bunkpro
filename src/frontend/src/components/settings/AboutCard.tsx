// About section card displaying app information, version details, and founder information without logo image

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BRANDING } from '@/lib/branding';

export function AboutCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About {BRANDING.appName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 text-sm text-center">
          <p className="text-muted-foreground">Version 1.0.0</p>
          <p className="text-muted-foreground">
            A smart attendance manager for college students
          </p>
          <p className="text-muted-foreground font-medium">
            Founded by Basavaraj Hiremath
          </p>
        </div>

        <div className="pt-4 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {BRANDING.appName}. All rights reserved.</p>
        </div>
      </CardContent>
    </Card>
  );
}
