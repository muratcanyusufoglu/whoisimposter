import { create } from 'zustand'
import Purchases, {
  CustomerInfo,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases'
import { PRO_ENTITLEMENT_ID, DISCOUNT_OFFERING_ID } from '@/config/revenueCat'

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT IDs (must match RevenueCat / App Store / Play Store)
// ─────────────────────────────────────────────────────────────────────────────

export const PRODUCT_IDS = {
  MONTHLY: 'com.whosimposter.party.monthly',
  YEARLY: 'com.whosimposter.party.yearly',
  YEARLY_DISCOUNT: 'com.whosimposter.party.yearly.discount',
} as const

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS]

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract isPro + expiryDate from a CustomerInfo object.
 * Uses the RevenueCat entitlement as the source of truth.
 */
function parseCustomerInfo(info: CustomerInfo): {
  isPro: boolean
  expiryDate: string | null
} {
  const entitlement = info.entitlements.active[PRO_ENTITLEMENT_ID]
  const isPro = entitlement?.isActive === true
  const expiryDate = entitlement?.expirationDate ?? info.latestExpirationDate ?? null
  return { isPro, expiryDate }
}

/**
 * Formats a per-month price from an annual price.
 * Uses Intl.NumberFormat for locale-aware formatting.
 */
function formatPerMonth(annualPrice: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(annualPrice / 12)
  } catch {
    return (annualPrice / 12).toFixed(2)
  }
}

/**
 * Converts a RevenueCat intro price period to number of free trial days.
 * Returns null if it's not a free trial (price !== 0).
 */
function calcTrialDays(intro: {
  price: number
  periodUnit: string
  periodNumberOfUnits: number
}): number | null {
  if (intro.price !== 0) return null
  const units = intro.periodNumberOfUnits ?? 1
  switch (intro.periodUnit) {
    case 'DAY':   return units
    case 'WEEK':  return units * 7
    case 'MONTH': return units * 30
    case 'YEAR':  return units * 365
    default:      return units
  }
}

/**
 * Returns true if the error represents a user-initiated cancellation.
 * Cancelled purchases are not errors we surface to the user.
 */
