import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// API代理配置
const apiProxy = createProxyMiddleware({
    target: 'http://backend:6201',
    changeOrigin: true,
    onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(502).json({ error: 'Backend service unavailable' });
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to backend`);
    },
});

// 重要：API路由必须在静态文件服务之前定义
// 代理 /api 路径到后端 - 精确匹配
app.use('/api', apiProxy);

// 代理现有的API端点 - 精确匹配
app.use('/convert', apiProxy);
app.use('/progress', apiProxy);
app.use('/convert-word-to-markdown', apiProxy);
app.use('/convert-markdown-to-word', apiProxy);

// 静态文件服务 - 只处理静态资源
app.use(express.static(path.join(__dirname, 'dist'), {
    // 不处理任何以 /api 开头的路径
    setHeaders: (res, path, stat) => {
        // 为静态资源设置缓存头
        if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
            res.set('Cache-Control', 'public, max-age=31536000'); // 1年
        }
    }
}));

// SPA路由处理 - 这个必须放在最后
// 只有在没有匹配到API路由和静态文件时才返回index.html
app.get('*', (req, res) => {
    // 确保不是API路径
    if (req.path.startsWith('/api') ||
        req.path === '/convert' ||
        req.path === '/progress' ||
        req.path === '/convert-word-to-markdown' ||
        req.path === '/convert-markdown-to-word') {
        // 这些路径应该已经被代理处理，如果到这里说明后端不可用
        return res.status(502).json({ error: 'API endpoint not available' });
    }

    console.log(`Serving SPA for path: ${req.path}`);
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Frontend server running on port ${PORT}`);
    console.log(`API requests will be proxied to http://backend:6201`);
}); 