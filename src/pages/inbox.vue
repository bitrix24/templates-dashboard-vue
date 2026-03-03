<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFetch, useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import type { Mail } from '../types'

const tabItems = [{
  label: 'All',
  value: 'all'
}, {
  label: 'Unread',
  value: 'unread'
}]
const selectedTab = ref('all')

const { data: mails } = useFetch('https://dashboard-template.nuxt.dev/api/mails', { initialData: [] }).json<Mail[]>()

// Filter mails based on the selected tab
const filteredMails = computed(() => {
  if (selectedTab.value === 'unread') {
    return mails.value?.filter(mail => !!mail.unread) ?? []
  }

  return mails.value ?? []
})

const selectedMail = ref<Mail | null>()

const isMailPanelOpen = computed({
  get() {
    return !!selectedMail.value
  },
  set(value: boolean) {
    if (!value) {
      selectedMail.value = null
    }
  }
})

// Reset selected mail if it's not in the filtered mails
watch(filteredMails, () => {
  if (!filteredMails.value.find(mail => mail.id === selectedMail.value?.id)) {
    selectedMail.value = null
  }
})

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')
</script>

<template>
  <B24DashboardPanel
    id="inbox-1"
    :default-size="25"
    :min-size="20"
    :max-size="30"
    resizable
  >
    <B24DashboardNavbar title="Inbox">
      <template #leading>
        <B24DashboardSidebarCollapse />
      </template>
      <template #trailing>
        <B24Badge :label="filteredMails.length" variant="subtle" />
      </template>

      <template #right>
        <B24Tabs
          v-model="selectedTab"
          :items="tabItems"
          :content="false"
          size="xs"
        />
      </template>
    </B24DashboardNavbar>

    <InboxList v-model="selectedMail" :mails="filteredMails" />
  </B24DashboardPanel>

  <InboxMail v-if="selectedMail" :mail="selectedMail" @close="selectedMail = null" />
  <div v-else class="hidden lg:flex flex-1 items-center justify-center">
    <UIcon name="i-lucide-inbox" class="size-32 text-dimmed" />
  </div>

  <B24Slideover v-if="isMobile" v-model:open="isMailPanelOpen">
    <template #content>
      <InboxMail v-if="selectedMail" :mail="selectedMail" @close="selectedMail = null" />
    </template>
  </B24Slideover>
</template>
