<script setup lang="ts">
import type { IStep } from '../types'
import type { ProgressProps } from '@bitrix24/b24ui-nuxt'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useB24 } from '../composables/useB24'
import { sleepAction } from '../utils'
import Market1Icon from '@bitrix24/b24icons-vue/main/Market1Icon'

const { t } = useI18n()
useHead({ title: t('page.install.seo.title') })
// definePage({ meta: { layout: 'clear' } })

// region Init ////
const router = useRouter()
const toast = useToast()
const confetti = useConfetti()
const b24Instance = useB24()
const $logger = b24Instance.buildLogger('install')

const isUseB24 = computed<boolean>(() => {
  return b24Instance.isInit()
})

const isShowDebug = ref(false)
const progressColor = ref<ProgressProps['color']>('air-primary')
const progressValue = ref<null | number>(null)
// endregion ////

// region Steps ////
/**
 * @todo add jsDocs
 * @todo refactor code
 */
const steps = ref<Record<string, IStep>>({
  init: {
    caption: t('page.install.step.init.caption'),
    action: makeInit
  },
  serverSide: {
    caption: t('page.install.step.serverSide.caption'),
    action: async () => {
      if (!isUseB24.value) return
      const authData = b24Instance.getFrame().auth.getAuthData()

      if (authData === false) {
        throw new Error('Some problem with auth. See App logic')
      }

      // Send `authData` to your backend here to finish the server-side install.
    }
  },
  finish: {
    caption: t('page.install.step.finish.caption'),
    action: makeFinish
  }
})
const stepCode = ref<string>('init' as const)
// endregion ////

// region Actions ////
async function makeInit(): Promise<void> {
  if (!isUseB24.value) {
    return
  }

  const $b24 = b24Instance.getFrame()
  $b24.parent.setTitle(t('page.install.seo.title'))

  if (steps.value.init) {
    const response = await $b24.actions.v2.batch.make({
      calls: {
        appInfo: { method: 'app.info' },
        profile: { method: 'profile' },
        userFieldTypeList: { method: 'userfieldtype.list' },
        placementList: { method: 'placement.get' }
      }
    })

    steps.value.init.data = response.getData() as {
      appInfo: {
        ID: number
        CODE: string
        VERSION: string
        STATUS: string
        LICENSE: string
        LICENSE_FAMILY: string
        INSTALLED: boolean
      }
      profile: {
        ID: number
        ADMIN: boolean
        LAST_NAME?: string
        NAME?: string
      }
      userFieldTypeList: {
        USER_TYPE_ID: string
        HANDLER: string
        TITLE: string
        DESCRIPTION: string
      }[]
      placementList: {
        placement: string
        userId: number
        handler: string
        options: unknown
        title: string
        description: string
      }[]
    }
  }
}

async function makeFinish(): Promise<void> {
  if (!isUseB24.value) {
    return
  }

  progressColor.value = 'air-primary-success'
  progressValue.value = 100

  confetti.fire()
  await sleepAction(3000)

  await b24Instance.getFrame().installFinish()
}

const stepsData = computed(() => {
  return Object.entries(steps.value).map(([index, row]) => {
    return {
      step: index,
      data: row?.data
    }
  })
})
// endregion ////

// region Lifecycle Hooks ////
onMounted(async () => {
  try {
    if (!isUseB24.value) {
      // region mock ////
      toast.add({
        id: 'install-warning-mock',
        title: t('mock.toast.title'),
        description: t('mock.toast.description'),
        icon: Market1Icon,
        color: 'air-primary-warning',
        duration: 0,
        close: false
      })

      for (const key of Object.keys(steps.value)) {
        stepCode.value = key
        await sleepAction(600)
      }

      progressColor.value = 'air-primary-warning'
      progressValue.value = 99

      confetti.fire()
      await sleepAction(3000)

      toast.remove('install-warning-mock')
      return router.replace('/')
      // endregion ////
    }

    await b24Instance.getFrame().parent.setTitle(t('page.install.seo.title'))

    for (const [key, step] of Object.entries(steps.value)) {
      stepCode.value = key
      await step.action()
    }
  } catch (error: unknown) {
    $logger.error(error instanceof Error ? error.message : String(error))
    throw error
  }
})
// endregion ////
</script>

<template>
  <B24DashboardPanel
    id="install"
    :b24ui="{ body: 'p-4 sm:pt-4 items-center justify-center gap-1 sm:gap-1 scrollbar-transparent' }"
  >
    <template #body>
      <AppLogo
        class="size-[208px]"
        :class="[stepCode === 'finish' ? 'text-(--ui-color-accent-main-success)' : 'text-(--ui-color-accent-soft-green-1)']"
      />
      <B24Progress
        v-model="progressValue"
        size="xs"
        animation="elastic"
        :color="progressColor"
        class="w-1/2 sm:w-1/3"
      />
      <div class="mt-6 flex flex-col items-center justify-center gap-2">
        <ProseH1 class="text-nowrap mb-0">
          {{ $t('page.install.ui.title') }}
        </ProseH1>
        <ProseP small accent="less">
          {{ steps[stepCode]?.caption || '...' }}
        </ProseP>
      </div>

      <ProsePre v-if="isShowDebug">
        {{ stepsData }}
      </ProsePre>
    </template>
  </B24DashboardPanel>
</template>

<route lang="yaml">
meta:
  layout: clear
</route>
