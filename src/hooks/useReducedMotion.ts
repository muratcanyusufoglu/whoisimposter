import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

/**
 * Returns true if the user has enabled Reduce Motion in system accessibility settings.
 * Subscribes to changes so the value updates if the user toggles it while the app is open.
 * Use this to skip or simplify animations for accessibility.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduced)
      .catch(() => {})

    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced)
    return () => sub.remove()
  }, [])

  return reduced
}
