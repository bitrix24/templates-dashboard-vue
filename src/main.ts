import './assets/css/main.css'
import type { RouteRecordRaw } from 'vue-router'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { i18n } from './i18n'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'
import { setupLayouts } from 'virtual:generated-layouts'
import b24UiPlugin from '@bitrix24/b24ui-nuxt/vue-plugin'

import App from './App.vue'

const app = createApp(App)

const basePath = import.meta.env.BASE_URL || '/'
const router = createRouter({
  routes: setupLayouts(routes as RouteRecordRaw[]),
  history: createWebHistory(basePath)
})

app.use(router)
app.use(i18n)
app.use(b24UiPlugin)

app.mount('#app')

// This will update routes at runtime without reloading the page
if (import.meta.hot) {
  handleHotUpdate(router)
}
