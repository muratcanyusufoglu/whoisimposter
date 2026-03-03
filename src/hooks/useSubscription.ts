import { useCallback } from 'react'
import { useSubscriptionStore } from '@/store/subscriptionStore'

// ─────────────────────────────────────────────────────────────────────────────
// useSubscription — Pro status checks + paywall trigger helpers.
// Use this anywhere a feature gate or purchase action is needed.
// ─────────────────────────────────────────────────────────────────────────────

export function useSubscription() {
  const {
    isPro,
    isLoading,
    error,
    purchasingProductId,
    checkStatus,
    purchaseMonthly,
    purchaseYearly,
    restore,
  } = useSubscriptionStore()

  /**
   * Gate function: returns true if the user can access a premium feature.
   * Always returns true if isPro; returns false otherwise and lets the
   * caller decide how to respond (e.g. open paywall, show badge).
   */
  const canAccess = useCallback(
    (requiresPro: boolean): boolean => {
      if (!requiresPro) return true
      return isPro
    },
    [isPro],
  )

  /**
   * Returns true if a specific product purchase is in-flight.
   */
  const isPurchasing = useCallback(
    (productId: string): boolean => purchasingProductId === productId,
    [purchasingProductId],
  )

  return {
    isPro,
    isLoading,
    error,
    canAccess,
    isPurchasing,
    checkStatus,
    purchaseMonthly,
    purchaseYearly,
    restore,
  }
}
