// Bottom navigation bar with smooth animations, active state indication, and optimized tap targets for mobile

import React from 'react';
import { Home, Calendar, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: 'home' | 'timetable' | 'settings';
  onTabChange: (tab: 'home' | 'timetable' | 'settings') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'timetable' as const, label: 'Timetable', icon: Calendar },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="flex items-center justify-around h-16 px-4 safe-area-inset-bottom">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 ease-out min-w-[72px]",
              "hover:bg-accent/50 active:scale-95",
              isActive && "bg-primary/10"
            )}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              className={cn(
                "w-5 h-5 transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span
              className={cn(
                "text-xs font-medium transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
