<script setup lang="ts">
import { ref } from 'vue'
import { format } from 'date-fns'
import type { Mail } from '../../types'

// @todo add icons & colors & see template

defineProps<{
  mail: Mail
}>()

const emits = defineEmits(['close'])

const dropdownItems = [
  [
    {
      label: 'Mark as unread',
      // icon: 'i-lucide-check-circle'
    },
    {
      label: 'Mark as important',
      // icon: 'i-lucide-triangle-alert'
    }
  ],
  [
    {
      label: 'Star thread',
      // icon: 'i-lucide-star'
    },
    {
      label: 'Mute thread',
      // icon: 'i-lucide-circle-pause'
    }
  ]
]

const toast = useToast()

const reply = ref('')
const loading = ref(false)

function onSubmit() {
  loading.value = true

  setTimeout(() => {
    reply.value = ''

    toast.add({
      title: 'Email sent',
      description: 'Your email has been sent successfully',
      // icon: 'i-lucide-check-circle',
      color: 'success'
    })

    loading.value = false
  }, 1000)
}
</script>

<template>
  <B24DashboardPanel id="inbox-2">
    <B24DashboardNavbar :title="mail.subject" :toggle="false">
      <template #leading>
        <B24Button
          ddd-icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          class="-ms-1.5"
          @click="emits('close')"
        />
      </template>

      <template #right>
        <B24Tooltip text="Archive">
          <B24Button
            ddd-icon="i-lucide-inbox"
            color="neutral"
            variant="ghost"
          />
        </B24Tooltip>

        <B24Tooltip text="Reply">
          <B24Button ddd-icon="i-lucide-reply" color="neutral" variant="ghost" />
        </B24Tooltip>

        <B24DropdownMenu :items="dropdownItems">
          <B24Button
            ddd-icon="i-lucide-ellipsis-vertical"
            color="neutral"
          />
        </B24DropdownMenu>
      </template>
    </B24DashboardNavbar>

    <div class="flex flex-col sm:flex-row justify-between gap-1 p-4 sm:px-6 border-b border-(--ui-color-divider-default)">
      <div class="flex items-start gap-4 sm:my-1.5">
        <B24Avatar
          v-bind="mail.from.avatar"
          :alt="mail.from.name"
          size="xl"
        />

        <div class="min-w-0">
          <p class="font-semibold text-highlighted">
            {{ mail.from.name }}
          </p>
          <p class="text-muted">
            {{ mail.from.email }}
          </p>
        </div>
      </div>

      <p class="max-sm:pl-16 text-muted text-sm sm:mt-2">
        {{ format(new Date(mail.date), 'dd MMM HH:mm') }}
      </p>
    </div>

    <div class="flex-1 p-4 sm:p-6 max-h-[200px] sm:max-h-max overflow-y-auto scrollbar-thin">
      <p class="whitespace-pre-wrap">
        {{ mail.body }}
      </p>
    </div>

    <div class="pb-4 px-4 sm:px-6 shrink-0">
      <B24Card variant="subtle" class="mt-auto" :b24ui="{ header: 'flex items-center gap-1.5 text-dimmed' }">
        <template #header>
          <div name="i-lucide-reply" class="size-5" />

          <span class="text-sm truncate">
            Reply to {{ mail.from.name }} ({{ mail.from.email }})
          </span>
        </template>

        <form @submit.prevent="onSubmit">
          <B24Textarea
            v-model="reply"
            required
            autoresize
            placeholder="Write your reply..."
            no-padding
            no-border
            :rows="2"
            :maxrows="5"
            :disabled="loading"
            class="w-full"
            :b24ui="{ base: 'resize-none' }"
          />

          <div class="flex items-center justify-between">
            <B24Tooltip text="Attach file">
              <B24Button
                color="neutral"
                variant="ghost"
                dd-icon="i-lucide-paperclip"
              />
            </B24Tooltip>

            <div class="flex items-center justify-end gap-2">
              <B24Button
                color="neutral"
                variant="ghost"
                label="Save draft"
              />
              <B24Button
                type="submit"
                color="neutral"
                :loading="loading"
                label="Send"
                dd-icon="i-lucide-send"
              />
            </div>
          </div>
        </form>
      </B24Card>
    </div>
  </B24DashboardPanel>
</template>
