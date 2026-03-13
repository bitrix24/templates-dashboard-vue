<script setup lang="ts">
import type { NavigationMenuItem } from '@bitrix24/b24ui-nuxt'
import InfoCircleIcon from '@bitrix24/b24icons-vue/outline/InfoCircleIcon'
import ShieldIcon from '@bitrix24/b24icons-vue/outline/ShieldIcon'
import Bell1Icon from '@bitrix24/b24icons-vue/main/Bell1Icon'
import PersonIcon from '@bitrix24/b24icons-vue/outline/PersonIcon'
import ThreePersonsIcon from '@bitrix24/b24icons-vue/outline/ThreePersonsIcon'

const links = [
  [
    {
      label: 'General',
      icon: PersonIcon,
      to: '/settings',
      exact: true
    },
    {
      label: 'Members',
      icon: ThreePersonsIcon,
      to: '/settings/members'
    },
    {
      label: 'Notifications',
      icon: Bell1Icon,
      to: '/settings/notifications'
    },
    {
      label: 'Security',
      icon: ShieldIcon,
      to: '/settings/security'
    }
  ],
  [
    {
      label: 'Documentation',
      icon: InfoCircleIcon,
      to: 'https://bitrix24.github.io/b24ui/docs/getting-started/installation/vue/',
      target: '_blank'
    }
  ]
] satisfies NavigationMenuItem[][]
</script>

<template>
  <B24DashboardPanel id="settings" :b24ui="{ body: 'p-4 lg:py-12' }">
    <template #header>
      <B24DashboardNavbar title="Settings" />

      <B24DashboardToolbar>
        <!-- NOTE: The `-mx-1` class is used to align with the `B24DashboardNavbar` here. -->
        <B24NavigationMenu :items="links" highlight class="-mx-2 flex-1" />
      </B24DashboardToolbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-[672px] mx-auto">
        <RouterView />
      </div>
    </template>
  </B24DashboardPanel>
</template>
