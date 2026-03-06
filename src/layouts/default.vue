<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStorage } from '@vueuse/core'
import type { NavigationMenuItem, CommandPaletteGroup, CommandPaletteItem } from '@bitrix24/b24ui-nuxt'
import HomeIcon from '@bitrix24/b24icons-vue/outline/HomeIcon'
import MessagesIcon from '@bitrix24/b24icons-vue/outline/MessagesIcon'
import GroupIcon from '@bitrix24/b24icons-vue/outline/GroupIcon'
import SettingsIcon from '@bitrix24/b24icons-vue/outline/SettingsIcon'
import Bitrix24Icon from '@bitrix24/b24icons-vue/common-service/Bitrix24Icon'
import TelegramIcon from '@bitrix24/b24icons-vue/outline/TelegramIcon'
import GitHubIcon from '@bitrix24/b24icons-vue/social/GitHubIcon'
import HamburgerMenuIcon from '@bitrix24/b24icons-vue/outline/HamburgerMenuIcon'

const toast = useToast()
const route = useRoute()

const open = ref(false)

const isNeedChangeTarget = ref(false)
const tgLink = computed(() => {
  return (
    isNeedChangeTarget.value && (typeof window !== 'undefined' && window.navigator?.language.includes('ru'))
  )
    ? 'https://t.me/bitrix24apps'
    : 'https://t.me/b24_dev'
})

const b24DocsLink = computed(() => {
  return (
    isNeedChangeTarget.value && (typeof window !== 'undefined' && window.navigator?.language.includes('ru'))
  )
    ? 'https://apidocs.bitrix24.ru/'
    : 'https://apidocs.bitrix24.com/'
})

const links = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: 'Home',
      icon: HomeIcon,
      to: '/',
      onSelect: () => {
        open.value = false
      }
    },
    {
      label: 'Inbox',
      icon: MessagesIcon,
      to: '/inbox',
      badge: '4',
      onSelect: () => {
        open.value = false
      }
    },
    {
      label: 'Customers',
      icon: GroupIcon,
      to: '/customers',
      onSelect: () => {
        open.value = false
      }
    },
    {
      label: 'Settings',
      to: '/settings',
      icon: SettingsIcon,
      defaultOpen: true,
      type: 'trigger',
      children: [
        {
          label: 'General',
          to: '/settings',
          exact: true,
          onSelect: () => {
            open.value = false
          }
        },
        {
          label: 'Members',
          to: '/settings/members',
          onSelect: () => {
            open.value = false
          }
        },
        {
          label: 'Notifications',
          to: '/settings/notifications',
          onSelect: () => {
            open.value = false
          }
        },
        {
          label: 'Security',
          to: '/settings/security',
          onSelect: () => {
            open.value = false
          }
        }
      ]
    }
  ],
  [
    {
      label: 'Bitrix24 REST API',
      icon: Bitrix24Icon,
      to: b24DocsLink.value,
      target: '_blank'
    },
    {
      label: 'Help & Support',
      icon: TelegramIcon,
      to: tgLink.value,
      target: '_blank'
    },
    {
      label: 'GitHub',
      icon: GitHubIcon,
      to: 'https://github.com/bitrix24/templates-dashboard-vue',
      target: '_blank'
    },

  ]
])

const groups = computed<CommandPaletteGroup[]>(() => [
  {
    id: 'links',
    label: 'Go to',
    items: links.value.flat() as CommandPaletteItem[]
  },
  {
    id: 'code',
    label: 'Code',
    items: [
      {
        id: 'source',
        label: 'View page source',
        icon: GitHubIcon,
        to: `https://github.com/bitrix24/templates-dashboard-vue/blob/main/src/pages${route.path === '/' ? '/index' : route.path}.vue`,
        target: '_blank'
      }
    ] as CommandPaletteItem[]
  }
])

const cookie = useStorage('cookie-consent', 'pending')
if (cookie.value !== 'accepted') {
  toast.add({
    title: 'We use first-party cookies to enhance your experience on our website.',
    duration: 0,
    close: false,
    actions: [
      {
        label: 'Accept',
        color: 'air-primary-success',
        onClick: () => {
          cookie.value = 'accepted'
        }
      },
      {
        label: 'Opt out',
        color: 'air-secondary-no-accent',
      }
    ]
  })
}

onMounted(() => {
  isNeedChangeTarget.value = true
})
</script>

<template>
  <B24DashboardGroup unit="px" storage="local">
    <B24DashboardSidebar
      id="default"
      v-model:open="open"
      mode="drawer"
      collapsible
      resizable
      class="bg-(--ui-color-bg-content-primary) light:bg-(--ui-color-gray-01) backdrop-blur-md"
      :b24ui="{
        header: 'ps-4 pe-4',
        body: 'ps-4 pe-4',
        footer: 'ps-4 pe-4 lg:border-t lg:border-(--ui-color-divider-default)'
      }"
    >
      <template #header="{ collapsed }">
        <B24DashboardSidebarCollapse :icon="HamburgerMenuIcon" class="size-9 px-2" />
        <TemplateMenu v-if="!collapsed" />
      </template>

      <template #default="{ collapsed }">
        <B24DashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-(--ui-color-divider-default)" />

        <B24NavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
          :b24ui="{ root: 'ps-0 rtl:pe-0 pe-0' }"
        />

        <B24NavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
          :b24ui="{ root: 'ps-0 rtl:pe-0 pe-0' }"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </B24DashboardSidebar>

    <B24DashboardSearch :groups="groups" :color-mode="false" />

    <RouterView />

    <NotificationsSlideover />
  </B24DashboardGroup>
</template>
