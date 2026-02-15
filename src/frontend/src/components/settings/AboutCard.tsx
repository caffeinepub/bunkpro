// About section card displaying the BunkPro logo, app information, and version details using theme-aware branding

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BRANDING } from '@/lib/branding';

export function AboutCard() {
  const [isDark, setIsDark] = useState(() => {
    // Check if dark mode is active on mount
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    // Watch for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>About {BRANDING.appName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4 py-4">
          <img 
            src={BRANDING.getHorizontalLogo(isDark)}
            alt={BRANDING.logoAlt}
            className="w-full max-w-md h-auto object-contain"
          />
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
