// About section card displaying the BunkPro logo, app information, and version details

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
        <div className="flex flex-col items-center gap-4 py-4">
          <img 
            src={BRANDING.logoPath}
            alt={BRANDING.logoAlt}
            className="w-40 h-40 object-contain"
          />
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">{BRANDING.appName}</h3>
            <p className="text-muted-foreground italic">{BRANDING.tagline}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-center">
          <p className="text-muted-foreground">Version 1.0.0</p>
          <p className="text-muted-foreground">
            A smart attendance manager for college students
          </p>
        </div>

        <div className="pt-4 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {BRANDING.appName}. All rights reserved.</p>
        </div>
      </CardContent>
    </Card>
  );
}
