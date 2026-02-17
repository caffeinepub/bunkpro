// Branding constants for consistent logo usage across the app with theme-aware asset selection using finalized Bunkpro logo

export const BRANDING = {
  appName: 'BunkPro',
  tagline: 'Track Smart.',
  logoAlt: 'BunkPro Logo',
  
  // App icon (square format) - for splash screen
  // Using the finalized Bunkpro logo for both dark and light modes
  getAppIcon: (_isDark: boolean) => 
    '/assets/generated/Bunkpro.logo_dark_mode.dim_1024x1024.png',
  
  // Horizontal logo with wordmark - for about section
  // Using the new premium horizontal logo for both light and dark themes
  getHorizontalLogo: (_isDark: boolean) =>
    '/assets/generated/bunkpro-logo-horizontal.dim_4096x1536.png',
} as const;
