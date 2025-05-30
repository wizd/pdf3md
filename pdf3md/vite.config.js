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
        secure: false,
        logLevel: 'debug',
      },
      '/progress': {
        target: 'http://backend:6201',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
      '/convert-word-to-markdown': {
        target: 'http://backend:6201',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
      '/convert-markdown-to-word': {
        target: 'http://backend:6201',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
    },
    host: '0.0.0.0', // Allow external access
  },
})
