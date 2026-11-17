/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { seoLanding } from './seo/landing.ts'

/** Runs api/relay.ts inside `npm run dev`, so the app works locally without the Vercel CLI. */
function relayDev(): Plugin {
  return {
    name: 'relay-dev',
    configureServer(server) {
      server.middlewares.use('/api/relay', async (req, res) => {
        const mod = await server.ssrLoadModule('/api/relay.ts')
        const headers = new Headers()
        for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v)
        const response: Response = await mod.GET(new Request('http://' + (req.headers.host || 'localhost') + req.originalUrl, { headers }))
        res.statusCode = response.status
        response.headers.forEach((v, k) => res.setHeader(k, v))
        res.end(Buffer.from(await response.arrayBuffer()))
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    relayDev(),
    seoLanding(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Space Feed',
        short_name: 'Space Feed',
        description: 'Un feed tranquilo que se acaba: buenas noticias, ciencia y vídeos tranquilos.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F7F3EA',
        theme_color: '#1E2952',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
  },
})
