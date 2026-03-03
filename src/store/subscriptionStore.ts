import { create } from 'zustand'

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT IDs (must match RevenueCat / App Store / Play Store)
// ─────────────────────────────────────────────────────────────────────────────

export const PRODUCT_IDS = {
  MONTHLY: 'com.whosimposter.party.monthly',
  YEARLY: 'com.whosimposter.party.yearly',
} as const

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS]

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
// STORE
// NOTE: RevenueCat SDK is integrated in F11. This is a stub that maintains
// the correct interface so all consuming code compiles now.
// ─────────────────────────────────────────────────────────────────────────────

export const useSubscriptionStore = create<SubscriptionStore>()((set) => ({
  isPro: false,
  expiryDate: null,
  isLoading: false,
  error: null,
  purchasingProductId: null,

  checkStatus: async () => {
    set({ isLoading: true, error: null })
    try {
      // TODO (F11): Purchases.getCustomerInfo()
      // const info = await Purchases.getCustomerInfo()
      // const isPro = info.activeSubscriptions.length > 0
      // set({ isPro, expiryDate: info.latestExpirationDate, isLoading: false })
      set({ isLoading: false })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      set({ isLoading: false, error: msg })
    }
  },

  purchaseMonthly: async () => {
    set({ isLoading: true, error: null, purchasingProductId: PRODUCT_IDS.MONTHLY })
    try {
      // TODO (F11): Purchases.purchaseProduct(PRODUCT_IDS.MONTHLY)
      set({ isLoading: false, purchasingProductId: null })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Purchase failed'
      set({ isLoading: false, error: msg, purchasingProductId: null })
    }
  },

  purchaseYearly: async () => {
    set({ isLoading: true, error: null, purchasingProductId: PRODUCT_IDS.YEARLY })
    try {
      // TODO (F11): Purchases.purchaseProduct(PRODUCT_IDS.YEARLY)
      set({ isLoading: false, purchasingProductId: null })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Purchase failed'
      set({ isLoading: false, error: msg, purchasingProductId: null })
    }
  },

  restore: async () => {
    set({ isLoading: true, error: null })
    try {
      // TODO (F11): Purchases.restorePurchases()
      set({ isLoading: false })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Restore failed'
      set({ isLoading: false, error: msg })
    }
  },

  _setProOverride: (isPro) => set({ isPro }),
}))
