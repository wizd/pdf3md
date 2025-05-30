process.on('uncaughtException', (err, origin) => {
    console.error('--- UNCAUGHT EXCEPTION ---');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Origin:', origin);
    console.error('Error Message:', err.message);
    console.error('Error Name:', err.name);
    console.error('Error Stack:', err.stack);
    process.stderr.write(`UNCAUGHT EXCEPTION: Origin - ${origin}, Message - ${err.message}\n`);
    // It's generally recommended to exit the process after an uncaught exception
    // process.exit(1); // Consider enabling this in production after thorough testing
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('--- UNHANDLED PROMISE REJECTION ---');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Reason:', reason);
    // console.error('Promise:', promise); // Can be verbose
    process.stderr.write(`UNHANDLED REJECTION: Reason - ${reason}\n`);
});

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const http = require('http'); // Added for direct backend test

const app = express();
// PORT an ENV var set in Dockerfile.frontend, default to 6202 if not set for local testing
const port = process.env.PORT || 6202;
// 'backend' is the service name in docker-compose.yml
const backendServiceUrl = 'http://backend:6201';

console.log(`Frontend server starting on port: ${port}`);
console.log(`Backend service URL for proxy: ${backendServiceUrl}`);

// Custom logger for /convert to test request flow and logging
app.use('/convert', (req, res, next) => {
    console.log(`[CUSTOM LOGGER FOR /convert] Request received: ${req.method} ${req.originalUrl} at ${new Date().toISOString()}`);
    process.stdout.write('[CUSTOM LOGGER FOR /convert] Request reached here (stdout)\n');
    next();
});

// --- Explicit HPM setup for /convert --- 
const convertProxyOptions = {
    target: backendServiceUrl,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        const targetPath = `${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`;
        const logMessage = `[HPM Event onProxyReq for /convert] Original: ${req.method} ${req.originalUrl} ---> Target: ${proxyReq.method} ${targetPath}`;
        console.log(logMessage);
        process.stdout.write(logMessage + '\n');
    },
    onError: (err, req, res, target) => {
        console.error('--- PROXY ERROR HANDLER (for /convert) ---');
        process.stderr.write('--- PROXY ERROR HANDLER (for /convert) (stderr) ---\n');
        console.error('Timestamp:', new Date().toISOString());
        console.error('Original Request URL:', req.method, req.originalUrl);
        console.error('Error Message:', err.message);
        // ... (rest of onError remains the same)
        if (res.headersSent) {
            console.error('Headers were already sent. Cannot send JSON error response.');
            if (!res.writableEnded) res.end();
            return;
        }
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Proxy error for /convert', error: err.message, code: err.code }));
    },
    onProxyRes: (proxyRes, req, res) => { // Added for completeness
        console.log(`[HPM Event onProxyRes for /convert] Received response status: ${proxyRes.statusCode} for ${req.originalUrl}`);
    }
};
console.log(`[PROXY SETUP DEBUG] Setting up explicit proxy for /convert to target: ${convertProxyOptions.target}`);
app.use('/convert', createProxyMiddleware(convertProxyOptions));
// --- End of explicit HPM setup for /convert ---

// API routes that need to be proxied to the backend (excluding /convert as it's handled above)
const 나머지ApiRoutes = [
// '/convert', // Handled explicitly above
    '/progress',
    '/convert-word-to-markdown',
    '/convert-markdown-to-word'
];

// Setup proxy middleware for each API route
나머지ApiRoutes.forEach(route => {
    console.log(`[PROXY SETUP] Attempting to register proxy for route: "${route}"`);
    if (typeof route !== 'string' || route.includes(':')) {
        console.error(`[PROXY SETUP ERROR] Invalid route detected: "${route}". Skipping.`);
        return;
    }

    const 일반ProxyOptions = {
        target: backendServiceUrl,
        changeOrigin: true,
        onProxyReq: (proxyReq, req, res) => {
            const targetPath = `${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`;
            const logMessage = `[HPM Event onProxyReq for ${route}] Original: ${req.method} ${req.originalUrl} ---> Target: ${proxyReq.method} ${targetPath}`;
            console.log(logMessage);
            process.stdout.write(logMessage + '\n');
        },
        onError: (err, req, res, target) => {
            console.error(`--- PROXY ERROR HANDLER (for ${route}) ---`);
            process.stderr.write(`--- PROXY ERROR HANDLER (for ${route}) (stderr) ---\n`);
            // ... (similar onError structure)
            if (res.headersSent) { res.end(); return; }
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: `Proxy error for ${route}`, error: err.message, code: err.code }));
        }
    };
    app.use(route, createProxyMiddleware(일반ProxyOptions));
    console.log(`[PROXY SETUP] Proxy for route "${route}" to "${backendServiceUrl}" is active.`);
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

// Global Express error handler
app.use((err, req, res, next) => {
    console.error('--- GLOBAL EXPRESS ERROR HANDLER CAUGHT AN ERROR ---');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Route:', req.method, req.originalUrl);
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code); // May not always be present
    console.error('Error Stack:', err.stack);
    process.stderr.write(`Global Express Error: Message - ${err.message}, Code - ${err.code || 'N/A'}\n`);

    if (res.headersSent) {
        console.error('Global handler: Headers already sent. Delegating to default Express error handler.');
        return next(err);
    }
    res.status(err.status || 500).json({
        message: 'Global error handler: An unexpected error occurred on the server. Check server logs.',
        errorDetail: err.message,
        errorCode: err.code
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Frontend server is live on http://0.0.0.0:${port}`);
    console.log('Proxying API requests:');
    나머지ApiRoutes.forEach(route => {
        console.log(`  ${route} -> ${backendServiceUrl}${route}`);
    });
    console.log(`Serving static files from ${path.join(__dirname, 'dist')}`);
}); 