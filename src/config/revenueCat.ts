import { Platform } from 'react-native'

// ─────────────────────────────────────────────────────────────────────────────
// REVENUECAT CONFIG — F17
// Replace the placeholder keys below with your real RevenueCat API keys.
// iOS key:  App Store Connect → RevenueCat dashboard → iOS app → API Key
// Android:  Google Play Console → RevenueCat dashboard → Android app → API Key
// ─────────────────────────────────────────────────────────────────────────────

export const REVENUECAT_API_KEY = Platform.select({
  ios: 'appl_REPLACE_WITH_IOS_KEY',
  android: 'goog_REPLACE_WITH_ANDROID_KEY',
  default: 'appl_REPLACE_WITH_IOS_KEY',
}) as string

// Entitlement identifier as configured in RevenueCat dashboard
export const PRO_ENTITLEMENT_ID = 'pro'

// Offering identifier (use 'default' unless you create a named offering)
export const DEFAULT_OFFERING_ID = 'default'
