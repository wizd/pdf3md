import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'log-all-requests',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          console.log(`[Vite Server Request Pre-Proxy]: ${req.method} ${req.url}`);
          // Check if the request URL might be handled by SPA fallback too early
          if (req.url === '/convert' && req.headers.accept && req.headers.accept.includes('text/html')) {
            console.warn(`[Vite Server Warning]: Request for '/convert' is asking for HTML. This might trigger SPA fallback before proxy.`);
          }
          next();
        });
      },
    }
  ],
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
            console.error('[HPM] Proxy error:', err);
            if (res && typeof res.writeHead === 'function') {
              res.writeHead(500, {
                'Content-Type': 'text/plain',
              });
              res.end('Something went wrong with the proxy. ' + err.message);
            } else if (res && typeof res.end === 'function') {
              res.end('[HPM] Proxy error: ' + err.message);
            }
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`[HPM] Proxying request: ${req.method} ${req.originalUrl} -> ${options.target.href}${proxyReq.path}`);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`[HPM] Received response from target: ${proxyRes.statusCode} ${req.originalUrl}`);
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
