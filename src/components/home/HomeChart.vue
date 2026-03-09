<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip } from '@unovis/vue'
import { useElementSize } from '@vueuse/core'
import type { DataRecord } from '../../types'
import { useDealStats } from '../../composables/useDealStats.ts'

const cardRef = useTemplateRef<HTMLElement | null>('cardRef')

const { chartData, formatDateByPeriod, formatCurrency } = useDealStats()
const { width } = useElementSize(cardRef)

const x = (_: DataRecord, i: number) => i
const y = (d: DataRecord) => d.amount

const total = computed(() => chartData.value.reduce((acc: number, { amount }) => acc + amount, 0))

const xTicks = (i: number) => {
  if (i === 0 || i === chartData.value.length - 1 || !chartData.value[i]) {
    return ''
  }

  return formatDateByPeriod(chartData.value[i].date)
}

const template = (d: DataRecord) => `${formatDateByPeriod(d.date)}: ${formatCurrency(d.amount)}`
</script>

<template>
  <B24Card ref="cardRef" :b24ui="{ root: 'overflow-visible', body: '!px-0 !pt-0 !pb-3' }">
    <template #header>
      <div>
        <p class="text-xs text-(--b24ui-typography-label-color) uppercase mb-1.5">
          Revenue
        </p>
        <p class="text-3xl text-(--b24ui-typography-legend-color) font-semibold">
          {{ formatCurrency(total) }}
        </p>
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
        color="var(--ui-color-accent-main-primary-alt-2)"
      />
      <VisArea
        :x="x"
        :y="y"
        color="var(--ui-color-accent-main-primary-alt)"
        :opacity="0.1"
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
