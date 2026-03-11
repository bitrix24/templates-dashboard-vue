<script setup lang="ts">
import { useDealStats } from '../../composables/useDealStats'
import TrendUpIcon from '@bitrix24/b24icons-vue/outline/TrendUpIcon'
import TrendDownIcon from '@bitrix24/b24icons-vue/outline/TrendDownIcon'
import HelpIcon from '@bitrix24/b24icons-vue/main/HelpIcon'

const { statsData } = useDealStats()
</script>

<template>
  <B24PageGrid class="lg:grid-cols-4 gap-4 sm:gap-6">
    <B24PageCard
      v-for="(stat, index) in statsData"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      :to="stat.title === 'Clients' ? '/customers' : undefined"
      variant="tinted-alt"
      :b24ui="{
        root: 'bg-(--ui-color-bg-content-primary) light:bg-(--ui-color-gray-03) backdrop-blur-md',
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25',
        title: 'text-description font-normal text-xs uppercase'
      }"
    >
      <B24Tooltip
        v-if="stat.descriptions"
        :delay-duration="100"
        :content="{ side: 'right' }"
        :text="stat.descriptions"
      >
        <HelpIcon class="hidden lg:flex absolute z-1 right-4 top-4 size-5 cursor-help text-description" />
      </B24Tooltip>
      <div class="flex items-center gap-2">
        <!-- @todo: fix text-[length:24px] -->
        <span class="text-[length:24px] font-semibold text-label">
          {{ stat.formatValue }}
        </span>

        <B24Badge
          v-if="stat.variation !== null"
          :icon="stat.variation > 0 ? TrendUpIcon : ( stat.variation === 0 ? undefined : TrendDownIcon)"
          size="md"
          :color="stat.variation > 0 ? 'air-primary-success' : ( stat.variation === 0 ? 'air-tertiary' : 'air-primary-alert')"
        >
          {{ stat.variation > 0 ? '+' : '' }}{{ stat.variation }}%
        </B24Badge>
      </div>
    </B24PageCard>
  </B24PageGrid>
</template>
