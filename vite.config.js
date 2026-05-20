import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: {
        // 預快取程式碼與吉祥物動畫(webp)，但不含 22MB 的景點照片(jpg)
        globPatterns: ['**/*.{js,css,html,svg,webmanifest,webp}'],
        // 改成第一次瀏覽時才快取，之後可離線看
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/photos/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'spot-photos',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
        ],
      },
      manifest: {
        name: '澎湖五日團',
        short_name: '澎湖五日團',
        description: '團體旅遊行程、景點與分攤記帳',
        theme_color: '#1098f0',
        background_color: '#f5f6f8',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
