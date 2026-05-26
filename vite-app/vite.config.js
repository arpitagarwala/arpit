import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Change to '/arpit/' if deploying to GitHub Pages under a subpath
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
