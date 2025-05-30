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
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
            if (res && typeof res.writeHead === 'function') {
              res.writeHead(500, {
                'Content-Type': 'text/plain',
              });
              res.end('Something went wrong with the proxy. ' + err.message);
            } else if (res && typeof res.end === 'function') {
              // If res.writeHead is not available (e.g. in some error scenarios)
              res.end('Proxy error: ' + err.message);
            }
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`[HPM] Proxying request: ${req.method} ${req.url} -> ${options.target.href}${proxyReq.path}`);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`[HPM] Received response from target: ${proxyRes.statusCode} ${req.url}`);
          });
        },
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
