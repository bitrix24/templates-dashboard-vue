<script setup lang="ts">
import * as z from 'zod'
import { reactive } from 'vue'
import type { FormError } from '@nuxt/ui'

const passwordSchema = z.object({
  current: z.string().min(8, 'Must be at least 8 characters'),
  new: z.string().min(8, 'Must be at least 8 characters')
})

type PasswordSchema = z.output<typeof passwordSchema>

const password = reactive<Partial<PasswordSchema>>({
  current: '',
  new: ''
})

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = []
  if (state.current && state.new && state.current === state.new) {
    errors.push({ name: 'new', message: 'Passwords must be different' })
  }
  return errors
}
</script>

<template>
  <B24PageCard
    title="Password"
    description="Confirm your current password before setting a new one."
    variant="subtle"
  >
    <B24Form
      :schema="passwordSchema"
      :state="password"
      :validate="validate"
      class="flex flex-col gap-4 max-w-xs"
    >
      <B24FormField name="current">
        <B24Input
          v-model="password.current"
          type="password"
          placeholder="Current password"
          class="w-full"
        />
      </B24FormField>

      <B24FormField name="new">
        <B24Input
          v-model="password.new"
          type="password"
          placeholder="New password"
          class="w-full"
        />
      </B24FormField>

      <B24Button label="Update" class="w-fit" type="submit" />
    </B24Form>
  </B24PageCard>

  <B24PageCard
    title="Account"
    description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
    class="bg-gradient-to-tl from-error/10 from-5% to-default"
  >
    <template #footer>
      <B24Button label="Delete account" color="error" />
    </template>
  </B24PageCard>
</template>
