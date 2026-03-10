<script setup lang="ts">
import type { Range } from '../../types'
import { computed } from 'vue'
import { useDealStats } from '../../composables/useDealStats'
import { getLocalTimeZone, CalendarDate, today } from '@internationalized/date'
import CalendarIcon from '@bitrix24/b24icons-vue/outline/CalendarIcon'
import ChevronDownLIcon from '@bitrix24/b24icons-vue/outline/ChevronDownLIcon'

const { formatDateRange, isLoading } = useDealStats()

const selected = defineModel<Range>({ required: true })

const ranges = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 3 months', months: 3 },
  { label: 'Last 6 months', months: 6 },
  { label: 'Last year', years: 1 }
]

const toCalendarDate = (date: Date) => {
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  )
}

const calendarRange = computed({
  get: () => ({
    start: selected.value.start ? toCalendarDate(selected.value.start) : undefined,
    end: selected.value.end ? toCalendarDate(selected.value.end) : undefined
  }),
  set: (newValue: { start: CalendarDate | undefined, end: CalendarDate | undefined }) => {
    selected.value = {
      start: newValue.start ? newValue.start.toDate(getLocalTimeZone()) : new Date(),
      end: newValue.end ? newValue.end.toDate(getLocalTimeZone()) : new Date()
    }
  }
})

const currentDate = today(getLocalTimeZone())
let startDate = currentDate.copy()

const isRangeSelected = (range: { days?: number, months?: number, years?: number }) => {
  if (!selected.value.start || !selected.value.end) return false

  if (range.days) {
    startDate = startDate.subtract({ days: range.days })
  } else if (range.months) {
    startDate = startDate.subtract({ months: range.months })
  } else if (range.years) {
    startDate = startDate.subtract({ years: range.years })
  }

  const selectedStart = toCalendarDate(selected.value.start)
  const selectedEnd = toCalendarDate(selected.value.end)

  return selectedStart.compare(startDate) === 0 && selectedEnd.compare(currentDate) === 0
}

const selectRange = (range: { days?: number, months?: number, years?: number }) => {
  const endDate = today(getLocalTimeZone())
  let startDate = endDate.copy()

  if (range.days) {
    startDate = startDate.subtract({ days: range.days })
  } else if (range.months) {
    startDate = startDate.subtract({ months: range.months })
  } else if (range.years) {
    startDate = startDate.subtract({ years: range.years })
  }

  selected.value = {
    start: startDate.toDate(getLocalTimeZone()),
    end: endDate.toDate(getLocalTimeZone())
  }
}
</script>

<template>
  <B24Popover :content="{ align: 'start' }" :modal="true">
    <B24Button
      :icon="CalendarIcon"
      color="air-secondary-accent-1"
      size="sm"
      class="group data-[state=open]:bg-(--ui-btn-background-hover)"
      :b24ui="{ label: 'flex-1' }"
      :disabled="isLoading"
      use-dropdown
    >
      <span class="flex-1 text-start truncate">
        <template v-if="selected.start">
          <template v-if="selected.end">
            {{ formatDateRange(selected.start) }} - {{ formatDateRange(selected.end) }}
          </template>
          <template v-else>
            {{ formatDateRange(selected.start) }}
          </template>
        </template>
        <template v-else>
          Pick a date
        </template>
      </span>
      <template #trailing>
        <ChevronDownLIcon class="size-5 shrink-0 text-description group-data-[state=open]:rotate-180 transition-transform duration-200" />
      </template>
    </B24Button>

    <template #content>
      <div class="flex items-stretch sm:divide-x divide-(--ui-color-divider-default)">
        <div class="hidden sm:flex flex-col justify-center">
          <B24Button
            v-for="(range, index) in ranges"
            :key="index"
            :label="range.label"
            color="air-tertiary"
            class="rounded-none px-4"
            :class="[isRangeSelected(range) ? 'bg-(--ui-btn-background-hover)' : 'hover:bg-(--ui-btn-background-hover)']"
            truncate
            :disabled="isLoading"
            @click="selectRange(range)"
          />
        </div>

        <B24Calendar
          v-model="calendarRange"
          class="p-2"
          :number-of-months="2"
          size="sm"
          range
          :disabled="isLoading"
          :fixed-weeks="false"
        />
      </div>
    </template>
  </B24Popover>
</template>
