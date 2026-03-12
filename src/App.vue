<script setup lang="ts">
import type { B24Frame, Result } from '@bitrix24/b24jssdk'
import { ref, computed, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'
import * as locales from '@bitrix24/b24ui-nuxt/locale'
import { loadLocaleMessages } from './i18n.ts'
import { useB24 } from './composables/useB24'
import { useDashboard } from './composables/useDashboard.ts'
import { sleepAction } from './utils'
import CloudErrorIcon from '@bitrix24/b24icons-vue/main/CloudErrorIcon'

const toast = useToast()
const { locale } = useI18n()
const b24Instance = useB24()
const { isBxMobile } = useDashboard()

const isLoading = ref(true)

const toaster = { position: isBxMobile.value ? 'bottom-center' : 'top-right' }

const currentLocaleData = computed(() => {
  const currentKey = locale.value as keyof typeof locales
  return locales[currentKey] || locales['en']
})

useHead({ htmlAttrs: { lang: currentLocaleData.value.locale } })

onMounted(async () => {
  const result: Result = await b24Instance.init()
  if (!result.isSuccess) {
    toast.add({
      title: 'Error',
      description: result.getErrorMessages().join('\n'),
      color: 'air-primary-alert',
      icon: CloudErrorIcon
    })
  } else {
    if (b24Instance.isInit()) {
      const targetCode = (b24Instance.get() as B24Frame).getLang()
      await loadLocaleMessages(targetCode)
    }
  }

  // Used to display the connection loading indicator
  await sleepAction(1000)
  isLoading.value = false
})
</script>

<template>
  <Suspense>
    <B24App :toaster="toaster" :locale="currentLocaleData">
      <HomeLoader v-if="isLoading" />
      <RouterView v-else />
    </B24App>
  </Suspense>
</template>
