import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './public/manifest.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), crx({ manifest })],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 443,
    },
    proxy: {
      '/google-suggest': {
        target: 'https://suggestqueries.google.com',
        changeOrigin: true,
        rewrite: path => path.replace('/google-suggest', ''),
      },
    },
  },
})
