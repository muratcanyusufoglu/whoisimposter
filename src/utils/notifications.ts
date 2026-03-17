import * as Notifications from 'expo-notifications'

// ─────────────────────────────────────────────────────────────────────────────
// Notifications utility
// Handles permission requests and local notification scheduling.
// Used for: discount offers (non-PRO) and game night reminders.
// ─────────────────────────────────────────────────────────────────────────────

// How notifications appear while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

// ── Permission ────────────────────────────────────────────────────────────────

/** Request notification permission. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

/** Check current permission without prompting. */
export async function getNotificationPermissionStatus(): Promise<string> {
  const { status } = await Notifications.getPermissionsAsync()
  return status
}

// ── Discount notification ─────────────────────────────────────────────────────

interface DiscountNotificationStrings {
  title: string
  body: string
}

/**
 * Schedule a one-time discount notification N days from now.
 * Only called after permission is granted.
 * Returns the notification ID (for cancellation) or null on failure.
 */
export async function scheduleDiscountNotification(
  daysFromNow: number = 3,
  strings: DiscountNotificationStrings,
): Promise<string | null> {
  try {
    const triggerDate = new Date()
    triggerDate.setDate(triggerDate.getDate() + daysFromNow)

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: strings.title,
        body: strings.body,
        data: { type: 'discount' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    })

    return id
  } catch {
    return null
  }
}

/** Cancel a specific scheduled notification by ID. */
export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id)
}

/** Cancel all scheduled notifications. */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
}

// ── Notification response listener ────────────────────────────────────────────

export type NotificationDataType = 'discount' | 'reminder'

export interface NotificationData {
  type: NotificationDataType
}

/**
 * Subscribe to notification tap events.
 * Call this once in the root layout or home screen.
 * Returns the subscription (call .remove() on cleanup).
 */
export function addNotificationResponseListener(
  handler: (data: NotificationData) => void,
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as unknown as NotificationData
    if (data?.type) {
      handler(data)
    }
  })
}
