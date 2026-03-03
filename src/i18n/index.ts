import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { I18nManager } from 'react-native'
import * as Localization from 'expo-localization'
import AsyncStorage from '@react-native-async-storage/async-storage'

import en from './locales/en.json'
import tr from './locales/tr.json'
import de from './locales/de.json'
import fr from './locales/fr.json'
import es from './locales/es.json'
import pt from './locales/pt.json'
import ru from './locales/ru.json'
import ar from './locales/ar.json'
import it from './locales/it.json'
import nl from './locales/nl.json'

const LANGUAGE_KEY = '@selected_language'

// RTL locales
const RTL_LOCALES = ['ar']

// All supported locales
export const SUPPORTED_LOCALES = ['en', 'tr', 'de', 'fr', 'es', 'pt', 'ru', 'ar', 'it', 'nl'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_META: Record<SupportedLocale, { flag: string; nativeName: string }> = {
  en: { flag: '🇬🇧', nativeName: 'English' },
  tr: { flag: '🇹🇷', nativeName: 'Türkçe' },
  de: { flag: '🇩🇪', nativeName: 'Deutsch' },
  fr: { flag: '🇫🇷', nativeName: 'Français' },
  es: { flag: '🇪🇸', nativeName: 'Español' },
  pt: { flag: '🇧🇷', nativeName: 'Português' },
  ru: { flag: '🇷🇺', nativeName: 'Русский' },
  ar: { flag: '🇸🇦', nativeName: 'العربية' },
  it: { flag: '🇮🇹', nativeName: 'Italiano' },
  nl: { flag: '🇳🇱', nativeName: 'Nederlands' },
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT — called once in root _layout.tsx before render
// ─────────────────────────────────────────────────────────────────────────────

let _initialized = false

/**
 * Initialize i18next synchronously with default language, then asynchronously
 * load the user's saved language preference.
 */
export function initI18n(): void {
  if (_initialized) return
  _initialized = true

  // Determine initial language from device locale (EN fallback)
  const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en'
  const initialLang = SUPPORTED_LOCALES.includes(deviceLocale as SupportedLocale)
    ? deviceLocale
    : 'en'

  i18n.use(initReactI18next).init({
    lng: initialLang,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      tr: { translation: tr },
      de: { translation: de },
      fr: { translation: fr },
      es: { translation: es },
      pt: { translation: pt },
      ru: { translation: ru },
      ar: { translation: ar },
      it: { translation: it },
      nl: { translation: nl },
    },
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  })
}

/**
 * Load the user's persisted language choice and apply it.
 * Call this from a useEffect in _layout.tsx after i18n is initialized.
 */
export async function loadSavedLanguage(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY)
    if (saved && SUPPORTED_LOCALES.includes(saved as SupportedLocale)) {
      await i18n.changeLanguage(saved)
      applyRTL(saved)
    }
  } catch {
    // fail silently — default language already set
  }
}

/**
 * Change language atomically: updates i18next + persists the choice.
 * Also applies RTL layout direction for Arabic.
 */
export async function changeLanguage(lang: SupportedLocale): Promise<void> {
  await i18n.changeLanguage(lang)
  await AsyncStorage.setItem(LANGUAGE_KEY, lang)
  applyRTL(lang)
}

/**
 * Apply or remove RTL layout for the given locale.
 * Note: RTL changes require an app restart to take full effect on Android.
 */
function applyRTL(lang: string): void {
  const isRTL = RTL_LOCALES.includes(lang)
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL)
    I18nManager.forceRTL(isRTL)
  }
}

export { i18n }
