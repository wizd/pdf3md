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
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error' });
    },
});

// 代理 /api 路径到后端
app.use('/api', apiProxy);

// 代理现有的API端点
app.use('/convert', apiProxy);
app.use('/progress', apiProxy);
app.use('/convert-word-to-markdown', apiProxy);
app.use('/convert-markdown-to-word', apiProxy);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// SPA路由处理 - 所有未匹配的路由都返回index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
}); 