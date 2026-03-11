<script setup lang="ts">
import type { B24Frame } from '@bitrix24/b24jssdk'
import type { DropdownMenuItem } from '@bitrix24/b24ui-nuxt'
import { computed } from 'vue'
import { useDealStats } from '../composables/useDealStats'
import { useDashboard } from '../composables/useDashboard'
import { useB24 } from '../composables/useB24'
import Bell1Icon from '@bitrix24/b24icons-vue/main/Bell1Icon'
import PlusLIcon from '@bitrix24/b24icons-vue/outline/PlusLIcon'
import SendIcon from '@bitrix24/b24icons-vue/outline/SendIcon'
import AddPersonIcon from '@bitrix24/b24icons-vue/outline/AddPersonIcon'
import DatabaseIcon from '@bitrix24/b24icons-vue/outline/DatabaseIcon'

const { period, range, isLoading, loadDeals } = useDealStats()

const { isNotificationsSlideoverOpen, isBxMobile } = useDashboard()
const b24Instance = useB24()

const $b24 = b24Instance.get() as B24Frame
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
  <B24DashboardPanel id="home" :b24ui="{ body: 'p-4' }">
    <template #header>
      <!-- @todo: after UI update fix :b24ui -->
      <B24DashboardNavbar :title="page.title" :b24ui="{ root: 'ps-2 lg:ps-4', right: 'gap-3' }">
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

      <!-- @todo: after UI update fix :b24ui -->
      <B24DashboardToolbar class="scrollbar-thin" :b24ui="{ root: 'sm:px-4' }">
        <template #left>
          <B24Button
            :icon="DatabaseIcon"
            label="Reload"
            color="air-secondary"
            size="sm"
            loading-auto
            @click="loadDeals"
          />

          <HomeDateRangePicker v-model="range" />

          <HomePeriodSelect v-model="period" />
        </template>
      </B24DashboardToolbar>
    </template>

    <template #body>
      <HomeStats />
      <template v-if="isLoading">
        <HomeLoaderChart class="min-h-[470px]" />
        <HomeLoaderSales class="min-h-[230px]" />
      </template>
      <template v-else>
        <HomeChart />
        <HomeSales />
      </template>
    </template>
  </B24DashboardPanel>
</template>
