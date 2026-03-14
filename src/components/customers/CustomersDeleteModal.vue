<script setup lang="ts">
import { ref } from 'vue'
import { sleepAction } from '../../utils'

withDefaults(defineProps<{
  count?: number
}>(), {
  count: 0
})

const open = ref(false)

async function onSubmit() {
  await sleepAction(1000)
  open.value = false
}
</script>

<template>
  <B24Modal
    v-model:open="open"
    :title="`Delete ${count} customer${count > 1 ? 's' : ''}`"
    :description="`Are you sure, this action cannot be undone.`"
  >
    <slot />

    <template #body>
      <div class="mb-0.5 flex items-center justify-between gap-[10px] border-t border-t-1 border-t-(--ui-color-divider-default) pt-[18px]">
        <B24Button
          label="Cancel"
          color="air-tertiary-no-accent"
          @click="open = false"
        />
        <B24Button
          label="Yes"
          color="air-primary-alert"
          loading-auto
          @click="onSubmit"
        />
      </div>
    </template>
  </B24Modal>
</template>
