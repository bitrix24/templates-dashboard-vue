<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DropdownMenuItem } from '@bitrix24/b24ui-nuxt'
import { useColorMode } from '@vueuse/core'

defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()

const user = ref({
  name: 'Benjamin Canac',
  avatar: {
    src: 'https://github.com/benjamincanac.png',
    alt: 'Benjamin Canac'
  }
})

// @todo add icons & colors & see template
const items = computed<DropdownMenuItem[][]>(() => (
  [
    [
      {
        type: 'label',
        label: user.value.name,
        avatar: user.value.avatar
      }
    ],
    [
      {
        label: 'Profile'
      },
      {
        label: 'Billing'
      },
      {
        label: 'Settings',
        to: '/settings'
      }
    ],
    [
      {
        label: 'Appearance',
        children: [
          {
            label: 'Light',
            type: 'checkbox',
            checked: colorMode.value === 'light',
            onSelect(e: Event) {
              e.preventDefault()
              colorMode.value = 'light'
            }
          },
          {
            label: 'Dark',
            type: 'checkbox',
            checked: colorMode.value === 'dark',
            onUpdateChecked(checked: boolean) {
              if (checked) {
                colorMode.value = 'dark'
              }
            },
            onSelect(e: Event) {
              e.preventDefault()
            }
          }
        ]
      }
    ],
    [
      {
        label: 'Templates',
        children: [
          {
            label: 'Starter',
            to: 'https://starter-vue-template.nuxt.dev/'
          },
          {
            label: 'Dashboard',
            to: 'https://dashboard-vue-template.nuxt.dev/',
            checked: true,
            type: 'checkbox'
          }
        ]
      }
    ],
    [
      {
        label: 'Documentation',
        to: 'https://ui.nuxt.com/docs/getting-started/installation/vue',
        target: '_blank'
      },
      {
        label: 'GitHub repository',
        to: 'https://github.com/nuxt-ui-templates/dashboard-vue',
        target: '_blank'
      }
    ],
    [
      {
        label: 'Log out'
      }
    ]
  ]
))
</script>

<template>
  <B24DropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :b24ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <B24Button
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :b24ui="{
        trailingIcon: 'text-dimmed'
      }"
    />

    <template #chip-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span
          class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2"
          :style="{
            '--chip-light': `var(--color-${(item as any).chip}-500)`,
            '--chip-dark': `var(--color-${(item as any).chip}-400)`
          }"
        />
      </div>
    </template>
  </B24DropdownMenu>
</template>
