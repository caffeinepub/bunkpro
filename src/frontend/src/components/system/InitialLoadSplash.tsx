// Animated splash screen displaying the BunkPro logo with smooth loading indicators during app initialization

import React, { useEffect, useState } from 'react';
import { BRANDING } from '@/lib/branding';

export function InitialLoadSplash() {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
      <div className="flex flex-col items-center gap-8 animate-in fade-in duration-700">
        <div className="relative">
          <img 
            src={BRANDING.getAppIcon(isDark)}
            alt={BRANDING.logoAlt}
            className="w-56 h-56 object-contain animate-in zoom-in duration-500"
          />
        </div>
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
