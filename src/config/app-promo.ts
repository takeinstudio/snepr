// Centralized Snepr Native App & Promotion Configuration

export const PROMO_CONFIG = {
  // Days to suppress the large bottom sheet after explicit dismissal
  PROMO_DISMISS_DAYS: 7,
  // Local storage key for tracking dismissal timestamp
  STORAGE_KEY_DISMISSED: 'snepr_app_promo_dismissed_at',
  // Local storage key for tracking compact banner dismissal
  STORAGE_KEY_BANNER_DISMISSED: 'snepr_app_banner_dismissed_at',

  // Custom URI Scheme for Snepr React Native / Expo app
  APP_SCHEME: 'snepr://',

  // Official App Store placeholders/URLs
  ANDROID_STORE_URL: 'https://play.google.com/store/apps/details?id=in.snepr.app',
  IOS_STORE_URL: 'https://apps.apple.com/app/snepr-live-salon-queues/id6400000000',
};

/**
 * Check if the large promo bottom sheet has been dismissed within the cooldown window.
 */
export function checkIsPromoDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  const dismissedAt = localStorage.getItem(PROMO_CONFIG.STORAGE_KEY_DISMISSED);
  if (!dismissedAt) return false;

  const timestamp = parseInt(dismissedAt, 10);
  if (isNaN(timestamp)) return false;

  const cooldownMs = PROMO_CONFIG.PROMO_DISMISS_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - timestamp < cooldownMs;
}

/**
 * Persist dismissal of the promo bottom sheet with current timestamp.
 */
export function dismissPromo(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROMO_CONFIG.STORAGE_KEY_DISMISSED, Date.now().toString());
}

/**
 * Check if the compact banner has been dismissed recently (24 hour cooldown).
 */
export function checkIsBannerDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  const dismissedAt = localStorage.getItem(PROMO_CONFIG.STORAGE_KEY_BANNER_DISMISSED);
  if (!dismissedAt) return false;

  const timestamp = parseInt(dismissedAt, 10);
  if (isNaN(timestamp)) return false;

  const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours
  return Date.now() - timestamp < cooldownMs;
}

/**
 * Persist dismissal of the compact app banner.
 */
export function dismissBanner(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROMO_CONFIG.STORAGE_KEY_BANNER_DISMISSED, Date.now().toString());
}

/**
 * Intelligent Native App Router:
 * Attempts to launch the native app via deep link (snepr://), with fallback to store URL.
 */
export function openNativeApp(deepLinkPath: string = ''): void {
  if (typeof window === 'undefined') return;

  const cleanPath = deepLinkPath.startsWith('/') ? deepLinkPath.slice(1) : deepLinkPath;
  const targetDeepLink = `${PROMO_CONFIG.APP_SCHEME}${cleanPath}`;

  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  const start = Date.now();

  // Attempt deep link launch
  window.location.href = targetDeepLink;

  // Fallback to App Store listing if deep link fails to resolve within 1.5s
  setTimeout(() => {
    if (Date.now() - start < 2000) {
      if (isAndroid) {
        window.location.href = PROMO_CONFIG.ANDROID_STORE_URL;
      } else if (isIOS) {
        window.location.href = PROMO_CONFIG.IOS_STORE_URL;
      } else {
        // Desktop / Fallback route
        window.location.href = PROMO_CONFIG.ANDROID_STORE_URL;
      }
    }
  }, 1500);
}
