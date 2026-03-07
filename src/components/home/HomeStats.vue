<script setup lang="ts">
import { ref, watch } from 'vue'
import { randomInt } from '../../utils'
import type { Period, Range, Stat } from '../../types'
import ShoppingCartIcon from '@bitrix24/b24icons-vue/outline/ShoppingCartIcon'
import WalletIcon from '@bitrix24/b24icons-vue/outline/WalletIcon'
import GraphsDiagramIcon from '@bitrix24/b24icons-vue/outline/GraphsDiagramIcon'
import ContactIcon from '@bitrix24/b24icons-vue/outline/ContactIcon'
import TrendUpIcon from '@bitrix24/b24icons-vue/outline/TrendUpIcon'
import TrendDownIcon from '@bitrix24/b24icons-vue/outline/TrendDownIcon'

const props = defineProps<{
  period: Period
  range: Range
}>()

// @todo init locale from app b24 en-US or ru-RU
// @todo init base currency from app USD RUB BYN
function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  })
}

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

const stats = ref<Stat[]>([])

watch([() => props.period, () => props.range], () => {
  stats.value = baseStats.map((stat) => {
    const value = randomInt(stat.minValue, stat.maxValue)
    const variation = randomInt(stat.minVariation, stat.maxVariation)

    return {
      title: stat.title,
      icon: stat.icon,
      value: stat.formatter ? stat.formatter(value) : value,
      variation
    }
  })
}, { immediate: true })
</script>

<template>
  <B24PageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-0">
    <B24PageCard
      v-for="(stat, index) in stats"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      to="/customers"
      variant="tinted-alt"
      :b24ui="{
        root: 'bg-(--ui-color-bg-content-primary) light:bg-(--ui-color-gray-01) backdrop-blur-md',
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25',
        title: 'text-description font-normal text-xs uppercase'
      }"
      class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1 lg:border-r lg:last:border-r-0 lg:border-(--ui-color-divider-default)"
    >
      <div class="flex items-center gap-2">
        <!-- @todo: fix text-[length:24px] -->
        <span class="text-[length:24px] font-semibold text-label">
          {{ stat.value }}
        </span>

        <B24Badge
          :icon="stat.variation > 0 ? TrendUpIcon : TrendDownIcon"
          size="md"
          :color="stat.variation > 0 ? 'air-primary-success' : 'air-primary-alert'"
        >
          {{ stat.variation > 0 ? '+' : '' }}{{ stat.variation }}%
        </B24Badge>
      </div>
    </B24PageCard>
  </B24PageGrid>
</template>
