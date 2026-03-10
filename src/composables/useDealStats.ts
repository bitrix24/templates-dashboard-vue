import type { DataRecord, Period, Range, Stat, Sale, Deal } from '../types'
import type { B24Frame } from "@bitrix24/b24jssdk";
import type { SaleStatus, Semantic } from '../types'
import * as locales from '@bitrix24/b24ui-nuxt/locale'
import { EnumCrmEntityTypeId, Text, SdkError } from "@bitrix24/b24jssdk";
import { ref, shallowRef, computed, watch } from 'vue'
import { createSharedComposable } from '@vueuse/core'
import { eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, sub } from 'date-fns'
import {randomFrom, randomInt} from '../utils'
import { useB24 } from './useB24'
import ContactIcon from '@bitrix24/b24icons-vue/outline/ContactIcon'
import GraphsDiagramIcon from '@bitrix24/b24icons-vue/outline/GraphsDiagramIcon'
import WalletIcon from '@bitrix24/b24icons-vue/outline/WalletIcon'
import ShoppingCartIcon from '@bitrix24/b24icons-vue/outline/ShoppingCartIcon'

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

  const mapStatus: Record<Semantic, SaleStatus> = {
    P: 'processing',
    S: 'success',
    F: 'failed'
  }

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

  const formatCurrency = (value: number, currencyId?: string): string => {
    return value.toLocaleString(localeCode.value, {
      style: 'currency',
      currency: currencyId ?? localeCurrency.value,
      maximumFractionDigits: 0
    })
  }

  const formatDateByPeriod = (date: Date): string => {
    return ({
      daily: date.toLocaleString(localeCode.value, {
        day: 'numeric',
        month: 'short',
      }),
      weekly: date.toLocaleString(localeCode.value, {
        day: 'numeric',
        month: 'short',
      }),
      monthly: date.toLocaleString(localeCode.value, {
        year: 'numeric',
        month: 'short',
      })
    })[period.value]
  }

  const formatDateRange = (date: Date): string => {
    return date.toLocaleString(localeCode.value, {
      dateStyle: 'short',
      hour12: false
    })
  }

  const formatDateTimeShort = (date: Date): string => {
    return date.toLocaleString(localeCode.value, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }
  // endregion ////

  // region Mock ////
  function updateStateMock() {
    const baseStats = [
      {
        title: 'Customers',
        icon: ContactIcon,
        minValue: 400,
        maxValue: 1000,
        minVariation: -15,
        maxVariation: 25
      },
      {
        title: 'Conversions',
        icon: GraphsDiagramIcon,
        minValue: 1000,
        maxValue: 2000,
        minVariation: -10,
        maxVariation: 20
      },
      {
        title: 'Revenue',
        icon: WalletIcon,
        minValue: 200000,
        maxValue: 500000,
        minVariation: -20,
        maxVariation: 30,
        formatter: formatCurrency
      },
      {
        title: 'Orders',
        icon: ShoppingCartIcon,
        minValue: 100,
        maxValue: 300,
        minVariation: -5,
        maxVariation: 15
      }
    ]

    return baseStats.map((stat, index) => {
      const value = randomInt(stat.minValue, stat.maxValue)
      const variation = randomInt(stat.minVariation, stat.maxVariation)

      return {
        title: stat.title,
        icon: stat.icon,
        value: stat.formatter ? stat.formatter(value, 'USD') : value,
        variation: index === 0 ? null : variation
      }
    })
  }

  function updateChartMock() {
    const dates = ({
      daily: eachDayOfInterval,
      weekly: eachWeekOfInterval,
      monthly: eachMonthOfInterval
    } as Record<Period, typeof eachDayOfInterval>)[period.value](range.value)

    const min = 1_000
    const max = 10_000

    return dates.map(date => ({ date, amount: {
      [localeCurrency.value]: Math.floor(Math.random() * (max - min + 1)) + min }
    }))
  }

  function updateSalesMock() {
    const sales: Sale[] = []
    const currentDate = new Date()

    const sampleEmails = [
      'Hoodie Pants Deal',
      'Hoodie Vest Deal',
      'Vest Pants Deal',
      'T-shirt Vest Deal',
      'Belt Pants Deal'
    ]

    for (let i = 0; i < 5; i++) {
      const hoursAgo = randomInt(2, 48)
      const date = new Date(currentDate.getTime() - hoursAgo * 3600000)
      const dateClose = new Date(currentDate.getTime() - (hoursAgo - 1) * 3600000)
      const stageSemanticId = randomFrom<Semantic>(['P', 'S', 'F'])

      sales.push({
        id: (4600 - i),
        begindate: date.toISOString(),
        closedate: stageSemanticId === 'P' ? null : dateClose.toISOString(),
        stageSemanticId: stageSemanticId,
        status: randomFrom(['success', 'failed', 'processing']),
        title: randomFrom(sampleEmails),
        amount: randomInt(100, 1000),
        currencyId: 'USD'
      })
    }

    return sales.sort((a, b) => new Date(b.begindate).getTime() - new Date(a.begindate).getTime())
  }
  // endregion /////

  // region getDataFromB24 ////
  async function loadDeals() {
    try {
      loading.value = true

      if (!isUseB24.value) {
        stats.value = updateStateMock()
        chart.value = updateChartMock()
        sales.value = updateSalesMock()

        return
      }

      await _processCrmItemList()
    } catch (error) {
      $logger.error('Some error', { error })
    } finally {
      loading.value = false
    }
  }

  async function fetchDealsInRange(
    start: Date,
    end: Date,
    cb?: (options: {
      customers: number,
      conversions: number,
      orders: number,
      revenueValue: string[]
    }) => void
  ): Promise<{
    rows: Sale[],
    totalSuccessfulAmountByCurrency: Record<string, number>,
    uniqueCustomers: Set<string>,
    successfulDeals: number
  }> {
    const from = new Date(start)
    from.setHours(0, 0, 0)
    const to = new Date(end)
    to.setHours(23, 59, 59)

    const totalSuccessfulAmountByCurrency: Record<string, number> = {}
    let successfulDeals = 0
    const uniqueCustomers = new Set<string>()
    const rows: Sale[] = []

    try {
      const requestId = `dashboard-loadDeals_${Text.toB24Format(from)}_${Text.toB24Format(to)}`

      const generator = $b24.actions.v2.fetchList.make<Deal>({
        method: 'crm.item.list',
        params: {
          entityTypeId: EnumCrmEntityTypeId.deal,
          filter: {
            '>=closedate': Text.toB24Format(from),
            '<=closedate': Text.toB24Format(to),
            '=closed': true
          },
          select: [
            'id', 'title', 'begindate', 'closedate',
            'stageId', 'stageSemanticId', 'opportunity', 'currencyId',
            'contactId', 'companyId'
          ]
        },
        idKey: 'id',
        customKeyForResult: 'items',
        requestId
      })

      for await (const chunk of generator) {
        chunk.forEach((row) => {
          uniqueCustomers.add(
            row.contactId > 0 ? `contact_${row.contactId}` : (
              row.companyId > 0 ? `company_${row.companyId}` : 'empty'
            )
          )

          if (row.stageSemanticId === 'S') {
            successfulDeals++
            const currency = row.currencyId || localeCurrency.value
            totalSuccessfulAmountByCurrency[currency] = (totalSuccessfulAmountByCurrency[currency] || 0) + row.opportunity
          }

          rows.push({
            id: row.id,
            begindate: Text.toDateTime(row.begindate).toJSDate().toISOString(),
            closedate: row.stageSemanticId === 'P' ? null : Text.toDateTime(row.closedate).toJSDate().toISOString(),
            stageSemanticId: row.stageSemanticId,
            status: mapStatus[row.stageSemanticId] ?? 'P' as const,
            title: row.title,
            amount: row.opportunity,
            currencyId: row.currencyId,
            editPath: $b24.slider.getUrl(`/crm/deal/details/${row.id}/`).toString()
          })
        })

        if(cb) {
          const revenueEntries = Object.entries(totalSuccessfulAmountByCurrency)
          const revenueValue: string[] = revenueEntries.length
            ? revenueEntries.map(([currency, amount]) => formatCurrency(amount, currency))
            : [formatCurrency(0, localeCurrency.value)]

          cb({
            customers: uniqueCustomers.size,
            conversions: successfulDeals,
            orders: rows.length,
            revenueValue: revenueValue
          })
        }
      }

      return { rows, totalSuccessfulAmountByCurrency, uniqueCustomers, successfulDeals }
    } catch (error) {
      $logger.error('Error fetching deals in range', { start, end, error })
      throw error
    }
  }


  async function _processCrmItemList(): Promise<void> {
    const dates = ({
      daily: eachDayOfInterval,
      weekly: eachWeekOfInterval,
      monthly: eachMonthOfInterval
    } as Record<Period, typeof eachDayOfInterval>)[period.value](range.value)
    const previousStart = sub(range.value.start, { years: 1 })
    const previousEnd = sub(range.value.end, { years: 1 })

    try {
      stats.value = [
        {
          title: 'Customers',
          icon: ContactIcon,
          value: 0,
          variation: null
        },
        {
          title: 'Conversions',
          icon: GraphsDiagramIcon,
          value: 0,
          variation: null
        },
        {
          title: 'Orders',
          icon: ShoppingCartIcon,
          value: 0,
          variation: null
        },
        ...[formatCurrency(0, localeCurrency.value)].map((row) => {
          return {
            title: 'Revenue',
            icon: WalletIcon,
            value: row,
            variation: null
          }
        })
      ]

      const promiseCurrentData = fetchDealsInRange(
        range.value.start,
        range.value.end,
        (options: {
          customers: number,
          conversions: number,
          orders: number,
          revenueValue: string[]
        }) => {
          stats.value = [
            {
              title: 'Customers',
              icon: ContactIcon,
              value: options.customers,
              variation: null
            },
            {
              title: 'Conversions',
              icon: GraphsDiagramIcon,
              value: options.conversions,
              variation: null
            },
            {
              title: 'Orders',
              icon: ShoppingCartIcon,
              value: options.orders,
              variation: null
            },
            ...options.revenueValue.map((row) => {
              return {
                title: 'Revenue',
                icon: WalletIcon,
                value: row,
                variation: null
              }
            })
          ]
        }
      )

      const promisePreviousData = fetchDealsInRange(
        previousStart,
        previousEnd
      )

      const [currentData, previousData] = await Promise.all([promiseCurrentData, promisePreviousData])

      // const calcVariation = (current: number, previous: number): number | null => {
      //   if (previous === 0) return null
      //   return Math.round(((current - previous) / previous) * 100)
      // }

      $logger.debug('_previousData', { previousData })

      _currencyList.value = Object.keys(currentData.totalSuccessfulAmountByCurrency)

      const timestamps = dates.map(d => d.getTime())
      const groups = timestamps.reduce((acc, ts) => {
        acc[ts] = []
        return acc
      }, {} as Record<number, Sale[]>);

      currentData.rows.filter(row => row.stageSemanticId === 'S')
      .forEach(row => {
        const closeTs = new Date(row.closedate!).getTime()

        let left = 0
        let right = timestamps.length - 1
        let foundTs = null

        while (left <= right) {
          const mid = Math.floor((left + right) / 2)
          if (timestamps[mid] <= closeTs) {
            foundTs = timestamps[mid]
            left = mid + 1
          } else {
            right = mid - 1
          }
        }

        if (foundTs !== null) {
          groups[foundTs].push(row)
        }
      })

      chart.value = Object.entries(groups).map(([timestamp, dealsInRange]) => {
        return {
          date: new Date(Number(timestamp)),
          amount: dealsInRange.reduce((acc, row) => {
            const currency = row.currencyId
            const value = row.amount || 0

            acc[currency] = (acc[currency] || 0) + value

            return acc
          }, {} as Record<string, number>)
        }
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())

      sales.value = currentData.rows.sort((a, b) => new Date(b.closedate!).getTime() - new Date(a.closedate!).getTime()).slice(-5)
    } catch (error) {
      if (error instanceof SdkError) {
        $logger.error(`Processing error: ${error.message}`, { code: error.code, error })
      } else {
        $logger.error('Unknown error', { error })
      }
      throw error
    }
  }

  async function openDeal(row: Sale) {
    if (!isUseB24.value) {
      return
    }

    return $b24.slider.openPath(
      $b24.slider.getUrl(row.editPath)
    )
  }
  // endregion /////

  watch(
    [() => period.value, () => range.value],
    async () => {
      if (!isUseB24.value) {
        stats.value = updateStateMock()
        chart.value = updateChartMock()
        sales.value = updateSalesMock()

        return
      }

      await loadDeals()
    },
    { immediate: true }
  )

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

  return {
    localeCode,
    localeKey,
    localeCurrency,
    range,
    period,
    statsData,
    chartData,
    currencyListData,
    salesData,
    isLoading,
    formatCurrency,
    formatDateRange,
    formatDateByPeriod,
    formatDateTimeShort,
    openDeal
  }
}

export const useDealStats = createSharedComposable(_useDealStats)
