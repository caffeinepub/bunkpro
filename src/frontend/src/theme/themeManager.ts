// Theme management utilities that enforce permanent Dark mode

import type { AppSettings } from '../domain/attendanceTypes';

// Store reference to any system theme listener for cleanup
let systemThemeListener: ((e: MediaQueryListEvent) => void) | null = null;
let mediaQuery: MediaQueryList | null = null;

export function applyTheme(settings: AppSettings): void {
  const { themeVariant } = settings;
  
  // Always apply dark mode (ignore settings.theme value)
  document.documentElement.classList.add('dark');
  
  // Apply theme variant
  document.documentElement.setAttribute('data-theme', themeVariant);
}

export function initializeTheme(settings: AppSettings): void {
  // Remove any existing system theme listener
  if (systemThemeListener && mediaQuery) {
    mediaQuery.removeEventListener('change', systemThemeListener);
    systemThemeListener = null;
    mediaQuery = null;
  }
  
  // Apply dark mode permanently
  applyTheme(settings);
}
