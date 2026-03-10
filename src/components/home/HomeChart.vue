<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { VisXYContainer, VisLine, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue'
import { useElementSize } from '@vueuse/core'
import type { DataRecord } from '../../types'
import { useDealStats } from '../../composables/useDealStats.ts'

const cardRef = useTemplateRef<HTMLElement | null>('cardRef')

const { currencyListData, chartData, formatDateByPeriod, formatCurrency } = useDealStats()
const { width } = useElementSize(cardRef)

const x = (_: DataRecord, i: number) => i
const y = currencyListData.value.map((currency) => {
  return (d: DataRecord) => d.amount[currency] ?? 0.0
})

const template = (d: DataRecord) => {
  const dateStr = formatDateByPeriod(d.date)
  const lines = Object.entries(d.amount)
    .map(([currencyId, value]) => `<li> + ${formatCurrency(value, currencyId)}</li>`)
    .join('\n')

  return `<strong>${dateStr}</strong> <ul>${lines}</ul>`
}

function getTotal(currency: string) {
  return chartData.value.reduce((acc: number, { amount }) => acc + (amount[currency] ?? 0.0), 0)
}

const xTicks = (i: number) => {
  if (i === 0 || i === chartData.value.length - 1 || !chartData.value[i]) {
    return ''
  }

  return formatDateByPeriod(chartData.value[i].date)
}
</script>

<template>
  <B24Card ref="cardRef" :b24ui="{ root: 'overflow-visible', body: '!px-0 !pt-0 !pb-3' }">
    <template #header>
      <div>
        <p class="text-xs text-(--b24ui-typography-label-color) uppercase mb-1.5">
          Revenue
        </p>
        <div class="flex items-center flex-wrap gap-2 sm:gap-5">
          <span
            v-for="(currency) in currencyListData"
            :key="currency"
            class="w-full sm:w-auto text-xl text-(--b24ui-typography-legend-color) font-semibold sm:ps-5 sm:border-(--ui-color-divider-default) sm:border-l-2 sm:first:border-l-0 sm:first:ps-0"
          >
            {{ formatCurrency(getTotal(currency), currency) }}
          </span>
        </div>
      </div>
    </template>

    <VisXYContainer
      :data="chartData"
      :padding="{ top: 40 }"
      class="h-96"
      :width="width"
    >
      <VisLine
        :x="x"
        :y="y"
      />

      <VisAxis
        type="x"
        :x="x"
        :tick-format="xTicks"
      />

      <VisCrosshair
        color="var(--ui-color-accent-soft-element-blue)"
        :template="template"
      />

      <VisTooltip />
    </VisXYContainer>
  </B24Card>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: var(--ui-color-accent-main-primary-alt-2);
  --vis-crosshair-circle-stroke-color: var(--ui-color-accent-soft-element-blue);

  --vis-axis-grid-color: var(--ui-color-divider-default);
  --vis-axis-tick-color: var(--ui-color-divider-default);
  --vis-axis-tick-label-color: var(--b24ui-typography-label-color);

  --vis-tooltip-background-color: var(--ui-color-design-tinted-na-bg);
  --vis-tooltip-border-color: var(--ui-color-divider-default);
  --vis-tooltip-text-color: var(--b24ui-typography-label-color);
}
</style>
