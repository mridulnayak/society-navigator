import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Silently updates the app in the background when you release new versions
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Dhebar Navigator',
        short_name: 'DhebarNav',
        description: 'Offline-ready Society Navigation Engine',
        theme_color: '#020617', // Tailwind slate-950 to match your UI
        background_color: '#020617',
        display: 'standalone', // Hides the browser URL bar so it looks like a real native app!
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/854/854878.png', // Temporary placeholder icon
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            // 🗺️ RULE 1: CACHE THE MAP TILES (Basement Mode)
            urlPattern: /^https:\/\/.*\.basemaps\.cartocdn\.com\/.*/i,
            handler: 'CacheFirst', // If offline, load map instantly from phone memory
            options: {
              cacheName: 'map-tiles-cache',
              expiration: {
                maxEntries: 1000, // Store up to 1000 map squares
                maxAgeSeconds: 60 * 60 * 24 * 30 // Keep them for 30 days
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // 📡 RULE 2: CACHE THE PLOT DATABASE
            urlPattern: /^http:\/\/localhost:5000\/api\/plots/i,
            handler: 'NetworkFirst', // Try getting live data first, but if in basement, use yesterday's saved data!
            options: {
              cacheName: 'plot-data-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 // Keep for 1 day
              }
            }
          }
        ]
      }
    })
  ]
})

// scr/components/layout
// scr/components/ui
// src/features/resident/components