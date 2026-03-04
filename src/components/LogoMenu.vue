<script setup lang="ts">
import type { B24Frame } from '@bitrix24/b24jssdk'
import type { DropdownMenuItem } from '@bitrix24/b24ui-nuxt'
import { computed } from 'vue'
import CirclePlusIcon from '@bitrix24/b24icons-vue/outline/CirclePlusIcon'
import Filter2LinesIcon from '@bitrix24/b24icons-vue/outline/Filter2LinesIcon'
import { useB24 } from '../composables/useB24.ts'
import { useState } from '#imports'

const $b24 = useB24().get() as B24Frame
const toast = useToast()

const props = defineProps<{
  collapsed?: boolean
  title?: string
}>()

const platform = useState('platform')
const isBxMobile = computed<boolean>(() => {
  return platform.value.name === 'bitrix-mobile'
})
const items = computed<DropdownMenuItem[][]>(() => {
  return [
    ...[
      {
        label: 'Simulation of action',
        icon: CirclePlusIcon,
        onSelect() {
          toast.add({
            title: 'Info',
            description: 'Some toast',
            color: 'air-primary',
            icon: CirclePlusIcon
          })
        }
      }
    ],
    ... (!isBxMobile.value
      ? [
        {
          label: 'Create team',
          icon: CirclePlusIcon,
          onSelect() {
            $b24.slider.openPath(
              $b24.slider.getUrl('/bitrix/services/main/ajax.php?action=getSliderContent&SITE_ID=s1&c=bitrix%3Aintranet.invitation&mode=ajax'),
              950
            )
          }
        },
        {
          label: 'Manage teams',
          icon: Filter2LinesIcon,
          onSelect() {
            $b24.slider.openPath(
              $b24.slider.getUrl('/company/'),
              950
            )
          }
        }
      ]
      : [] )
  ]
})
</script>

<template>
  <B24DropdownMenu
    :items="items"
    :content="{ align: 'start', collisionPadding: 12 }"
  >
    <B24Button
      :label="collapsed ? undefined : props.title"
      color="air-tertiary-no-accent"
      :use-dropdown="!collapsed"
      class="w-full data-[state=open]:bg-(--ui-btn-background-hover)"
      :class="[!collapsed && 'py-2']"
      :b24ui="{ label: 'flex-1' }"
    />
  </B24DropdownMenu>
</template>
