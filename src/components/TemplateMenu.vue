<script setup lang="ts">
import Expand1Icon from '@bitrix24/b24icons-vue/actions/Expand1Icon'
</script>

<template>
  <B24DropdownMenu
    :modal="false"
    :items="[
      {
        label: 'Starter',
        to: 'https://bitrix24.github.io/starter-b24ui-vue/',
      },
      {
        label: 'Dashboard',
        to: 'https://bitrix24.github.io/templates-dashboard-vue/',
        checked: true,
        type: 'checkbox'
      },
      {
        type: 'separator'
      },
      {
        label: 'B24 Ui',
        to: 'https://bitrix24.github.io/b24ui/',
        target: '_blank'
      },
      {
        label: 'B24 Js Sdk',
        to: 'https://bitrix24.github.io/b24jssdk/',
        target: '_blank'
      },
      {
        label: 'B24 Icons',
        to: 'https://bitrix24.github.io/b24icons/',
        target: '_blank'
      }
    ]"
    :content="{ align: 'start', side: 'bottom', sideOffset: 4 }"
    :b24ui="{ content: 'w-[200px]', viewport: 'w-[200px]' }"
  >
    <B24Button
      label="Dashboard"
      use-dropdown
      color="air-tertiary-no-accent"
      class="truncate w-full data-[state=open]:bg-(--ui-btn-background-hover)"
      :class="['py-2.5']"
      :b24ui="{ label: 'flex-1' }"
    >
      <template #trailing>
        <Expand1Icon class="size-4" />
      </template>
    </B24Button>
  </B24DropdownMenu>
</template>
