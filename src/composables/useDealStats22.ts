import type { DataRecord, Period, Range, Stat, Sale } from '../types'
import type { B24Frame } from "@bitrix24/b24jssdk";
import * as locales from '@bitrix24/b24ui-nuxt/locale'
import { SdkError } from "@bitrix24/b24jssdk";
import { ref, shallowRef, computed, watch, nextTick } from 'vue'
import { createSharedComposable } from '@vueuse/core'
import { eachDayOfInterval, sub } from 'date-fns'
import { useB24 } from './useB24'
import ContactIcon from '@bitrix24/b24icons-vue/outline/ContactIcon'
import GraphsDiagramIcon from '@bitrix24/b24icons-vue/outline/GraphsDiagramIcon'
import WalletIcon from '@bitrix24/b24icons-vue/outline/WalletIcon'
import ShoppingCartIcon from '@bitrix24/b24icons-vue/outline/ShoppingCartIcon'
import {
  buildChartData,
  calculateVariation,
  getDatesByPeriod,
  getLatestSales
} from "./useDealStats/helpers.ts";
import { formatCurrency, formatDateRange, formatDateByPeriod, formatDateTimeShort } from "./useDealStats/formatters.ts";
import {generateMockChart, generateMockSales, generateMockStats} from "./useDealStats/mocks.ts";
import {fetchDealsInRange, openDeal, PartialStats} from "./useDealStats/api.ts";

/**
 * @todo save selected range in b24 user.options || localStorage
 * @todo save selected period in b24 user.options || localStorage
 * @todo save stats in b24 user.options || localStorage
 * @todo init locale from app b24 en-US or ru-RU
 */
