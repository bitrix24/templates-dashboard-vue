<script setup lang="ts">
import type { Result } from '@bitrix24/b24jssdk'
import { ref, onMounted } from 'vue'
import { useB24 } from './composables/useB24'
import { useDashboard } from './composables/useDashboard.ts'
import { sleepAction } from './utils'
import CloudErrorIcon from '@bitrix24/b24icons-vue/main/CloudErrorIcon'

const toast = useToast()
const b24Instance = useB24()
const { isBxMobile } = useDashboard()

const isLoading = ref(true)

const toaster = { position: isBxMobile.value ? 'bottom-center' : 'top-right' }

onMounted(async () => {
  const result: Result = await b24Instance.init()
  if (!result.isSuccess) {
    toast.add({
      title: 'Error',
      description: result.getErrorMessages().join('\n'),
      color: 'air-primary-alert',
      icon: CloudErrorIcon
    })
  }

  // Used to display the connection loading indicator
  await sleepAction(1000)
  isLoading.value = false
})
</script>

<template>
  <Suspense>
    <B24App :toaster="toaster">
      <ConnectLoader v-if="isLoading" />
      <RouterView v-else />
    </B24App>
  </Suspense>
</template>
