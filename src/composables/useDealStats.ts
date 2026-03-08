import type { DataRecord, Period, Range, Stat, Sale, Deal } from '../types'
import type { B24Frame } from "@bitrix24/b24jssdk";
import type { SaleStatus, Semantic } from '../types'
import { EnumCrmEntityTypeId, Text, SdkError } from "@bitrix24/b24jssdk";
import { ref, shallowRef, computed } from 'vue'
import { createSharedComposable } from '@vueuse/core'
import { DateFormatter } from '@internationalized/date'
import { eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, sub, format } from 'date-fns'
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
 * @todo init base currency from app USD RUB BYN
 * @todo init locale from app b24 en-US or ru-RU
 */
const _useDealStats = () => {
  const range = shallowRef<Range>({
    start: sub(new Date(), { days: 14 }),
    end: new Date()
  })
  const period = ref<Period>('daily')
  const stats = ref<Stat[]>([])
  const chart = ref<DataRecord[]>([])
  const sales = ref<Sale[]>([])
  const loading = ref<boolean>(false)

  const b24Instance = useB24()
  const $b24 = b24Instance.get() as B24Frame
  const isUseB24 = computed<boolean>(() => {
    return b24Instance.isInit()
  })
  const $logger = b24Instance.buildLogger('useDealStats')

  // region formatters ////
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    })
  }

  const formatDate = new DateFormatter('en-US', {
    dateStyle: 'medium'
  })

  const formatDateByPeriod = (date: Date): string => {
    return ({
      daily: format(date, 'd MMM'),
      weekly: format(date, 'd MMM'),
      monthly: format(date, 'MMM yyy')
    })[period.value]
  }

  const formatDateShort = (date: Date): string => {
    return date.toLocaleString('en-US', {
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

    return baseStats.map((stat) => {
      const value = randomInt(stat.minValue, stat.maxValue)
      const variation = randomInt(stat.minVariation, stat.maxVariation)

      return {
        title: stat.title,
        icon: stat.icon,
        value: stat.formatter ? stat.formatter(value) : value,
        variation
      }
    })
  }

  function updateChartMock() {
    const dates = ({
      daily: eachDayOfInterval,
      weekly: eachWeekOfInterval,
      monthly: eachMonthOfInterval
    } as Record<Period, typeof eachDayOfInterval>)[period.value](range.value)

    const min = 1000
    const max = 10000

    return dates.map(date => ({ date, amount: Math.floor(Math.random() * (max - min + 1)) + min }))
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
        isCanOpen: false
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

      await processCrmItemList()
    } catch (error) {
      $logger.error('Some error', {
        error
      })
    } finally {
      loading.value = false
    }
  }

  async function processCrmItemList(): Promise<void> {
    let batchNumber = 0
    let totalItems = 0

    const from = new Date(range.value.start)
    from.setHours(0, 0, 0)

    const to = new Date(range.value.end)
    to.setHours(23, 59, 59)

    const requestId = 'bitrix24-ui-template-dashboard-vue-loadDeals'

    const mapStatus: Record<Semantic, SaleStatus> = {
      P: 'processing',
      S: 'success',
      F: 'failed'
    }

    const dates = ({
      daily: eachDayOfInterval,
      weekly: eachWeekOfInterval,
      monthly: eachMonthOfInterval
    } as Record<Period, typeof eachDayOfInterval>)[period.value](range.value)

    let totalAmount = 0.0
    let successfulDeals = 0
    const uniqueCustomers = new Set()

    const rows: Sale[] = []
    try {
      const generator = $b24.actions.v2.fetchList.make<Deal>({
        method: 'crm.item.list',
        params: {
          entityTypeId: EnumCrmEntityTypeId.deal,
          filter: {
            '>=closedate': Text.toB24Format(from),
            '<=closedate': Text.toB24Format(to),
            '=closed': true
          },
          select: ['id', 'title', 'begindate', 'closedate', 'stageId', 'stageSemanticId', 'opportunity', 'title', 'contactId', 'companyId']
        },
        idKey: 'id',
        customKeyForResult: 'items',
        requestId
      })

      for await (const chunk of generator) {
        batchNumber++
        totalItems += chunk.length

        chunk.forEach((row) => {

          uniqueCustomers.add(
            row.contactId > 0 ? `contact_${row.contactId}` : (
              row.companyId > 0 ? `contact_${row.contactId}` : 'empty'
            )
          )

          if (row.stageSemanticId === 'S') {
            successfulDeals = successfulDeals + 1
            totalAmount = totalAmount + row.opportunity
          }

          rows.push({
            id: row.id,
            begindate: Text.toDateTime(row.begindate).toJSDate().toISOString(),
            closedate: row.stageSemanticId === 'P' ? null : Text.toDateTime(row.closedate).toJSDate().toISOString(),
            stageSemanticId: row.stageSemanticId,
            status: mapStatus[row.stageSemanticId] ?? 'P' as const,
            title: row.title,
            amount: row.opportunity,
            isCanOpen: true
          })
        })

        stats.value = [
          {
            title: 'Customers',
            icon: ContactIcon,
            value: uniqueCustomers.size,
            variation: 0.0
          },
          {
            title: 'Conversions',
            icon: GraphsDiagramIcon,
            value: successfulDeals,
            variation: 0.0
          },
          {
            title: 'Revenue',
            icon: WalletIcon,
            formatter: formatCurrency,
            value: formatCurrency(totalAmount),
            variation: 0.0
          },
          {
            title: 'Orders',
            icon: ShoppingCartIcon,
            value: rows.length,
            variation: 0.0
          }
        ]
      }

      const timestamps = dates.map(d => d.getTime())
      const groups = timestamps.reduce((acc, ts) => {
        acc[ts] = []
        return acc
      }, {} as Record<number, Sale[]>);

      rows.forEach(row => {
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



      $logger.debug('stats', { stats: stats.value })

      chart.value = Object.entries(groups).map(([timestamp, dealsInRange]) => {
        return {
          date: new Date(Number(timestamp)),
          amount: dealsInRange.reduce((sum, row) => sum + (row.amount || 0.0), 0.0)
        }
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())

      sales.value = rows.sort((a, b) => new Date(b.closedate!).getTime() - new Date(a.closedate!).getTime()).slice(-5)
    } catch (error) {
      if (error instanceof SdkError) {
        $logger.error(`Processing error: ${error.message}`, {
          code: error.code,
          batchNumber,
          totalItems
        })
      } else {
        $logger.error('Unknown error', { error, batchNumber, totalItems })
      }
      throw error
    }
  }

  async function openDeal(row: Sale) {
    if (!isUseB24.value) {
      return
    }

    return $b24.slider.openPath(
      $b24.slider.getUrl(`/crm/deal/details/${row.id}/`)
    )
  }

  function getDealUrl(row: Sale) {
    if (!isUseB24.value) {
      return '#b24-not-init'
    }

    return $b24.slider.getUrl(`/crm/deal/details/${row.id}/`).toString()
  }
  // endregion /////

  // watch(
  //   [() => period.value, () => range.value],
  //   async () => {
  //     if (!isUseB24.value) {
  //       stats.value = updateStateMock()
  //       chart.value = updateChartMock()
  //       sales.value = updateSalesMock()
  //
  //       return
  //     }
  //
  //     await loadDeals()
  //   },
  //   { immediate: true }
  // )

  const statsData = computed(() => {
    return stats.value
  })

  const chartData = computed(() => {
    return chart.value
  })

  const salesData = computed(() => {
    return sales.value.slice(-5)
  })

  const isLoading = computed(() => {
    return loading.value
  })

  return {
    loadDeals,
    range,
    period,
    statsData,
    chartData,
    salesData,
    isLoading,
    formatCurrency,
    formatDate,
    formatDateByPeriod,
    formatDateShort,
    openDeal,
    getDealUrl,
  }
}

export const useDealStats = createSharedComposable(_useDealStats)
