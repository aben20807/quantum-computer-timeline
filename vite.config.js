import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// For GitHub Pages deployment, we need to set the correct base path
// This should match your repository name - update it if your repository
// has a different name than "quantum-computer-timeline"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ? '/quantum-computer-timeline/' : '/',
  
  // Ensure static assets are handled correctly
  publicDir: 'public',
  build: {
    assetsDir: 'assets',
    // Explicitly copy files from public to dist
    copyPublicDir: true,
    // Add this to help with debugging
    sourcemap: true
  }
})
