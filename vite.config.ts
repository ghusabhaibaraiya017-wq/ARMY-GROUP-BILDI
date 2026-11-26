import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/ARMY-GROUP-BILDI/' : '/',
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: [],
    manifest: {
      name: 'ARMY GROUP BILDI',
      short_name: 'AGB',
      description: 'માહિતી દરેક માટે, દરેક ભાષામાં, દરરોજ.',
      theme_color: '#102b50',
      background_color: '#fffaf2',
      display: 'standalone',
      start_url: '/',
      icons: []
    }
  })]
})