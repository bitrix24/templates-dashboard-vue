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
        colorModeInitialValue: 'auto',
        // @memo set in `index.html` too
        colorModeTypeLight: 'light', // light | edge-dark
        colorModeStorageKey: 'bitrix24-ui-template-dashboard-vue'
      }),
      {
        // Bitrix24 embeds the app/install pages by POSTing to the page URL.
        // The dev server only serves the SPA over GET, so rewrite POST -> GET,
        // but ONLY for top-level HTML document navigations — never for API/XHR
        // or asset POSTs, so real POST payloads are not silently turned into GETs.
        name: 'b24-document-post-to-get-rewriter',
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            const accept = Array.isArray(req.headers.accept)
              ? req.headers.accept.join(',')
              : (req.headers.accept ?? '')
            const isDocumentNavigation = accept.includes('text/html')
            if (req.method === 'POST' && isDocumentNavigation) {
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
