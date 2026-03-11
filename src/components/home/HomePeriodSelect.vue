<script setup lang="ts">
import type { Period } from '../../types'
import { useDealStats22 } from '../../composables/useDealStats22.ts'

const { isLoading, periodsData } = useDealStats22()
const model = defineModel<Period>({ required: true })
</script>

<template>
  <!-- @todo: after UI update fix class transition-colors disabled:pointer-events-auto  -->
  <B24Select
    v-model="model"
    :items="periodsData"
    color="air-primary-ai"
    size="sm"
    highlight
    class="min-w-[90px] transition-colors disabled:pointer-events-auto style-transparent-bg ui-btn --air style-outline-accent-1 hover:bg-(--ui-btn-background-hover) data-[state=open]:bg-(--ui-btn-background-hover)"
    :b24ui="{ value: 'capitalize', itemLabel: 'capitalize', trailingIcon: 'size-5 shrink-0 text-description group-data-[state=open]:rotate-180 transition-transform duration-200' }"
    :disabled="isLoading"
  />
</template>
