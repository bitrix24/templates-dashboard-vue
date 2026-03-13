<script setup lang="ts">
import { reactive } from 'vue'
import CheckLIcon from '@bitrix24/b24icons-vue/outline/CheckLIcon'

const toast = useToast()

const state = reactive<{ [key: string]: boolean }>({
  email: true,
  desktop: false,
  product_updates: true,
  weekly_digest: false,
  important_updates: true
})

const sections = [{
  title: 'Notification channels',
  description: 'Where can we notify you?',
  fields: [{
    name: 'email',
    label: 'Email',
    description: 'Receive a daily email digest.'
  }, {
    name: 'desktop',
    label: 'Desktop',
    description: 'Receive desktop notifications.'
  }]
}, {
  title: 'Account updates',
  description: 'Receive updates.',
  fields: [{
    name: 'weekly_digest',
    label: 'Weekly digest',
    description: 'Receive a weekly digest of news.'
  }, {
    name: 'product_updates',
    label: 'Product updates',
    description: 'Receive a monthly email with all new features and updates.'
  }, {
    name: 'important_updates',
    label: 'Important updates',
    description: 'Receive emails about important updates like security fixes, maintenance, etc.'
  }]
}]

async function onChange() {
  toast.add({
    title: 'Success',
    description: 'Your settings have been updated.',
    icon: CheckLIcon,
    color: 'air-primary-success'
  })

  console.log(state)
}
</script>

<template>
  <div v-for="(section, index) in sections" :key="index">
    <B24PageCard
      :title="section.title"
      :description="section.description"
      variant="plain-no-accent"
      orientation="horizontal"
      class="mb-4"
      :b24ui="{ container: 'p-0 sm:p-0' }"
    />

    <B24PageCard
      variant="tinted-alt"
      :b24ui="{
        root: 'bg-(--ui-color-bg-content-primary) light:bg-(--ui-color-gray-02)',
        container: 'divide-y divide-(--ui-color-divider-accent) dark:divide-(--ui-color-divider-default)'
      }"
    >
      <B24FormField
        v-for="field in section.fields"
        :key="field.name"
        :name="field.name"
        :label="field.label"
        :description="field.description"
        class="flex items-center justify-between not-last:pb-4 gap-2"
      >
        <B24Switch
          v-model="state[field.name]"
          @update:model-value="onChange"
        />
      </B24FormField>
    </B24PageCard>
  </div>
</template>
