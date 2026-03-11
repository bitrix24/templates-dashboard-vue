import type { B24Frame } from '@bitrix24/b24jssdk'
import { ref, shallowRef, computed, watch } from 'vue'
import { createSharedComposable } from '@vueuse/core'
import { sub } from 'date-fns'
import { SdkError } from '@bitrix24/b24jssdk'
import * as locales from '@bitrix24/b24ui-nuxt/locale'
import { fetchDealsInRange, openDeal, type PartialStats } from './api'
import { formatCurrency, formatDateByPeriod, formatDateRange, formatDateTimeShort } from './formatters'
import { generateMockStats, generateMockChart, generateMockSales } from './mocks'
import { getDatesByPeriod, buildChartData, getLatestSales } from './helpers'

// Constants
import ContactIcon from '@bitrix24/b24icons-vue/outline/ContactIcon'
import GraphsDiagramIcon from '@bitrix24/b24icons-vue/outline/GraphsDiagramIcon'
import WalletIcon from '@bitrix24/b24icons-vue/outline/WalletIcon'
import ShoppingCartIcon from '@bitrix24/b24icons-vue/outline/ShoppingCartIcon'

// Types from global types
import type { DataRecord, Period, Range, Sale, Stat } from '../../types'

// Mapping stage semantics to statuses (used in api.ts, but duplicated for local use)
const mapStatus = {
  P: 'processing',
  S: 'success',
  F: 'failed',
} as const


export interface MockOptions {
  /** Локаль для форматирования */
  locale: string
  /** Default currency */
  currency: string
  /** Aggregation period (for the chart) */
  period?: Period
  /** Date range (for chart) */
  range?: Range
}

/**
 * The main component for working with deal statistics.
 * Provides data for cards, charts, and the list of recent deals,
 * and also manages downloads, periods, and date ranges.
 */
