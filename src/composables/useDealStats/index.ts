import type { DataRecord, Period, Range, Sale, Stat } from '../../types'
import type { B24Frame } from '@bitrix24/b24jssdk'
import type { PartialStats } from './api'
import { ref, shallowRef, computed, watch, nextTick } from 'vue'
import { createSharedComposable } from '@vueuse/core'
import { eachDayOfInterval, sub } from 'date-fns'
import { SdkError } from '@bitrix24/b24jssdk'
import * as locales from '@bitrix24/b24ui-nuxt/locale'
import { useB24 } from '../useB24'
import { fetchDealsInRange, openDeal } from './api'
import {
  stripTags,
  formatCurrency,
  formatDateByPeriod,
  formatDateRange,
  formatDateTimeShort
} from './formatters'
import { generateMockStats, generateMockChart, generateMockSales } from './mocks'
import { getDatesByPeriod, buildChartData, getLatestSales, calculateVariation } from './helpers'
import ContactIcon from '@bitrix24/b24icons-vue/outline/ContactIcon'
import GraphsDiagramIcon from '@bitrix24/b24icons-vue/outline/GraphsDiagramIcon'
import WalletIcon from '@bitrix24/b24icons-vue/outline/WalletIcon'
import ShoppingCartIcon from '@bitrix24/b24icons-vue/outline/ShoppingCartIcon'
import CloudErrorIcon from '@bitrix24/b24icons-vue/main/CloudErrorIcon'

/**
 * The main component for working with deal statistics.
 * Provides data for cards, charts, and the list of recent deals,
 * and also manages downloads, periods, and date ranges.
 */
