import { Platform } from 'react-native'

// ─────────────────────────────────────────────────────────────────────────────
// REVENUECAT CONFIG — F17
// ─────────────────────────────────────────────────────────────────────────────

export const REVENUECAT_API_KEY = Platform.select({
  ios: 'appl_JNPPGEbGIAEqxHjKtDxnjaqfkIK',
  android: 'goog_REPLACE_WITH_ANDROID_KEY',
  default: 'appl_JNPPGEbGIAEqxHjKtDxnjaqfkIK',
}) as string

// Entitlement identifier as configured in RevenueCat dashboard
export const PRO_ENTITLEMENT_ID = 'pro'

// Offering identifiers as configured in RevenueCat dashboard
export const DEFAULT_OFFERING_ID = 'default'
export const DISCOUNT_OFFERING_ID = 'discount'