const _useDealStats = () => {
  const range = shallowRef<Range>({
    start: sub(new Date(), { days: 7 }),
    end: new Date()
  })
  const period = ref<Period>('daily')
  const stats = ref<Stat[]>([])
  const _currencyList = ref<string[]>([])
  const chart = ref<DataRecord[]>([])
  const sales = ref<Sale[]>([])
  const loading = ref<boolean>(false)

  const b24Instance = useB24()
  const $logger = b24Instance.buildLogger('useDealStats')
  const $b24 = b24Instance.get() as B24Frame
  const isUseB24 = computed<boolean>(() => {
    return b24Instance.isInit()
  })
  const _localeCode = ref<null | string>(null)
  const _localeKey = ref<null | string>(null)

  // region formatters ////
  const localeCode = computed(() => {
    if(_localeCode.value !== null) {
      return _localeCode.value
    }

    if (isUseB24.value) {
      _localeCode.value = locales[$b24.getLang()]?.locale
    }
    if (
      !_localeCode.value
      && typeof window !== 'undefined'
      && window.navigator?.language.includes('ru')
    ) {
      _localeCode.value = 'ru-RU'
    }

    if (!_localeCode.value) {
      _localeCode.value = 'en-US'
    }

    $logger.debug('set locale code', { locale: _localeCode.value })
    return _localeCode.value
  })

  const localeKey = computed(() => {
    if(_localeKey.value !== null) {
      return _localeKey.value
    }

    if (isUseB24.value) {
      _localeKey.value = locales[$b24.getLang()]?.code
    }
    if (
      !_localeKey.value
      && typeof window !== 'undefined'
      && window.navigator?.language.includes('ru')
    ) {
      _localeKey.value = 'ru'
    }

    if (!_localeKey.value) {
      _localeKey.value = 'en'
    }

    $logger.debug('set locale key', { locale: _localeKey.value })
    return _localeKey.value
  })

  // @todo fix this
  const localeCurrency = computed(() => {
    if (typeof window !== 'undefined' && window.navigator?.language.includes('ru')) {
      return 'RUB'
    }

    return 'USD'
  })
  // endregion ////

  // region getDataFromB24 ////
  async function loadDeals() {
    try {
      loading.value = true

      if (!isUseB24.value) {
        stats.value = generateMockStats(localeCode.value, localeCurrency.value)
        chart.value = generateMockChart(period.value, range.value, localeCurrency.value)
        sales.value = generateMockSales(localeCurrency.value)

        return
      }

      await _processCrmItemList()
    } catch (error) {
      $logger.error('Some error', { error })
    } finally {
      loading.value = false
    }
  }

  const _updateUI = (statMap: Map<string, Stat>) => { stats.value = Array.from(statMap.values()) }

  async function _processCrmItemList(): Promise<void> {

    const dates = getDatesByPeriod(range.value, period.value)

    // @todo use -1Y or -1??
    const previousStart = sub(range.value.start, { years: 1 })
    const previousEnd = sub(range.value.end, { years: 1 })

    try {
      const statMap = new Map<string, Stat>([
        ['customers', { title: 'Clients', descriptions: 'The number of unique clients (Company or Contact) from closed deals across all pipelines during the reporting period.', icon: ContactIcon, value: 0, formatValue: '0', variation: null }],
        ['orders', { title: 'Total Deals', descriptions: 'The total number of deals across all pipelines during the reporting period.', icon: ShoppingCartIcon, value: 0, formatValue: '0', variation: null }],
        ['conversions', { title: 'Won Deals', descriptions: 'The number of successfully closed deals across all pipelines during the reporting period.', icon: GraphsDiagramIcon, value: 0, formatValue: '0', variation: null }]
      ])

      _updateUI(statMap)

      const promiseCurrentData = fetchDealsInRange(
        $b24,
        range.value.start,
        range.value.end,
        localeCurrency.value,
        (current: PartialStats) => {
          (['customers', 'conversions', 'orders']  as const).forEach(k => {
            const stat = statMap.get(k)!
            stat.value = current[k]
            stat.formatValue = String(current[k])
            if (typeof stat.prevRawValue !== 'undefined') {
              stat.variation = calculateVariation(stat.value, stat.prevRawValue)
            }
          })

          current.revenueValue.forEach((row) => {
            const key = `revenue-${row.currency}`
            const stat = statMap.get(key) || { title: 'Revenue', descriptions: `The total amount in ${row.currency} of won deals across all pipelines during the reporting period.`, icon: WalletIcon,  value: 0, formatValue: formatCurrency(0, row.currency, localeCode.value), variation: null }
            stat.value = row.amount
            stat.formatValue = formatCurrency(row.amount, row.currency, localeCode.value)
            if (typeof stat.prevRawValue !== 'undefined') {
              stat.variation = calculateVariation(stat.value, stat.prevRawValue)
            }
            statMap.set(key, stat as Stat)
          })

          _updateUI(statMap)
        }
      )

      const promisePreviousData = fetchDealsInRange(
        $b24,
        previousStart,
        previousEnd,
        localeCurrency.value,
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
            const stat = statMap.get(key) || { title: 'Revenue', descriptions: `The total amount in ${row.currency} of won deals across all pipelines during the reporting period.`, icon: WalletIcon,  value: 0, formatValue: formatCurrency(0, row.currency, localeCode.value), variation: null }
            stat.prevRawValue = row.amount
            if (stat.value !== 0) {
              stat.variation = calculateVariation(stat.value, stat.prevRawValue)
            }
            statMap.set(key, stat as Stat)
          })

          _updateUI(statMap)
        }
      )

      const [currentData] = await Promise.all([promiseCurrentData, promisePreviousData])

      _currencyList.value = Object.keys(currentData.totalSuccessfulAmountByCurrency)

      // Final cleanup of empty local currency
      if (_currencyList.value.length > 0) {
        const keyForLocaleCurrency = `revenue-${localeCurrency.value}`
        const local = statMap.get(keyForLocaleCurrency);
        if (local && local.value === 0) statMap.delete(keyForLocaleCurrency);
      }

      _updateUI(statMap)

      chart.value = buildChartData(currentData.rows, dates)
      sales.value = getLatestSales(currentData.rows, 5)
    } catch (error) {
      if (error instanceof SdkError) {
        $logger.error(`Processing error: ${error.message}`, { code: error.code, error })
      } else {
        $logger.error('Unknown error', { error })
      }
      throw error
    }
  }

  async function open(row: Sale) {
    if (!isUseB24.value || typeof row.editPath === 'undefined') {
      return
    }

    return openDeal($b24, row.editPath)
  }
  // endregion /////

  const statsData = computed(() => {
    return stats.value
  })

  const chartData = computed(() => {
    return chart.value
  })

  const salesData = computed(() => {
    return sales.value.slice(-5)
  })

  const currencyListData = computed(() => {
    if (!isUseB24.value) {
      return [localeCurrency.value]
    }

    return _currencyList.value
  })

  const isLoading = computed(() => {
    return loading.value
  })

  const daysData = computed(() => eachDayOfInterval(range.value))

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

  watch(
    [() => period.value, () => range.value],
    async () => {
      nextTick(async () => {
        await loadDeals()
      })
    },
    { immediate: true }
  )

  // Ensure the period value is always a valid period
  watch(periodsData, () => {
    if (!periodsData.value.includes(period.value)) {
      period.value = periodsData.value[0]
    }
  })

  return {
    localeCode,
    localeKey,
    localeCurrency,
    range,
    period,
    statsData,
    chartData,
    currencyListData,
    periodsData,
    salesData,
    isLoading,
    formatCurrency,
    formatDateRange,
    formatDateByPeriod,
    formatDateTimeShort,
    loadDeals,
    open
  }
}

export const useDealStats22 = createSharedComposable(_useDealStats)
