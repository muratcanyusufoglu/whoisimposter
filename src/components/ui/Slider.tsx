import { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, LayoutChangeEvent } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated'
import { useTheme, radius } from '@/theme'

// ─────────────────────────────────────────────────────────────────────────────
// Slider — gesture-driven value picker (no native slider dependency).
// Built on react-native-gesture-handler + Reanimated so it works inside a
// vertical ScrollView (horizontal drag activates the slider, vertical scrolls).
// ─────────────────────────────────────────────────────────────────────────────

interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  /** Fill + thumb color (e.g. the player's color). */
  color: string
  /** Background track color. */
  trackColor?: string
}

const THUMB = 26
const TRACK_HEIGHT = 6
const CONTAINER_HEIGHT = 40

export function Slider({ value, min, max, step = 1, onChange, color, trackColor }: SliderProps) {
  const { theme } = useTheme()
  const [trackWidth, setTrackWidth] = useState(0)
  const usable = Math.max(1, trackWidth - THUMB)

  const tx = useSharedValue(0)
  const usableSv = useSharedValue(1)
  const dragging = useSharedValue(false)

  // Keep the thumb in sync with the controlled value, except mid-drag.
  useEffect(() => {
    if (dragging.value) return
    const ratio = max > min ? (Math.min(Math.max(value, min), max) - min) / (max - min) : 0
    tx.value = ratio * usable
  }, [value, min, max, usable, tx, dragging])

  const commit = useCallback(
    (px: number) => {
      const ratio = usable > 0 ? px / usable : 0
      let v = min + ratio * (max - min)
      v = Math.round(v / step) * step
      v = Math.min(Math.max(v, min), max)
      onChange(v)
    },
    [usable, min, max, step, onChange],
  )

  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-12, 12])
    .onBegin(() => {
      'worklet'
      dragging.value = true
    })
    .onUpdate((e) => {
      'worklet'
      const nx = Math.min(Math.max(e.x - THUMB / 2, 0), usableSv.value)
      tx.value = nx
      runOnJS(commit)(nx)
    })
    .onFinalize(() => {
      'worklet'
      dragging.value = false
    })

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    usableSv.value = Math.max(1, w - THUMB)
    setTrackWidth(w)
  }

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }))
  const fillStyle = useAnimatedStyle(() => ({ width: tx.value + THUMB / 2 }))

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.container} onLayout={onLayout}>
        <View
          style={[styles.track, { backgroundColor: trackColor ?? theme.border.subtle }]}
        />
        <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]} />
        <Animated.View
          style={[
            styles.thumb,
            { backgroundColor: color, borderColor: theme.bg.surface },
            thumbStyle,
          ]}
        />
      </View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  container: {
    height: CONTAINER_HEIGHT,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    width: '100%',
    borderRadius: radius.full,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: (CONTAINER_HEIGHT - TRACK_HEIGHT) / 2,
    height: TRACK_HEIGHT,
    borderRadius: radius.full,
  },
  thumb: {
    position: 'absolute',
    left: 0,
    top: (CONTAINER_HEIGHT - THUMB) / 2,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
  },
})
