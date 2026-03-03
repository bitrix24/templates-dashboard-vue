<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFetch } from '@vueuse/core'
import type { Member } from '../../types'

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
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <B24Button
        label="Invite people"
        color="neutral"
        class="w-fit lg:ms-auto"
      />
    </B24PageCard>

    <B24PageCard variant="subtle" :ui="{ container: 'p-0 sm:p-0 gap-y-0', wrapper: 'items-stretch', header: 'p-4 mb-0 border-b border-default' }">
      <template #header>
        <B24Input
          v-model="q"
          icon="i-lucide-search"
          placeholder="Search members"
          autofocus
          class="w-full"
        />
      </template>

      <SettingsMembersList :members="filteredMembers" />
    </B24PageCard>
  </div>
</template>
