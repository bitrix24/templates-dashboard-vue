<script setup lang="ts">
import type { Period } from '../../types'
import { useDealStats } from '../../composables/useDealStats'

const { isLoading, periodsData } = useDealStats()
const model = defineModel<Period>({ required: true })
</script>

<template>
  <!-- @todo: after UI update fix class transition-colors disabled:pointer-events-auto  -->
  <B24Select
    v-model="model"
    :items="periodsData"
    color="air-primary-ai"
    highlight
    class="min-w-[90px] transition-colors disabled:pointer-events-auto style-transparent-bg ui-btn --air style-outline-accent-1 hover:bg-(--ui-btn-background-hover) data-[state=open]:bg-(--ui-btn-background-hover)"
    :b24ui="{ value: 'capitalize', itemLabel: 'capitalize', trailingIcon: 'size-5 shrink-0 text-description group-data-[state=open]:rotate-180 transition-transform duration-200' }"
    :disabled="isLoading"
  />
</template>
