// Branding constants for consistent logo usage across the app with theme-aware asset selection

export const BRANDING = {
  appName: 'BunkPro',
  tagline: 'Track Smart.',
  logoAlt: 'BunkPro Logo',
  
  // App icon (square format) - for splash screen
  // Using the new premium logo icon for both light and dark themes
  getAppIcon: (isDark: boolean) => 
    '/assets/generated/bunkpro-logo-icon.dim_4096x4096.png',
  
  // Horizontal logo with wordmark - for about section
  // Using the new premium horizontal logo for both light and dark themes
  getHorizontalLogo: (isDark: boolean) =>
    '/assets/generated/bunkpro-logo-horizontal.dim_4096x1536.png',
} as const;
