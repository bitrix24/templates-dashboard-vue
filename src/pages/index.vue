<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { sub } from 'date-fns'
import type { DropdownMenuItem } from '@bitrix24/b24ui-nuxt'
import { useDashboard } from '../composables/useDashboard'
import type { Period, Range } from '../types'
import Bell1Icon from '@bitrix24/b24icons-vue/main/Bell1Icon'

const { isNotificationsSlideoverOpen } = useDashboard()

// @todo add icons & colors & see template
const items = [
  [
    {
      label: 'New mail',
      // icon: 'i-lucide-send',
      to: '/inbox'
    },
    {
      label: 'New customer',
      // icon: 'i-lucide-user-plus',
      to: '/customers'
    }
  ]
] satisfies DropdownMenuItem[][]

const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})
const period = ref<Period>('daily')
</script>

<template>
  <B24DashboardPanel id="home">
    <template #header>
      <B24DashboardNavbar title="Home" :b24ui="{ right: 'gap-3' }">
        <template #right>
          <B24Tooltip text="Notifications" :shortcuts="['N']">
            <B24Button
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <B24Chip color="error" inset>
                <Bell1Icon class="size-5 shrink-0" />
              </B24Chip>
            </B24Button>
          </B24Tooltip>

          <B24DropdownMenu :items="items">
            <B24Button ddd-icon="i-lucide-plus" size="md" class="rounded-full" />
          </B24DropdownMenu>
        </template>
      </B24DashboardNavbar>

      <B24DashboardToolbar>
        <template #left>
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
          <HomeDateRangePicker v-model="range" class="-ms-1" />

          <HomePeriodSelect v-model="period" :range="range" />
        </template>
      </B24DashboardToolbar>
    </template>

    <template #body>
      <HomeStats :period="period" :range="range" />
      <HomeChart :period="period" :range="range" />
      <HomeSales :period="period" :range="range" />
    </template>
  </B24DashboardPanel>
</template>
