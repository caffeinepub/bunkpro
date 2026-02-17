// Animated splash screen displaying the finalized Bunkpro logo with solid dark background and smooth loading indicators

import React from 'react';
import { BRANDING } from '@/lib/branding';

export function InitialLoadSplash() {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: '#0D0D0D' }}
    >
      <div className="flex flex-col items-center gap-8 animate-in fade-in duration-700">
        <div className="relative flex items-center justify-center">
          <img 
            src={BRANDING.getAppIcon(true)}
            alt={BRANDING.logoAlt}
            className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 object-contain animate-in zoom-in duration-500"
            style={{ maxWidth: '80vw', maxHeight: '40vh' }}
          />
        </div>
        <div className="flex gap-2">
          <div 
            className="w-3 h-3 rounded-full animate-bounce" 
            style={{ 
              backgroundColor: '#8B5CF6',
              animationDelay: '0ms' 
            }} 
          />
          <div 
            className="w-3 h-3 rounded-full animate-bounce" 
            style={{ 
              backgroundColor: '#8B5CF6',
              animationDelay: '150ms' 
            }} 
          />
          <div 
            className="w-3 h-3 rounded-full animate-bounce" 
            style={{ 
              backgroundColor: '#8B5CF6',
              animationDelay: '300ms' 
            }} 
          />
        </div>
      </div>
    </div>
  );
}
