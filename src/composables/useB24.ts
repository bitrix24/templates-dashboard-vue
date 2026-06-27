import type { B24FrameQueryParams, LoggerInterface } from '@bitrix24/b24jssdk'
import { ref, nextTick } from 'vue'
import { B24Frame, LoggerFactory, Result, SdkError, initializeB24Frame, useB24Helper, LoadDataType } from '@bitrix24/b24jssdk'

// Helper instance type derived from the SDK (B24HelperManager is not exported directly).
type B24HelperData = ReturnType<ReturnType<typeof useB24Helper>['getB24Helper']>

let $b24: undefined | B24Frame = undefined
let $b24Helper: undefined | B24HelperData = undefined
const type = ref<'undefined' | 'B24Frame'>('undefined')

export const useB24 = () => {
  const b24Config = {}

  const { initB24Helper, getB24Helper } = useB24Helper()

  function buildLogger(loggerTitle?: string): LoggerInterface {
    const devMode = typeof import.meta !== 'undefined' && import.meta.env?.DEV
    return LoggerFactory.createForBrowser(loggerTitle ?? 'dashBoard', devMode)
  }

  function get() {
    return $b24
  }

  /**
   * Returns the initialized B24Frame or throws if it is not ready yet.
   *
   * Use this instead of `get() as B24Frame` at call sites: it avoids capturing
   * an `undefined` frame during setup (before `init()` resolves) and fails loudly
   * with a clear error rather than a cryptic property access on `undefined`.
   */
  function getFrame(): B24Frame {
    if (!($b24 instanceof B24Frame)) {
      throw new SdkError({
        code: 'B24_NOT_INITIALIZED',
        description: 'Bitrix24 frame is not initialized yet',
        status: 500
      })
    }
    return $b24
  }

  function getHelper(): B24HelperData | undefined {
    return $b24Helper
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
      const b24 = await initializeB24Frame(b24Config)
      await initB24Helper(
        b24,
        [
          LoadDataType.App,
          LoadDataType.Profile,
          LoadDataType.Currency
          // LoadDataType.AppOptions
          // LoadDataType.UserOptions
        ]
      )

      $b24Helper = getB24Helper()
      return set(b24)
    } catch (error) {
      // `JSSDK_CLIENT_SIDE_WARNING` is the expected case when the app is opened
      // outside the Bitrix24 frame (the install page guides the user from here).
      // Anything else is a real failure and must not be swallowed silently.
      if (!(error instanceof SdkError && error.code === 'JSSDK_CLIENT_SIDE_WARNING')) {
        buildLogger('useB24.init').error(error instanceof Error ? error.message : String(error))
      }
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
    getFrame,
    getHelper,
    set,
    isFrame,
    isInit,
    targetOrigin,
    removeHookFromSessionStorage,
    getRequiredRights
  }
}
