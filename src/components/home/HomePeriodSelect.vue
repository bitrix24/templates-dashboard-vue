<script setup lang="ts">
import { computed, watch } from 'vue'
import { eachDayOfInterval } from 'date-fns'
import type { Period, Range } from '../../types'

// @todo save selected in b24 user.options

const model = defineModel<Period>({ required: true })

const props = defineProps<{
  range: Range
}>()

const days = computed(() => eachDayOfInterval(props.range))

const periods = computed<Period[]>(() => {
  if (days.value.length <= 8) {
    return [
      'daily'
    ]
  }

  if (days.value.length <= 31) {
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

// Ensure the model value is always a valid period
watch(periods, () => {
  if (!periods.value.includes(model.value)) {
    model.value = periods.value[0]
  }
})
</script>

<template>
  <B24Select
    v-model="model"
    :items="periods"
    no-border
    class="w-[100px] ui-btn --air --style-plain hover:bg-(--ui-btn-background-hover) data-[state=open]:bg-(--ui-btn-background-hover)"
    :b24ui="{ value: 'capitalize', itemLabel: 'capitalize', trailingIcon: 'size-5 shrink-0 text-description group-data-[state=open]:rotate-180 transition-transform duration-200' }"
  />
</template>
