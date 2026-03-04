<script setup lang="ts">
import { ref, reactive } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent } from '@bitrix24/b24ui-nuxt'

// @todo add icons & colors & see template

const schema = z.object({
  name: z.string().min(2, 'Too short'),
  email: z.string().email('Invalid email')
})
const open = ref(false)

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: '',
  email: ''
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({ title: 'Success', description: `New customer ${event.data.name} added`, color: 'success' })
  open.value = false
}
</script>

<template>
  <B24Modal v-model:open="open" title="New customer" description="Add a new customer to the database">
    <B24Button label="New customer" ddd-icon="i-lucide-plus" />

    <template #body>
      <B24Form
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <B24FormField label="Name" placeholder="John Doe" name="name">
          <B24Input v-model="state.name" class="w-full" />
        </B24FormField>
        <B24FormField label="Email" placeholder="john.doe@example.com" name="email">
          <B24Input v-model="state.email" class="w-full" />
        </B24FormField>
        <div class="flex justify-end gap-2">
          <B24Button
            label="Cancel"
            color="neutral"
            @click="open = false"
          />
          <B24Button
            label="Create"
            color="primary"
            type="submit"
          />
        </div>
      </B24Form>
    </template>
  </B24Modal>
</template>
