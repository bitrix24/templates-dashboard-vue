/**
 * Formats a number as a locale-appropriate currency.
 *
 * @param value - Amount to format
 * @param currencyId - Currency code (e.g., 'USD', 'RUB')
 * @param locale - Locale code (e.g., 'ru-RU', 'en-US')
 * @returns Formatted string with currency symbol
 *
 * @example
 * formatCurrency(12345.67, 'RUB', 'ru-RU') // "12,346 ₽"
 * formatCurrency(12345.67, 'USD', 'en-US') // "$12,346"
 */
export function formatCurrency(value: number, currencyId: string, locale: string): string {
  return value.toLocaleString(locale, {
    style: 'currency',
    currency: currencyId,
    maximumFractionDigits: 0,
  });
}

/**
 * Formats a date based on the aggregation period for use in chart labels.
 *
 * @param date - Date to format
 * @param period - Aggregation period: 'daily' | 'weekly' | 'monthly'
 * @param locale - Locale code
 * @returns Formatted date string
 *
 * @example
 * formatDateByPeriod(new Date('2025-03-15'), 'daily', 'ru-RU') // "Mar 15"
 * formatDateByPeriod(new Date('2025-03-15'), 'monthly', 'en-US') // "Mar 2025"
 */
export function formatDateByPeriod(
  date: Date,
  period: 'daily' | 'weekly' | 'monthly',
  locale: string
): string {
  const optionsMap: Record<typeof period, Intl.DateTimeFormatOptions> = {
    daily: { day: 'numeric', month: 'short' },
    weekly: { day: 'numeric', month: 'short' },
    monthly: { year: 'numeric', month: 'short' },
  };
  return date.toLocaleString(locale, optionsMap[period]);
}

/**
 * Formats a date in short format (e.g., to display a range).
 *
 * @param date - The date to format
 * @param locale - The locale code
 * @returns The formatted string (e.g., "03/15/2025" or "03/15/2025")
 *
 * @example
 * formatDateRange(new Date('2025-03-15'), 'ru-RU') // "03/15/2025"
 */
export function formatDateRange(date: Date, locale: string): string {
  return date.toLocaleString(locale, {
    dateStyle: 'short',
    hour12: false,
  });
}

/**
 * Formats the date and time in short format for display in the list of recent transactions.
 *
 * @param date - Date and time
 * @param locale - Locale code
 * @returns Formatted string (e.g., "Mar 15, 2:30 PM")
 *
 * @example
 * formatDateTimeShort(new Date('2025-03-15T14:30:00'), 'ru-RU') // "Mar 15, 2:30 PM"
 */
export function formatDateTimeShort(date: Date, locale: string): string {
  return date.toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
