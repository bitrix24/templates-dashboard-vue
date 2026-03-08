<script setup lang="ts">
import { useDealStats } from '../../composables/useDealStats'
import TrendUpIcon from '@bitrix24/b24icons-vue/outline/TrendUpIcon'
import TrendDownIcon from '@bitrix24/b24icons-vue/outline/TrendDownIcon'

const { statsData } = useDealStats()
</script>

<template>
  <B24PageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-0">
    <B24PageCard
      v-for="(stat, index) in statsData"
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
