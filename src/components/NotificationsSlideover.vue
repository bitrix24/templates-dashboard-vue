<script setup lang="ts">
import { useFetch, formatTimeAgo } from '@vueuse/core'
import { useDashboard } from '../composables/useDashboard'
import type { Notification } from '../types'

const { isNotificationsSlideoverOpen, isBxMobile } = useDashboard()

const { data: notifications } = useFetch('/api/notifications.json', { initialData: [] }).json<Notification[]>()
</script>

<template>
  <B24Slideover
    v-model:open="isNotificationsSlideoverOpen"
    title="Notifications"
    :inset="isBxMobile"
    :b24ui="{
      content: 'sm:max-w-[470px]',
    }"
  >
    <template #body>
      <RouterLink
        v-for="notification in notifications"
        :key="notification.id"
        :to="`/inbox?id=${notification.id}`"
        class="-ms-[20px] -me-[20px] first:-mt-3 last:-mb-3 relative flex items-start px-3 py-2 hover:bg-(--ui-color-bg-content-secondary) border-b border-(--ui-color-divider-default) last:border-b-0"
      >
        <B24Chip
          color="air-primary-alert"
          :show="!!notification.unread"
          inset
        >
          <B24Avatar
            v-bind="notification.sender.avatar"
            :alt="notification.sender.name"
            size="lg"
            class="flex-shrink-0 mt-0.5"
          />
        </B24Chip>
        <div class="ms-2 flex-grow overflow-hidden">
          <div class="flex justify-between items-baseline">
            <ProseH6 class="mb-0 truncate text-(--b24ui-typography-label-color) font-bold">
              {{ notification.sender.name }}
            </ProseH6>
            <time
              :datetime="notification.date"
              class="text-(length:--ui-font-size-xs) text-(--b24ui-typography-description-color)"
              v-text="formatTimeAgo(new Date(notification.date))"
            />
          </div>
          <p class="text-sm text-(--b24ui-typography-description-color) text-pretty mt-0.5">
            {{ notification.body }}
          </p>
        </div>
      </RouterLink>
    </template>
  </B24Slideover>
</template>
