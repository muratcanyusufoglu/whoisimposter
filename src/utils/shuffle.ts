/**
 * Fisher-Yates shuffle — produces an unbiased random permutation.
 * Returns a NEW array; never mutates the input.
 */
export function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Pick `count` random unique items from `array`.
 * Returns a NEW array of length min(count, array.length).
 */
export function pickRandom<T>(array: readonly T[], count: number): T[] {
  return shuffle(array).slice(0, count)
}

/**
 * Pick a single random item from `array`.
 * Returns undefined if the array is empty.
 */
export function pickOne<T>(array: readonly T[]): T | undefined {
  if (array.length === 0) return undefined
  return array[Math.floor(Math.random() * array.length)]
}
