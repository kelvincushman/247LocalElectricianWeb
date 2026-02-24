// Production server that serves static files and proxies API requests
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8084;
const API_PORT = process.env.API_PORT || 3247;

// Proxy API requests to the backend server
// Note: pathFilter with no pathRewrite keeps the full path including /api
const apiProxy = createProxyMiddleware({
  target: `http://localhost:${API_PORT}`,
  changeOrigin: true,
  pathFilter: '/api',
});

// Proxy uploads requests
const uploadsProxy = createProxyMiddleware({
  target: `http://localhost:${API_PORT}`,
  changeOrigin: true,
  pathFilter: '/uploads',
});

app.use(apiProxy);
app.use(uploadsProxy);

// Serve dynamic sitemap from API
app.get('/sitemap.xml', createProxyMiddleware({
  target: `http://localhost:${API_PORT}`,
  changeOrigin: true,
  pathRewrite: { '^/sitemap.xml': '/api/sitemap.xml' },
}));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing - serve index.html for all non-API routes
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`247Electrician production server running on port ${PORT}`);
  console.log(`Proxying API requests to localhost:${API_PORT}`);
});