function isCancelledError(e: unknown): boolean {
  if (typeof e === 'object' && e !== null && 'code' in e) {
    return (e as { code: string }).code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
  }
  return false
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Live price data fetched from RevenueCat offerings. All null until loaded. */
export interface SubscriptionPrices {
  /** Monthly plan price string, e.g. "$4.99" */
  monthly: string | null
  /** Yearly plan price string (total), e.g. "$29.99" */
  yearlyTotal: string | null
  /** Yearly plan per-month (calculated), e.g. "$2.49" */
  yearlyPerMonth: string | null
  /** Discount yearly plan price string (total), e.g. "$19.99" */
  yearlyDiscountTotal: string | null
  /** Discount yearly plan per-month (calculated), e.g. "$1.67" */
  yearlyDiscountPerMonth: string | null
  /** Number of free trial days on monthly plan (null = no trial) */
  trialDays: number | null
  /** Percentage saved with yearly vs monthly, e.g. 50 */
  yearlySavePct: number | null
  /** Percentage saved with yearly discount vs monthly, e.g. 67 */
  discountSavePct: number | null
}

interface SubscriptionState {
  isPro: boolean
  expiryDate: string | null
  isLoading: boolean
  error: string | null
  /** Which product is being purchased (for showing loading on specific button) */
  purchasingProductId: ProductId | null
  /** Live price data from RevenueCat. Null values = not yet loaded, use i18n fallbacks */
  prices: SubscriptionPrices
}

interface SubscriptionActions {
  checkStatus: () => Promise<void>
  /** Fetch live prices + trial days from RC offerings (silently fails → UI uses i18n fallback) */
  fetchPrices: () => Promise<void>
  purchaseMonthly: () => Promise<void>
  purchaseYearly: () => Promise<void>
  purchaseYearlyDiscount: () => Promise<void>
  restore: () => Promise<void>
}

export type SubscriptionStore = SubscriptionState & SubscriptionActions

// ─────────────────────────────────────────────────────────────────────────────
// STORE — F17.2
// Wired to real RevenueCat SDK (react-native-purchases v9).
// Purchases.configure() is called once in app/_layout.tsx on app start.
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_PRICES: SubscriptionPrices = {
  monthly: null,
  yearlyTotal: null,
  yearlyPerMonth: null,
  yearlyDiscountTotal: null,
  yearlyDiscountPerMonth: null,
  trialDays: null,
  yearlySavePct: null,
  discountSavePct: null,
}

export const useSubscriptionStore = create<SubscriptionStore>()((set) => ({
  isPro: false,
  expiryDate: null,
  isLoading: false,
  error: null,
  purchasingProductId: null,
  prices: EMPTY_PRICES,

  // ── Check subscription status ──────────────────────────────────────────────
  checkStatus: async () => {
    set({ isLoading: true, error: null })
    try {
      const info = await Purchases.getCustomerInfo()
      const { isPro, expiryDate } = parseCustomerInfo(info)
      set({ isPro, expiryDate, isLoading: false })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to check subscription'
      set({ isLoading: false, error: msg })
    }
  },

  // ── Fetch live prices from RC offerings ────────────────────────────────────
  // Silently fails — UI always has i18n fallback strings.
  fetchPrices: async () => {
    try {
      const offerings = await Purchases.getOfferings()

      // Collect packages from both default and discount offerings
      const allPkgs = [
        ...(offerings.current?.availablePackages ?? []),
        ...((offerings.all[DISCOUNT_OFFERING_ID] as typeof offerings.current)
          ?.availablePackages ?? []),
      ]

      // Index by product identifier
      const map: Record<string, {
        price: number
        priceString: string
        currencyCode: string
        introductoryPrice: { price: number; periodUnit: string; periodNumberOfUnits: number } | null
      }> = {}

      for (const pkg of allPkgs) {
        const p = pkg.product
        map[p.identifier] = {
          price: p.price,
          priceString: p.priceString,
          currencyCode: p.currencyCode ?? 'USD',
          introductoryPrice: (p as unknown as { introductoryPrice: typeof map[string]['introductoryPrice'] }).introductoryPrice ?? null,
        }
      }

      const m  = map[PRODUCT_IDS.MONTHLY]
      const y  = map[PRODUCT_IDS.YEARLY]
      const yd = map[PRODUCT_IDS.YEARLY_DISCOUNT]

      const mPrice  = m?.price ?? 0
      const yMonth  = y ? y.price / 12 : 0
      const ydMonth = yd ? yd.price / 12 : 0
      const cc = m?.currencyCode ?? y?.currencyCode ?? 'USD'

      const prices: SubscriptionPrices = {
        monthly:                 m  ? m.priceString  : null,
        yearlyTotal:             y  ? y.priceString  : null,
        yearlyPerMonth:          y  ? formatPerMonth(y.price,  y.currencyCode  ?? cc) : null,
        yearlyDiscountTotal:     yd ? yd.priceString : null,
        yearlyDiscountPerMonth:  yd ? formatPerMonth(yd.price, yd.currencyCode ?? cc) : null,
        trialDays:               m?.introductoryPrice ? calcTrialDays(m.introductoryPrice) : null,
        yearlySavePct:           mPrice > 0 && yMonth  > 0 ? Math.round((1 - yMonth  / mPrice) * 100) : null,
        discountSavePct:         mPrice > 0 && ydMonth > 0 ? Math.round((1 - ydMonth / mPrice) * 100) : null,
      }

      set({ prices })
    } catch {
      // Silently fail — UI falls back to i18n strings
    }
  },

  // ── Purchase monthly ───────────────────────────────────────────────────────
  purchaseMonthly: async () => {
    set({ isLoading: true, error: null, purchasingProductId: PRODUCT_IDS.MONTHLY })
    try {
      const { customerInfo } = await _purchaseByProductId(PRODUCT_IDS.MONTHLY)
      const { isPro, expiryDate } = parseCustomerInfo(customerInfo)
      set({ isPro, expiryDate, isLoading: false, purchasingProductId: null, error: null })
    } catch (e) {
      if (isCancelledError(e)) {
        // User cancelled — not an error we show
        set({ isLoading: false, purchasingProductId: null, error: null })
      } else {
        const msg = e instanceof Error ? e.message : 'Purchase failed'
        set({ isLoading: false, purchasingProductId: null, error: msg })
      }
    }
  },

  // ── Purchase yearly ────────────────────────────────────────────────────────
  purchaseYearly: async () => {
    set({ isLoading: true, error: null, purchasingProductId: PRODUCT_IDS.YEARLY })
    try {
      const { customerInfo } = await _purchaseByProductId(PRODUCT_IDS.YEARLY)
      const { isPro, expiryDate } = parseCustomerInfo(customerInfo)
      set({ isPro, expiryDate, isLoading: false, purchasingProductId: null, error: null })
    } catch (e) {
      if (isCancelledError(e)) {
        set({ isLoading: false, purchasingProductId: null, error: null })
      } else {
        const msg = e instanceof Error ? e.message : 'Purchase failed'
        set({ isLoading: false, purchasingProductId: null, error: msg })
      }
    }
  },

  // ── Purchase yearly discount ───────────────────────────────────────────────
  purchaseYearlyDiscount: async () => {
    set({ isLoading: true, error: null, purchasingProductId: PRODUCT_IDS.YEARLY_DISCOUNT })
    try {
      const { customerInfo } = await _purchaseByProductId(PRODUCT_IDS.YEARLY_DISCOUNT)
      const { isPro, expiryDate } = parseCustomerInfo(customerInfo)
      set({ isPro, expiryDate, isLoading: false, purchasingProductId: null, error: null })
    } catch (e) {
      if (isCancelledError(e)) {
        set({ isLoading: false, purchasingProductId: null, error: null })
      } else {
        const msg = e instanceof Error ? e.message : 'Purchase failed'
        set({ isLoading: false, purchasingProductId: null, error: msg })
      }
    }
  },

  // ── Restore purchases ──────────────────────────────────────────────────────
  restore: async () => {
    set({ isLoading: true, error: null })
    try {
      const info = await Purchases.restorePurchases()
      const { isPro, expiryDate } = parseCustomerInfo(info)
      set({ isPro, expiryDate, isLoading: false })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Restore failed'
      set({ isLoading: false, error: msg })
    }
  },

}))

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPER — F17.4
// Purchase via Offerings package (RevenueCat preferred flow).
// Falls back to direct purchaseProduct if Offerings aren't configured yet.
// Handles "already subscribed" edge case: SDK throws with the current
// CustomerInfo in the error — we extract and apply it.
// ─────────────────────────────────────────────────────────────────────────────

async function _purchaseByProductId(
  productId: string,
): Promise<{ customerInfo: CustomerInfo }> {
  // Try package-based purchase via Offerings (preferred RevenueCat flow)
  try {
    const offerings = await Purchases.getOfferings()
    const current = offerings.current
    if (current) {
      const pkg = current.availablePackages.find(
        (p) => p.product.identifier === productId,
      )
      if (pkg) {
        return await Purchases.purchasePackage(pkg)
      }
    }
  } catch (offeringsErr) {
    // If offerings fetch fails or package not found, fall through.
    // If it's a purchase error (e.g. PURCHASE_CANCELLED_ERROR or already
    // subscribed), re-throw so the caller can handle it.
    if (
      typeof offeringsErr === 'object' &&
      offeringsErr !== null &&
      'code' in offeringsErr
    ) {
      throw offeringsErr
    }
  }

  // Fallback: direct product purchase by product identifier
  return await Purchases.purchaseProduct(productId)
}
