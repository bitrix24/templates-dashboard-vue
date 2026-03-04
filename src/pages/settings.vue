<script setup lang="ts">
import type { NavigationMenuItem } from '@bitrix24/b24ui-nuxt'

// @todo add icons & colors & see template
const links = [
  [
    {
      label: 'General',
      // icon: 'i-lucide-user',
      to: '/settings',
      exact: true
    },
    {
      label: 'Members',
      // icon: 'i-lucide-users',
      to: '/settings/members'
    },
    {
      label: 'Notifications',
      // icon: 'i-lucide-bell',
      to: '/settings/notifications'
    },
    {
      label: 'Security',
      // icon: 'i-lucide-shield',
      to: '/settings/security'
    }
  ],
  [
    {
      label: 'Documentation',
      // icon: 'i-lucide-book-open',
      to: 'https://ui.nuxt.com/docs/getting-started/installation/vue',
      target: '_blank'
    }
  ]
] satisfies NavigationMenuItem[][]
</script>

<template>
  <B24DashboardPanel id="settings" :b24ui="{ body: 'lg:py-12' }">
    <template #header>
      <B24DashboardNavbar title="Settings" />

      <B24DashboardToolbar>
        <!-- NOTE: The `-mx-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
        <B24NavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </B24DashboardToolbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-[672px] mx-auto">
        <RouterView />
      </div>
    </template>
  </B24DashboardPanel>
</template>
