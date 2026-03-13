<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFetch } from '@vueuse/core'
import type { Member } from '../../types'
import SearchIcon from '@bitrix24/b24icons-vue/outline/SearchIcon'

const { data: members } = useFetch<Member[]>('https://dashboard-template.nuxt.dev/api/members', { initialData: [] }).json<Member[]>()

const q = ref('')

const filteredMembers = computed(() => {
  return members.value?.filter((member) => {
    return member.name.search(new RegExp(q.value, 'i')) !== -1 || member.username.search(new RegExp(q.value, 'i')) !== -1
  }) ?? []
})
</script>

<template>
  <div>
    <B24PageCard
      title="Members"
      description="Invite new members by email address."
      variant="plain-no-accent"
      orientation="horizontal"
      class="mb-4"
      :b24ui="{ container: 'p-0 sm:p-0' }"
    >
      <B24Button
        label="Invite people"
        color="air-secondary"
        class="w-fit lg:ms-auto"
      />
    </B24PageCard>

    <B24PageCard
      variant="tinted-alt"
      :b24ui="{
        root: 'bg-(--ui-color-bg-content-primary) light:bg-(--ui-color-gray-02)',
        container: 'p-0 sm:p-0 gap-y-0',
        wrapper: 'items-stretch',
        header: 'p-4 mb-0 border-b border-(--ui-color-divider-accent) dark:border-(--ui-color-divider-default)' }"
    >
      <template #header>
        <B24Input
          v-model="q"
          :icon="SearchIcon"
          placeholder="Search members"
          autofocus
          class="w-full"
        />
      </template>

      <SettingsMembersList :members="filteredMembers" />
    </B24PageCard>
  </div>
</template>
