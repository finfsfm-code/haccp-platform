import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for Electron
  server: {
    host: '127.0.0.1', // Use the explicit IP address to avoid resolution issues
    open: true, // Automatically open the browser on start
  },
  resolve: {
    alias: {
      // Use URL constructor for robust path resolution in ESM, fixing module specifier errors.
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
})
