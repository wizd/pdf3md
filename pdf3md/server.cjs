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

    // Direct backend connectivity test
    const backendTestUrl = `${backendServiceUrl}/convert`; // Assuming /convert is a valid GET endpoint on backend for testing
    console.log(`[BACKEND TEST] Attempting direct GET to: ${backendTestUrl}`);
    const backendRequest = http.get(backendTestUrl, (backendRes) => {
        let data = '';
        console.log(`[BACKEND TEST] STATUS: ${backendRes.statusCode}`);
        console.log(`[BACKEND TEST] HEADERS: ${JSON.stringify(backendRes.headers)}`);
        backendRes.on('data', (chunk) => { data += chunk; });
        backendRes.on('end', () => {
            console.log('[BACKEND TEST] Successfully connected to backend. Response length:', data.length);
            // next(); // Proceed only if test is successful, or remove test for production
        });
    }).on('error', (e) => {
        console.error(`[BACKEND TEST] ERROR connecting to backend: ${e.message}`);
        console.error(`[BACKEND TEST] Error Code: ${e.code}`);
        console.error('[BACKEND TEST] Error Stack:', e.stack);
        // Do not call next() if backend test fails, or handle error appropriately
        // Potentially send an immediate error response to client if this test is critical
        // For now, we will still call next() to let HPM try, but we have logged the failure.
    });
    backendRequest.setTimeout(5000, () => { // 5 second timeout for the test
        console.error('[BACKEND TEST] Timeout connecting to backend.');
        backendRequest.destroy(); // or backendRequest.abort() in newer Node versions
    });

    next(); // Call next() immediately for now to allow HPM to proceed regardless of test outcome
});

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

    const proxyOptions = {
        target: backendServiceUrl,
        changeOrigin: true,
        logLevel: 'debug', // Ensure this is active
        onError: (err, req, res, target) => {
            console.error('--- PROXY ERROR HANDLER CAUGHT AN ERROR ---');
            console.error('Timestamp:', new Date().toISOString());
            console.error('Original Request URL:', req.method, req.originalUrl);
            // 'target' argument might be a URL object or undefined
            console.error('Configured Proxy Target:', backendServiceUrl);
            if (target && typeof target.href === 'string') {
                console.error('Actual Target URL for this request (from HPM):', target.href);
            } else if (target) {
                console.error('Actual Target URL for this request (from HPM):', target);
            } else {
                console.error('Actual Target URL for this request (from HPM): Not available');
            }
            console.error('Error Message:', err.message);
            console.error('Error Code:', err.code);
            console.error('Error Stack:', err.stack);
            process.stderr.write(`Explicit STDERR Proxy Error Log: Message - ${err.message}, Code - ${err.code}\n`);

            if (res.headersSent) {
                console.error('Headers were already sent. Cannot send JSON error response. Ending response if possible.');
                if (!res.writableEnded) {
                    res.end();
                }
                return;
            }
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: 'Proxying failed. See server logs for more details.',
                error: err.message,
                code: err.code
            }));
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`[HPM Event - onProxyReq] Proxying request: ${req.method} ${req.originalUrl} -> ${proxyReq.method} ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
            console.log(`[HPM Event - onProxyReq] Proxy request headers:`, JSON.stringify(proxyReq.getHeaders(), null, 2));
        },
        onProxyRes: (proxyRes, req, res) => {
            console.log(`[HPM Event - onProxyRes] Received response from target for: ${req.originalUrl}`);
            console.log(`[HPM Event - onProxyRes] Target response status: ${proxyRes.statusCode}`);
            // console.log(`[HPM Event - onProxyRes] Target response headers:`, JSON.stringify(proxyRes.headers, null, 2));
        }
    };

    app.use(route, createProxyMiddleware(proxyOptions));
    console.log(`[PROXY SETUP] Proxy for route "${route}" to "${backendServiceUrl}" with enhanced logging is active.`);
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
    apiRoutes.forEach(route => {
        console.log(`  ${route} -> ${backendServiceUrl}${route}`);
    });
    console.log(`Serving static files from ${path.join(__dirname, 'dist')}`);
}); 