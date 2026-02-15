// Branding constants for consistent logo usage across the app with theme-aware asset selection

export const BRANDING = {
  appName: 'BunkPro',
  tagline: 'Track Smart.',
  logoAlt: 'BunkPro Logo',
  
  // App icon (square format) - for splash screen
  getAppIcon: (isDark: boolean) => 
    isDark 
      ? '/assets/generated/bunkpro-app-icon-dark.dim_1024x1024.png'
      : '/assets/generated/bunkpro-app-icon-light.dim_1024x1024.png',
  
  // Horizontal logo with wordmark - for about section
  getHorizontalLogo: (isDark: boolean) =>
    isDark
      ? '/assets/generated/bunkpro-logo-horizontal-dark.dim_1600x500.png'
      : '/assets/generated/bunkpro-logo-horizontal-light.dim_1600x500.png',
} as const;
