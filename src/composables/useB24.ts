import type { B24FrameQueryParams, LoggerInterface } from '@bitrix24/b24jssdk'
import { ref, nextTick } from 'vue'
import { B24Frame, LoggerFactory, Result, SdkError, initializeB24Frame } from '@bitrix24/b24jssdk'

let $b24: undefined | B24Frame = undefined
const type = ref<'undefined' | 'B24Frame'>('undefined')

export const useB24 = () => {
  const b24Config = {}

  function buildLogger(loggerTitle?: string): LoggerInterface {
    const devMode = typeof import.meta !== 'undefined' && import.meta.env?.DEV
    return LoggerFactory.createForBrowser(loggerTitle ?? 'dashBoard', devMode)
  }

  function get() {
    return $b24
  }

  function set(newValue: unknown | B24Frame | string): Result {
    const result = new Result()
    if (
      typeof newValue !== 'undefined'
      && typeof $b24 === 'undefined'
    ) {
      if (newValue instanceof B24Frame) {
        $b24 = newValue
        nextTick(() => {
          type.value = 'B24Frame'
        })
      }
    } else if (
      typeof newValue === 'undefined'
    ) {
      nextTick(() => {
        type.value = 'undefined'
      })
      $b24 = undefined
    }

    return result
  }

  async function init(): Promise<Result> {
    try {
      // try to detect by Frame Params
      const queryParams: B24FrameQueryParams = {
        DOMAIN: null,
        PROTOCOL: false,
        APP_SID: null,
        LANG: null
      }

      if (window.name) {
        const [domain, appSid] = window.name.split('|')
        queryParams.DOMAIN = domain
        queryParams.APP_SID = appSid
      }

      if (!queryParams.DOMAIN || !queryParams.APP_SID) {
        // console.error('[docs] Unable to initialize Bitrix24Frame library!')
        throw new SdkError({
          code: 'JSSDK_CLIENT_SIDE_WARNING',
          description: 'Well done! Now paste this URL into the B24 app settings',
          status: 500
        })
      }

      // now init b24Frame
      return set(await initializeB24Frame(b24Config))
    } catch {
      // set(undefined)
    }

    return new Result()
  }

  function isFrame() {
    return get() instanceof B24Frame
  }

  function isInit() {
    return type.value !== 'undefined'
  }

  function targetOrigin() {
    return get()?.getTargetOrigin() || '?'
  }

  function removeHookFromSessionStorage() {
    set(undefined)
  }

  function getRequiredRights(): string[] {
    return [
      'user_brief',
      'crm',
      'tasks',
      'entity'
    ]
  }

  return {
    buildLogger,
    init,
    get,
    set,
    isFrame,
    isInit,
    targetOrigin,
    removeHookFromSessionStorage,
    getRequiredRights
  }
}
