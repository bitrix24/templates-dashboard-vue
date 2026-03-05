<script setup lang="ts">
import {computed, ref, shallowRef} from 'vue'
import { sub } from 'date-fns'
import type { DropdownMenuItem } from '@bitrix24/b24ui-nuxt'
import { useDashboard } from '../composables/useDashboard'
import type { Period, Range } from '../types'
import { useState } from '#imports'
import Bell1Icon from '@bitrix24/b24icons-vue/main/Bell1Icon'
import PlusLIcon from '@bitrix24/b24icons-vue/outline/PlusLIcon'
import SendIcon from '@bitrix24/b24icons-vue/outline/SendIcon'
import AddPersonIcon from '@bitrix24/b24icons-vue/outline/AddPersonIcon'

const { isNotificationsSlideoverOpen } = useDashboard()

const platform = useState<{
  name?: 'web' | 'bitrix-mobile' | 'bitrix-desktop'
  version?: string
}>('platform', () => ({}))

const isBxMobile = computed<boolean>(() => {
  return platform.value.name === 'bitrix-mobile'
})

const items = [
  [
    {
      label: 'New mail',
      icon: SendIcon,
      to: '/inbox'
    },
    {
      label: 'New customer',
      icon: AddPersonIcon,
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
              class=""
              color="air-tertiary"
              @click="isNotificationsSlideoverOpen = true"
            >
              <B24Chip color="air-primary-alert" inset>
                <Bell1Icon class="size-7 shrink-0" />
              </B24Chip>
            </B24Button>
          </B24Tooltip>

          <B24DropdownMenu
            v-if="isBxMobile"
            :items="items"
            :content="{ align: 'end' }"
          >
            <B24Button
              :icon="PlusLIcon"
              size="xl"
              color="air-primary"
              class="fixed bottom-[13.5px] right-[24px] rounded-[18px] z-10 opacity-70 py-[29px] ps-[25px] pe-[33px] [--ui-btn-icon-size:32px]"
            />
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
