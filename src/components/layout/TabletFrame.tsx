import React from 'react'
import { ViewStyle } from 'react-native'

interface TabletFrameProps {
  children: React.ReactNode
  style?: ViewStyle
}

/**
 * Pass-through wrapper — kept so imports compile.
 * Layout adaptation is handled per-screen (column counts, padding, etc.).
 */
export function TabletFrame({ children }: TabletFrameProps) {
  return <>{children}</>
}
