const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
// PORT an ENV var set in Dockerfile.frontend, default to 6202 if not set for local testing
const port = process.env.PORT || 6202;
// 'backend' is the service name in docker-compose.yml
const backendServiceUrl = 'http://backend:6201';

console.log(`Frontend server starting on port: ${port}`);
console.log(`Backend service URL for proxy: ${backendServiceUrl}`);

// API routes that need to be proxied to the backend
const apiRoutes = [
    '/convert',
    '/progress',
    '/convert-word-to-markdown',
    '/convert-markdown-to-word'
];

// Setup proxy middleware for each API route
apiRoutes.forEach(route => {
    console.log(`[PROXY SETUP] Attempting to register proxy for route: "${route}"`); // Diagnostic log
    if (typeof route !== 'string' || route.includes(':')) { // Additional check
        console.error(`[PROXY SETUP ERROR] Invalid route detected: "${route}". Skipping.`);
        return;
    }
    app.use(route, createProxyMiddleware({
        target: backendServiceUrl,
        changeOrigin: true, // Important for virtual hosted sites
        logLevel: 'debug', // Enable for more proxy diagnostics
        onError: (err, req, res) => {
            console.error('Proxy error:', err);
            if (!res.headersSent) {
                res.writeHead(500, {
                    'Content-Type': 'application/json'
                });
            }
            res.end(JSON.stringify({ message: 'Proxy error', error: err.message }));
        }
    }));
});

// Serve static files from the 'dist' folder (Vite's build output)
const staticFilesPath = path.join(__dirname, 'dist');
console.log(`Serving static files from: ${staticFilesPath}`);
app.use(express.static(staticFilesPath));

// SPA fallback: For any other request, serve index.html.
// This is crucial for client-side routing to work correctly on page refresh or direct navigation.
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    console.log(`SPA fallback: serving ${indexPath} for ${req.path}`);
    res.sendFile(indexPath);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Frontend server is live on http://0.0.0.0:${port}`);
    console.log('Proxying API requests:');
    apiRoutes.forEach(route => {
        console.log(`  ${route} -> ${backendServiceUrl}${route}`);
    });
    console.log(`Serving static files from ${path.join(__dirname, 'dist')}`);
}); 