const _useDealStats = () => {
  const toast = useToast()

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

  /**
   * Default currency
   * @todo improved by getting it from portal settings
   */
  const defaultCurrency = computed(() => {
    if (typeof window !== 'undefined' && window.navigator?.language.includes('ru')) {
      return 'RUB'
    }
    return 'USD'
  })

  // ------------------------------------------------------------------------
  // Formatters (linked to the current locale)
  // ------------------------------------------------------------------------
  const formatCurrencyLocal = (value: number, currencyCode: string): string => {
    if (!isUseB24.value) {
      return formatCurrency(value, currencyCode, localeCode.value)
    }

    return stripTags(
      b24Instance.getHelper()!.currency.format(
        value,
        currencyCode,
        localeCode.value
      )
    )
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
   * Update statistics cards values
   */
  function updateStats(statMap: Map<string, Stat>) {
    stats.value = Array.from(statMap.values())
  }

  function buildRevenue(currency: string): Stat {
    return {
      title: 'Revenue',
      descriptions: `The total amount in ${currency} of won deals across all pipelines during the reporting period.`,
      icon: WalletIcon,
      value: 0,
      formatValue: formatCurrencyLocal(0, currency),
      variation: null
    } as Stat
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
        // Without B24 - using mocks
        stats.value = generateMockStats(localeCode.value, defaultCurrency.value)
        chart.value = generateMockChart(period.value, range.value, defaultCurrency.value)
        sales.value = generateMockSales(defaultCurrency.value)
        return
      }

      await processCrmData()
    } catch (error) {
      toast.add({
        title: 'Error',
        description: error instanceof Error ? error.message : `${error}`,
        color: 'air-primary-alert',
        icon: CloudErrorIcon
      })
      $logger.error('Error loading', { error })
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

    try {
      // Reset statistics cards before loading
      const statMap = new Map<string, Stat>([
        ['customers', { title: 'Clients', descriptions: 'The number of unique clients (Company or Contact) from closed deals across all pipelines during the reporting period.', icon: ContactIcon, value: 0, formatValue: '0', variation: null }],
        ['orders', { title: 'Total Deals', descriptions: 'The total number of deals across all pipelines during the reporting period.', icon: ShoppingCartIcon, value: 0, formatValue: '0', variation: null }],
        ['conversions', { title: 'Won Deals', descriptions: 'The number of successfully closed deals across all pipelines during the reporting period.', icon: GraphsDiagramIcon, value: 0, formatValue: '0', variation: null }]
      ])

      updateStats(statMap)

      // Loading data for the current period with partial updating of cards
      const currentPromise = fetchDealsInRange(
        $b24,
        range.value.start,
        range.value.end,
        defaultCurrency.value,
        (current: PartialStats) => {
          (['customers', 'conversions', 'orders'] as const).forEach(k => {
            const stat = statMap.get(k)!
            stat.value = current[k]
            stat.formatValue = String(current[k])
            if (typeof stat.prevRawValue !== 'undefined') {
              stat.variation = calculateVariation(stat.value, stat.prevRawValue)
            }
          })

          current.revenueValue.forEach((row) => {
            const key = `revenue-${row.currency}`
            const stat = statMap.get(key) || buildRevenue(row.currency)
            stat.value = row.amount
            stat.formatValue = formatCurrencyLocal(row.amount, row.currency)
            if (typeof stat.prevRawValue !== 'undefined') {
              stat.variation = calculateVariation(stat.value, stat.prevRawValue)
            }
            statMap.set(key, stat as Stat)
          })

          updateStats(statMap)
        }
      )

      // Load data for the previous period
      const previousPromise = fetchDealsInRange(
        $b24,
        previousStart,
        previousEnd,
        defaultCurrency.value,
        (prev: PartialStats) => {
          (['customers', 'conversions', 'orders']  as const).forEach(k => {
            if (!statMap.has(k)) {
              return
            }

            const stat = statMap.get(k)!
            stat.prevRawValue = prev[k]
            if (stat.value !== 0) {
              stat.variation = calculateVariation(stat.value, stat.prevRawValue)
            }
          })

          prev.revenueValue.forEach((row) => {
            const key = `revenue-${row.currency}`
            const stat = statMap.get(key) || buildRevenue(row.currency)
            stat.prevRawValue = row.amount
            if (stat.value !== 0) {
              stat.variation = calculateVariation(stat.value, stat.prevRawValue)
            }
            statMap.set(key, stat as Stat)
          })

          updateStats(statMap)
        }
      )

      const [currentResponse] = await Promise.all([
        currentPromise,
        previousPromise
      ])

      // We save a list of currencies encountered in successful transactions of the current period
      currencyList.value = Object.keys(currentResponse.totalSuccessfulAmountByCurrency)

      // Final cleanup of empty local default currency
      if (currencyList.value.length > 0) {
        const keyForDefaultCurrency = `revenue-${defaultCurrency.value}`
        const local = statMap.get(keyForDefaultCurrency);
        if (local && local.value === 0) {
          statMap.delete(keyForDefaultCurrency)
        }
      }
      updateStats(statMap)

      // Plotting data for the chart (only successful trades)
      chart.value = buildChartData(currentResponse.rows, dates)

      // Last 5 closed deals
      sales.value = getLatestSales(currentResponse.rows, 5)
    } catch (error) {
      if (error instanceof SdkError) {
        $logger.error(`CRM processing error: ${error.message}`, { code: error.code })
      }

      throw error
    }
  }

  // ------------------------------------------------------------------------
  // Public methods
  // ------------------------------------------------------------------------
  /**
   * Opens the deal card in a slider.
   * @param row - must contain editPath
   */
  async function openDealHandler(row: Sale) {
    if (!isUseB24.value || !row.editPath) return
    return openDeal($b24, row.editPath)
  }

  // ------------------------------------------------------------------------
  // Computed properties for the template
  // ------------------------------------------------------------------------
  const isLoading = computed(() => loading.value)
  const statsData = computed(() => stats.value)
  const chartData = computed(() => chart.value)
  const salesData = computed(() => sales.value)
  const daysData = computed(() => eachDayOfInterval(range.value))
  const currencyListData = computed(() => {
    if (!isUseB24.value) {
      return [defaultCurrency.value]
    }
    return currencyList.value
  })

  const periodsData = computed<Period[]>(() => {
    if (daysData.value.length <= 8) {
      return [
        'daily'
      ]
    }

    if (daysData.value.length <= 31) {
      return [
        'daily',
        'weekly'
      ]
    }

    return [
      'weekly',
      'monthly'
    ]
  })

  // ------------------------------------------------------------------------
  // Reactivity: when the period or range changes, reload the data
  // ------------------------------------------------------------------------
  watch(
    [period, range],
    async () => {
      nextTick(async () => {
        await loadDeals()
      })
    },
    { immediate: true }
  )

  watch(periodsData, () => {
    if (!periodsData.value.includes(period.value)) {
      period.value = periodsData.value[0]
    }
  })

  // ------------------------------------------------------------------------
  // Return value
  // ------------------------------------------------------------------------
  return {
    // States
    range,
    period,
    isLoading,
    statsData,
    chartData,
    currencyListData,
    salesData,
    periodsData,

    // Formatters
    formatCurrency: formatCurrencyLocal,
    formatDateRange: formatDateRangeLocal,
    formatDateByPeriod: formatDateByPeriodLocal,
    formatDateTimeShort: formatDateTimeShortLocal,

    // Actions
    openDeal: openDealHandler,
    loadDeals,

    // Locales (in case they are needed in the template)
    localeCode,
    localeKey,
    defaultCurrency
  }
}

/**
 * Export a shared composable for use in multiple components.
 */
export const useDealStats = createSharedComposable(_useDealStats)
