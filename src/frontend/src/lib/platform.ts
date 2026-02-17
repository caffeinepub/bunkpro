// Runtime platform detection utility for Android and other platform-specific UI logic.

export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;

  // Check userAgentData first (modern API)
  if ('userAgentData' in navigator && (navigator as any).userAgentData) {
    const platform = (navigator as any).userAgentData.platform?.toLowerCase() || '';
    if (platform.includes('android')) return true;
  }

  // Fallback to userAgent string
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('android');
}
