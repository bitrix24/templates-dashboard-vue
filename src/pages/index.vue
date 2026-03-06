<script setup lang="ts">
import type { B24Frame } from '@bitrix24/b24jssdk'
import type { DropdownMenuItem } from '@bitrix24/b24ui-nuxt'
import type { Period, Range } from '../types'
import { computed, ref, shallowRef } from 'vue'
import { sub } from 'date-fns'
import { useDashboard } from '../composables/useDashboard'

import { useB24 } from '../composables/useB24'
import Bell1Icon from '@bitrix24/b24icons-vue/main/Bell1Icon'
import PlusLIcon from '@bitrix24/b24icons-vue/outline/PlusLIcon'
import SendIcon from '@bitrix24/b24icons-vue/outline/SendIcon'
import AddPersonIcon from '@bitrix24/b24icons-vue/outline/AddPersonIcon'

const { isNotificationsSlideoverOpen, isBxMobile } = useDashboard()
const b24Instance = useB24()

const $b24 = b24Instance.get() as B24Frame


const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})
const period = ref<Period>('daily')

const isUseB24 = computed<boolean>(() => {
  return b24Instance.isInit()
})

const page = {
  title: 'Home',
  addButton: {
    isOnlyBitrixMobile: false,
    items: [
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
    ] satisfies DropdownMenuItem[]
  }
}

async function initPage() {
  if (!isUseB24.value) {
    return
  }

  $b24.parent.setTitle(page.title)
}

await initPage()
</script>

<template>
  <B24DashboardPanel id="home">
    <template #header>
      <B24DashboardNavbar :title="page.title" :b24ui="{ right: 'gap-3' }">
        <template #right>
          <B24Tooltip text="Notifications" :kbds="['N']">
            <B24Button
              class=""
              color="air-tertiary-no-accent"
              @click="isNotificationsSlideoverOpen = true"
            >
              <B24Chip color="air-primary-alert">
                <Bell1Icon class="size-7 shrink-0" />
              </B24Chip>
            </B24Button>
          </B24Tooltip>

          <B24DropdownMenu
            v-if="!page.addButton.isOnlyBitrixMobile || (page.addButton.isOnlyBitrixMobile && isBxMobile)"
            :items="page.addButton.items"
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

      <B24DashboardToolbar class="scrollbar-thin">
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
