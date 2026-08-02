import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('echarts') || id.includes('vue-echarts')) {
            return 'vendor-echarts'
          }

          if (id.includes('primevue') || id.includes('@primeuix')) {
            return 'vendor-primevue'
          }

          if (id.includes('vee-validate') || id.includes('zod')) {
            return 'vendor-forms'
          }

          return 'vendor'
        },
      },
    },
  },
})
