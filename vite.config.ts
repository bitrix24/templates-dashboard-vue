import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueRouter from 'vue-router/vite'
import vueLayouts from 'vite-plugin-vue-layouts'
import bitrix24UIPluginVite  from '@bitrix24/b24ui-nuxt/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const extraAllowedHosts = (env?.VITE_ALLOWED_HOSTS?.split(',').map((s: string) => s.trim()).filter(Boolean)) ?? []

  return {
    plugins: [
      vueRouter({
        dts: 'src/route-map.d.ts'
      }),
      vueLayouts(),
      vue(),
      bitrix24UIPluginVite ({
        colorMode: true,
        colorModeInitialValue: 'light',
        colorModeTypeLight: 'light',
        colorModeStorageKey: 'bitrix24-ui-template-dashboard-vue'
      }),
      {
        name: 'global-post-to-get-rewriter',
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            if (req.method === 'POST') {
              req.method = 'GET'
            }
            next()
          })
        }
      }
    ],
    server: {
      // Fix: "Blocked request. This host is not allowed" when using tunnels like ngrok
      allowedHosts: [...extraAllowedHosts]
    }
  }
})