const _useDealStats = () => {
  // ------------------------------------------------------------------------
  // States
  // ------------------------------------------------------------------------
  const range = shallowRef<Range>({
    start: sub(new Date(), { days: 7 }),
    end: new Date(),
  })

  const period = ref<Period>('daily')
  const stats = ref<Stat[]>([])
  const chart = ref<DataRecord[]>([])
  const sales = ref<Sale[]>([])
  const loading = ref<boolean>(false)
  const currencyList = ref<string[]>([])

  // Localization (cache after first definition)
  const _localeCode = ref<string | null>(null)
  const _localeKey = ref<string | null>(null)

  // ------------------------------------------------------------------------
  // Bitrix24
  //-----------------------------------------------------------------------
  const b24Instance = useB24()
  const $logger = b24Instance.buildLogger('useDealStats')
  const $b24 = b24Instance.get() as B24Frame
  const isUseB24 = computed<boolean>(() => b24Instance.isInit())

  // ------------------------------------------------------------------------
  // Computed locales
  // ------------------------------------------------------------------------
  const localeCode = computed(() => {
    if (_localeCode.value !== null) return _localeCode.value

    if (isUseB24.value) {
      _localeCode.value = locales[$b24.getLang()]?.locale
    }
    if (!_localeCode.value && typeof window !== 'undefined' && window.navigator?.language.includes('ru')) {
      _localeCode.value = 'ru-RU'
    }
    if (!_localeCode.value) {
      _localeCode.value = 'en-US'
    }

    $logger.debug('set locale code', { locale: _localeCode.value })
    return _localeCode.value
  })

  const localeKey = computed(() => {
    if (_localeKey.value !== null) return _localeKey.value

    if (isUseB24.value) {
      _localeKey.value = locales[$b24.getLang()]?.code
    }
    if (!_localeKey.value && typeof window !== 'undefined' && window.navigator?.language.includes('ru')) {
      _localeKey.value = 'ru'
    }
    if (!_localeKey.value) {
      _localeKey.value = 'en'
    }

    $logger.debug('set locale key', { locale: _localeKey.value })
    return _localeKey.value
  })

  // Default currency (can be improved by getting it from portal settings)
  const defaultCurrency = computed(() => {
    if (typeof window !== 'undefined' && window.navigator?.language.includes('ru')) {
      return 'RUB'
    }
    return 'USD'
  })

  // ------------------------------------------------------------------------
  // Formatters (linked to the current locale)
  // ------------------------------------------------------------------------
  const formatCurrencyLocal = (value: number, currencyId?: string): string => {
    return formatCurrency(value, currencyId ?? defaultCurrency.value, localeCode.value)
  }

  const formatDateByPeriodLocal = (date: Date): string => {
    return formatDateByPeriod(date, period.value, localeCode.value)
  }

  const formatDateRangeLocal = (date: Date): string => {
    return formatDateRange(date, localeCode.value)
  }

  const formatDateTimeShortLocal = (date: Date): string => {
    return formatDateTimeShort(date, localeCode.value)
  }

  // ------------------------------------------------------------------------
  // Helper functions for working with data
  // ------------------------------------------------------------------------

  /**
   * Resets statistics cards to empty values (used before loading).
   */
  function resetStats(): void {
    stats.value = [
      {
        title: 'Customers',
        icon: ContactIcon,
        value: 0,
        variation: null,
      },
      {
        title: 'Conversions',
        icon: GraphsDiagramIcon,
        value: 0,
        variation: null,
      },
      {
        title: 'Orders',
        icon: ShoppingCartIcon,
        value: 0,
        variation: null,
      },
      {
        title: 'Revenue',
        icon: WalletIcon,
        value: formatCurrencyLocal(0, defaultCurrency.value),
        variation: null,
      },
    ]
  }

  /**
   * Updates statistics cards based on partial data.
   * @param partial - Partial data (customers, conversions, orders, revenue by currency)
   */
  function updateStatsFromPartial(partial: PartialStats): void {
    const revenueValues = Object.entries(partial.revenue).map(([currency, amount]) =>
      formatCurrencyLocal(amount, currency)
    )

    stats.value = [
      {
        title: 'Customers',
        icon: ContactIcon,
        value: partial.customers,
        variation: null,
      },
      {
        title: 'Conversions',
        icon: GraphsDiagramIcon,
        value: partial.conversions,
        variation: null,
      },
      {
        title: 'Orders',
        icon: ShoppingCartIcon,
        value: partial.orders,
        variation: null,
      },
      // There can be multiple currencies for income—we'll show them all, but the original had one line.
      // Here, we'll leave it as is: the first currency in the list or an empty line.
      // In a real project, it would be worth considering displaying multiple currencies.
      ...(revenueValues.length > 0
        ? revenueValues.map((row) => ({
          title: 'Revenue',
          icon: WalletIcon,
          value: row,
          variation: null,
        }))
        : []),
    ]
  }

  // ------------------------------------------------------------------------
// Loading data (real or mock)
// ------------------------------------------------------------------------

  /**
   * Loads deals from the CRM and updates the stats, chart, sales, and currencyList statuses.
   */
  async function loadDeals(): Promise<void> {
    try {
      loading.value = true

      if (!isUseB24.value) {
        // Development mode / without B24 - using mocks
        const mockOptions: MockOptions = {
          locale: localeCode.value,
          currency: defaultCurrency.value,
          period: period.value,
          range: range.value,
        }
        stats.value = generateMockStats(localeCode.value, defaultCurrency.value)
        chart.value = generateMockChart(period.value, range.value, defaultCurrency.value)
        sales.value = generateMockSales()
        return
      }

      await processCrmData()
    } catch (error) {
      $logger.error('Error loading deals', { error })
      // Здесь можно добавить состояние ошибки для отображения в UI
    } finally {
      loading.value = false
    }
  }

  /**
   * Basic logic for processing CRM data.
   * Retrieves deals for the current and previous periods, creates a chart and lists the latest deals.
   */
  async function processCrmData(): Promise<void> {
    const dates = getDatesByPeriod(range.value, period.value)
    const previousStart = sub(range.value.start, { years: 1 })
    const previousEnd = sub(range.value.end, { years: 1 })

    // Reset cards before loading
    resetStats()

    try {
      // Loading data for the current period with partial updating of cards
      const currentPromise = fetchDealsInRange(
        $b24,
        range.value.start,
        range.value.end,
        (partial) => updateStatsFromPartial(partial)
      )

      // Load data for the previous period
      const previousPromise = fetchDealsInRange($b24, previousStart, previousEnd)

      const [currentResult, previousResult] = await Promise.all([
        currentPromise,
        previousPromise
      ])

      // We save a list of currencies encountered in successful transactions of the current period
      currencyList.value = Object.keys(currentResult.totalSuccessfulAmountByCurrency)

      // Plotting data for the chart (only successful trades)
      chart.value = buildChartData(currentResult.rows, dates)

      // Last 5 closed deals
      sales.value = getLatestSales(currentResult.rows, 5)

      $logger.debug('Previous period data', { previousResult })
    } catch (error) {
      if (error instanceof SdkError) {
        $logger.error(`CRM processing error: ${error.message}`, { code: error.code })
      } else {
        $logger.error('Unknown error during data processing', { error })
      }
      throw error
    }
  }

  // ------------------------------------------------------------------------
  // Public methods
  // ------------------------------------------------------------------------

  /**
   * Opens the deal card in a slider.
   * @param row - The deal object (must contain editPath)
   */
  async function openDealHandler(row: Sale) {
    if (!isUseB24.value || !row.editPath) return
    return openDeal($b24, row.editPath)
  }

  // ------------------------------------------------------------------------
  // Reactivity: when the period or range changes, reload the data
  // ------------------------------------------------------------------------
  watch(
    [period, range],
    async () => {
      await loadDeals()
    },
    { immediate: true }
  )

  // ------------------------------------------------------------------------
  // Computed properties for the template
  // ------------------------------------------------------------------------
  const statsData = computed(() => stats.value)
  const chartData = computed(() => chart.value)
  const salesData = computed(() => sales.value)
  const currencyListData = computed(() => {
    if (!isUseB24.value) {
      return [defaultCurrency.value]
    }
    return currencyList.value
  })
  const isLoading = computed(() => loading.value)

  // ------------------------------------------------------------------------
  // Return value
  // ------------------------------------------------------------------------
  return {
    // Состояния
    range,
    period,
    statsData,
    chartData,
    currencyListData,
    salesData,
    isLoading,

    // Formatters (public)
    formatCurrency: formatCurrencyLocal,
    formatDateRange: formatDateRangeLocal,
    formatDateByPeriod: formatDateByPeriodLocal,
    formatDateTimeShort: formatDateTimeShortLocal,

    // Actions
    openDeal: openDealHandler,

    // Locales (in case they are needed in the template)
    localeCode,
    localeKey,
    defaultCurrency,
  }
}

/**
 * Export a shared composable for use in multiple components.
 */
export const useDealStats = createSharedComposable(_useDealStats)
