import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the backend server
      '/convert': {
        target: 'http://backend:6201',
        changeOrigin: true,
      },
      '/progress': {
        target: 'http://backend:6201',
        changeOrigin: true,
      },
      '/convert-word-to-markdown': {
        target: 'http://backend:6201',
        changeOrigin: true,
      },
      '/convert-markdown-to-word': {
        target: 'http://backend:6201',
        changeOrigin: true,
      },
    },
    host: '0.0.0.0', // Allow external access
  },
})
