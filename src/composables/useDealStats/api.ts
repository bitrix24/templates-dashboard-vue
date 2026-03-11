import type { B24Frame } from '@bitrix24/b24jssdk'
import type {Deal, Sale, SaleStatus, Semantic} from '../../types'
import { EnumCrmEntityTypeId, Text } from '@bitrix24/b24jssdk'

/**
 * Result of loading transactions for the specified period.
 */
export interface FetchDealsResult {
  /** Array of deals in Sale format */
  rows: Sale[]
  /** Amount of successful trades, grouped by currency */
  totalSuccessfulAmountByCurrency: Record<string, number>
  /** Set of unique client IDs (contacts/companies) */
  uniqueCustomers: Set<string>
  /** Number of successful transactions */
  successfulDeals: number
}

/**
 * Partial statistics returned in the callback during page loading.
 */
export interface PartialStats {
  customers: number
  conversions: number
  orders: number
  revenueValue: { amount: number, currency: string }[]
}

const mapStatus: Record<Semantic, SaleStatus> = {
  P: 'processing',
  S: 'success',
  F: 'failed'
}

/**
 * Downloads deals from the CRM for the specified time interval.
 * Supports paginated downloading via the generator.
 *
 * @param b24 - B24Frame instance for executing queries
 * @param start - Interval start (time is set to 00:00:00)
 * @param end - Interval end (time is set to 23:59:59)
 * @param defLocale - Default locale
 * @param cb - Optional callback called after processing each page of data
 * @returns Object with aggregated deal data
 *
 * @example
 * const result = await fetchDealsInRange(b24, new Date('2025-01-01'), new Date('2025-01-31'))
 * console.log(result.rows.length, result.totalSuccessfulAmountByCurrency)
 */
export async function fetchDealsInRange(
  b24: B24Frame,
  start: Date,
  end: Date,
  defLocale: string,
  cb?: (partial: PartialStats) => void
): Promise<FetchDealsResult> {
  // We bring dates to the beginning and end of the day
  const from = new Date(start)
  from.setHours(0, 0, 0, 0)

  const to = new Date(end)
  to.setHours(23, 59, 59, 999)

  const totalSuccessfulAmountByCurrency: Record<string, number> = {}
  let successfulDeals = 0
  const uniqueCustomers = new Set<string>()
  const rows: Sale[] = []

  const requestId = `dashboard-loadDeals_${Text.toB24Format(from)}_${Text.toB24Format(to)}`

  const generator = b24.actions.v2.fetchList.make<Deal>({
    method: 'crm.item.list',
    params: {
      entityTypeId: EnumCrmEntityTypeId.deal,
      filter: {
        '>=closedate': Text.toB24Format(from),
        '<=closedate': Text.toB24Format(to),
        '=closed': true,
      },
      select: [
        'id',
        'title',
        'begindate',
        'closedate',
        'stageId',
        'stageSemanticId',
        'opportunity',
        'currencyId',
        'contactId',
        'companyId',
      ],
    },
    idKey: 'id',
    customKeyForResult: 'items',
    requestId,
  })

  try {
    for await (const chunk of generator) {
      chunk.forEach((row) => {
        // Unique clients
        if (row.contactId > 0) {
          uniqueCustomers.add(`contact_${row.contactId}`)
        } else if (row.companyId > 0) {
          uniqueCustomers.add(`company_${row.companyId}`)
        } else {
          uniqueCustomers.add('empty')
        }

        // Successful transactions (semantics S)
        if (row.stageSemanticId === 'S') {
          successfulDeals++
          const currency = row.currencyId || defLocale
          totalSuccessfulAmountByCurrency[currency] =
            (totalSuccessfulAmountByCurrency[currency] || 0) + row.opportunity
        }

        // Преобразование в формат Sale
        rows.push({
          id: row.id,
          begindate: Text.toDateTime(row.begindate).toJSDate().toISOString(),
          closedate:
            row.stageSemanticId === 'P'
              ? null
              : Text.toDateTime(row.closedate).toJSDate().toISOString(),
          stageSemanticId: row.stageSemanticId,
          status: mapStatus[row.stageSemanticId] ?? 'processing',
          title: row.title,
          amount: row.opportunity,
          currencyId: row.currencyId,
          editPath: b24.slider.getUrl(`/crm/deal/details/${row.id}/`).toString(),
        })
      })

      // Call the callback with the current aggregated values
      if (cb) {
        const revenueEntries = Object.entries(totalSuccessfulAmountByCurrency)
        const revenueValue: { amount: number, currency: string }[] = revenueEntries.length
          ? revenueEntries.map(([currency, amount]) => ({ amount, currency }))
          : [{ amount: 0, currency: defLocale }]

        cb({
          customers: uniqueCustomers.size,
          conversions: successfulDeals,
          orders: rows.length,
          revenueValue
        } as PartialStats)
      }
    }

    return {
      rows,
      totalSuccessfulAmountByCurrency,
      uniqueCustomers,
      successfulDeals,
    }
  } catch (error) {
    throw error
  }
}

/**
 * Opens a deal card in the Bitrix24 slider.
 *
 * @param b24 - B24Frame instance
 * @param editPath - Path to the deal card (e.g., "/crm/deal/details/123/")
 * @returns A promise that resolves after the slider is closed.
 */
export function openDeal(b24: B24Frame, editPath: string) {
  return b24.slider.openPath(b24.slider.getUrl(editPath))
}
