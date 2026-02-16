// Bottom navigation bar with 5 tabs (Home, Timetable, Stats, Rank, Settings) and smooth transitions
import React from 'react';
import { Home, Calendar, BarChart3, Trophy, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: 'home' | 'timetable' | 'stats' | 'rank' | 'settings';
  onTabChange: (tab: 'home' | 'timetable' | 'stats' | 'rank' | 'settings') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'timetable' as const, label: 'Timetable', icon: Calendar },
    { id: 'stats' as const, label: 'Stats', icon: BarChart3 },
    { id: 'rank' as const, label: 'Rank', icon: Trophy },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="flex items-center justify-around h-16 px-2 safe-area-inset-bottom">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ease-out min-w-[60px]",
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
