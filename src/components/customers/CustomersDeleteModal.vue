<script setup lang="ts">
import { ref } from 'vue'

// @todo add icons & colors & see template

withDefaults(defineProps<{
  count?: number
}>(), {
  count: 0
})

const open = ref(false)

async function onSubmit() {
  await new Promise(resolve => setTimeout(resolve, 1000))
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
      <div class="flex justify-end gap-2">
        <B24Button
          label="Cancel"
          color="neutral"
          @click="open = false"
        />
        <B24Button
          label="Delete"
          color="error"
          loading-auto
          @click="onSubmit"
        />
      </div>
    </template>
  </B24Modal>
</template>
