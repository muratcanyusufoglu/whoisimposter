import { useWindowDimensions } from 'react-native'

/** Breakpoint at which we treat the device as a tablet. */
const TABLET_BREAKPOINT = 768

export interface DeviceInfo {
  width: number
  height: number
  isTablet: boolean
}

/**
 * Returns reactive window dimensions and a boolean `isTablet` flag.
 * On tablets, layouts can centre content within a max-width container.
 */
export function useDevice(): DeviceInfo {
  const { width, height } = useWindowDimensions()
  return { width, height, isTablet: width >= TABLET_BREAKPOINT }
}
