<script setup lang="ts">
import { useFetch, formatTimeAgo } from '@vueuse/core'
import { useDashboard } from '../composables/useDashboard'
import type { Notification } from '../types'

const { isNotificationsSlideoverOpen } = useDashboard()

const { data: notifications } = useFetch('https://dashboard-template.nuxt.dev/api/notifications', { initialData: [] }).json<Notification[]>()
</script>

<template>
  <B24Slideover
    v-model:open="isNotificationsSlideoverOpen"
    title="Notifications"
  >
    <template #body>
      <RouterLink
        v-for="notification in notifications"
        :key="notification.id"
        :to="`/inbox?id=${notification.id}`"
        class="px-3 py-2.5 rounded-md hover:bg-elevated/50 flex items-center gap-3 relative -mx-3 first:-mt-3 last:-mb-3"
      >
        <B24Chip
          color="error"
          :show="!!notification.unread"
          inset
        >
          <B24Avatar
            v-bind="notification.sender.avatar"
            :alt="notification.sender.name"
            size="md"
          />
        </B24Chip>

        <div class="text-sm flex-1">
          <p class="flex items-center justify-between">
            <span class="text-highlighted font-medium">{{ notification.sender.name }}</span>

            <time
              :datetime="notification.date"
              class="text-muted text-xs"
              v-text="formatTimeAgo(new Date(notification.date))"
            />
          </p>

          <p class="text-dimmed">
            {{ notification.body }}
          </p>
        </div>
      </RouterLink>
    </template>
  </B24Slideover>
</template>
