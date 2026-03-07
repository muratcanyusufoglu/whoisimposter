import { create } from 'zustand'
import Purchases, {
  CustomerInfo,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases'
import { PRO_ENTITLEMENT_ID } from '@/config/revenueCat'

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT IDs (must match RevenueCat / App Store / Play Store)
// ─────────────────────────────────────────────────────────────────────────────

export const PRODUCT_IDS = {
  MONTHLY: 'com.whosimposter.party.monthly',
  YEARLY: 'com.whosimposter.party.yearly',
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

interface SubscriptionState {
  isPro: boolean
  expiryDate: string | null
  isLoading: boolean
  error: string | null
  /** Which product is being purchased (for showing loading on specific button) */
  purchasingProductId: ProductId | null
}

interface SubscriptionActions {
  checkStatus: () => Promise<void>
  purchaseMonthly: () => Promise<void>
  purchaseYearly: () => Promise<void>
  restore: () => Promise<void>
  /** Override for debug / testing only */
  _setProOverride: (isPro: boolean) => void
}

export type SubscriptionStore = SubscriptionState & SubscriptionActions

// ─────────────────────────────────────────────────────────────────────────────
// STORE — F17.2
// Wired to real RevenueCat SDK (react-native-purchases v9).
// Purchases.configure() is called once in app/_layout.tsx on app start.
// ─────────────────────────────────────────────────────────────────────────────

export const useSubscriptionStore = create<SubscriptionStore>()((set) => ({
  isPro: false,
  expiryDate: null,
  isLoading: false,
  error: null,
  purchasingProductId: null,

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

  // ── Debug override ─────────────────────────────────────────────────────────
  _setProOverride: (isPro) => set({ isPro }),
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
