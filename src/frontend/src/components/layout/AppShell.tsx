// Main app layout shell providing consistent structure with proper spacing to prevent bottom nav overlap

import React, { type ReactNode } from 'react';
import { useAppStore } from '../../state/appStore';

interface AppShellProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

export function AppShell({ children, header, footer }: AppShellProps) {
  const { state } = useAppStore();
  const variant = state.settings.themeVariant;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
      {header && (
        <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
          {header}
        </header>
      )}
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-6 pb-28 sm:pb-24">
        {children}
      </main>
      
      {footer && (
        <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/40 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
          {footer}
        </footer>
      )}
    </div>
  );
}
