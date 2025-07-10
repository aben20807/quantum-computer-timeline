import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Get repository name from package.json for GitHub Pages base path
// This assumes your repository name is "QPU"
// If your repo has a different name, you'll need to modify this

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ? '/QPU/' : '/',
})
