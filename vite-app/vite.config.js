import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to '/arpit/' for GitHub Pages (github.com/arpitagarwala/arpit)
// Change to '/' if using a custom domain like arpitagarwala.online
export default defineConfig({
  plugins: [react()],
  base: '/',  // Use '/' for custom domain deploy; '/arpit/' for github.io subpath
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
