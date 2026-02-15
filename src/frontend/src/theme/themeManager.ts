// Theme management utilities

import type { AppSettings } from '../domain/attendanceTypes';

export function applyTheme(settings: AppSettings): void {
  const { theme, themeVariant } = settings;
  
  // Apply dark/light mode
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Apply theme variant
  document.documentElement.setAttribute('data-theme', themeVariant);
}

export function initializeTheme(settings: AppSettings): void {
  applyTheme(settings);
  
  // Listen for system theme changes if using system theme
  if (settings.theme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(settings);
    mediaQuery.addEventListener('change', handler);
    
    // Note: In a real app, you'd want to clean this up when the component unmounts
    // but since this is called once at app initialization, we don't need cleanup
  }
}
