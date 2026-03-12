import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'

/** Represents the structure of a content locale object */
interface ContentLocale {
  /** Language code (ISO 639-1) */
  code: string
  /** Display name of the language */
  name: string
  /** Corresponding JSON filename in the locales directory */
  file: string
}

/** List of supported content locales */
export const contentLocales: ContentLocale[] = [
  { code: 'en', name: 'English', file: 'en.json' },
  { code: 'de', name: 'Deutsch', file: 'de.json' },
  { code: 'la', name: 'Español', file: 'la.json' },
  { code: 'br', name: 'Português (Brasil)', file: 'br.json' },
  { code: 'fr', name: 'Français', file: 'fr.json' },
  { code: 'it', name: 'Italiano', file: 'it.json' },
  { code: 'pl', name: 'Polski', file: 'pl.json' },
  { code: 'ru', name: 'Русский', file: 'ru.json' },
  { code: 'ua', name: 'Українська', file: 'ua.json' },
  { code: 'tr', name: 'Türkçe', file: 'tr.json' },
  { code: 'sc', name: '中文（简体）', file: 'sc.json' },
  { code: 'tc', name: '中文（繁體）', file: 'tc.json' },
  { code: 'ja', name: '日本語', file: 'ja.json' },
  { code: 'vn', name: 'Tiếng Việt', file: 'vn.json' },
  { code: 'id', name: 'Bahasa Indonesia', file: 'id.json' },
  { code: 'ms', name: 'Bahasa Melayu', file: 'ms.json' },
  { code: 'th', name: 'ภาษาไทย', file: 'th.json' },
  { code: 'ar', name: 'عربي', file: 'ar.json' },
  { code: 'kz', name: 'Қазақша', file: 'kz.json' }
]

const DEFAULT_LOCALE = 'en'

/**
 * Checks if the provided language code is registered in the configuration.
 * @param code - The language code to verify.
 */
export const isLocaleAvailable = (code: string): boolean =>
  contentLocales.some(l => l.code === code)

/**
 * Retrieves the locale configuration object by its code.
 * @param code - The language code to search for.
 */
export const getLocaleConfig = (code: string): ContentLocale | undefined =>
  contentLocales.find(l => l.code === code)

/**
 * Performs lazy loading of localization JSON files.
 *
 * @async
 * @param locale - The locale code to load.
 * @returns A promise that resolves after the DOM has been updated.
 */
export async function loadLocaleMessages(locale: string): Promise<void> {
  const i18nGlobal = i18n.global

  // Skip loading if messages for this locale are already present
  if (!i18nGlobal.availableLocales.includes(locale)) {
    try {
      // Vite dynamic import: creates a separate chunk for each JSON file
      const messages = await import(`./locales/${locale}.json`)
      i18nGlobal.setLocaleMessage(locale, messages.default)
    } catch (error) {
      console.error(`[i18n] Failed to load messages for locale: ${locale}`, error)
      return
    }
  }

  // Update current locale
  i18nGlobal.locale.value = locale

  /**
   * Synchronize the HTML lang attribute for SEO and proper font rendering.
   * A 'watch' is not required as language changes in B24 trigger a full page reload.
   */
  if (typeof document !== 'undefined') {
    document.querySelector('html')?.setAttribute('lang', locale)
  }

  return nextTick()
}

export function getCurrentLocale() {
  const i18nGlobal = i18n.global
  return i18nGlobal.locale.value
}

/** Primary i18n instance */
let targetCode = DEFAULT_LOCALE
if (typeof window !== 'undefined' && window.navigator?.language.includes('ru')) {
  targetCode = 'ru'
}

export const i18n = createI18n({
  legacy: false,
  locale: targetCode,
  fallbackLocale: DEFAULT_LOCALE,
  globalInjection: true,
  messages: {} // Initially empty, populated via loadLocaleMessages
})

// Initial load of the default language
await loadLocaleMessages(DEFAULT_LOCALE)
