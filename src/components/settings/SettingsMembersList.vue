<script setup lang="ts">
import type { Member } from '../../types'
import type { DropdownMenuItem } from '@bitrix24/b24ui-nuxt'

// @todo add icons & colors & see template

defineProps<{
  members: Member[]
}>()

const items = [
  {
    label: 'Edit member',
    onSelect: () => console.log('Edit member')
  },
  {
    label: 'Remove member',
    color: 'error' as const,
    onSelect: () => console.log('Remove member')
  }
] satisfies DropdownMenuItem[]
</script>

<template>
  <ul role="list" class="divide-y divide-default">
    <li
      v-for="(member, index) in members"
      :key="index"
      class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6"
    >
      <div class="flex items-center gap-3 min-w-0">
        <B24Avatar
          v-bind="member.avatar"
          size="md"
        />

        <div class="text-sm min-w-0">
          <p class="text-highlighted font-medium truncate">
            {{ member.name }}
          </p>
          <p class="text-muted truncate">
            {{ member.username }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <B24Select
          :model-value="member.role"
          :items="['member', 'owner']"
          color="neutral"
          :b24ui="{ value: 'capitalize', item: 'capitalize' }"
        />

        <B24DropdownMenu :items="items" :content="{ align: 'end' }">
          <B24Button
            ddd-icon="i-lucide-ellipsis-vertical"
            color="neutral"
          />
        </B24DropdownMenu>
      </div>
    </li>
  </ul>
</template>
