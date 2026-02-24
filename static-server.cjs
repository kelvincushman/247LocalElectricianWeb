const express = require('express');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8084;
const API_URL = process.env.API_URL || 'http://localhost:3247';
const server = http.createServer(app);

// Trust proxy for Cloudflare
app.set('trust proxy', true);

// Redirect www to non-www and HTTP to HTTPS (only for non-API requests behind proxy)
app.use((req, res, next) => {
  // Skip redirects for API requests
  if (req.path.startsWith('/api')) {
    return next();
  }

  const host = req.get('host') || '';
  const forwardedProto = req.get('X-Forwarded-Proto');

  // Redirect www to non-www
  if (host.startsWith('www.')) {
    return res.redirect(301, `https://247electrician.uk${req.originalUrl}`);
  }

  // Redirect HTTP to HTTPS only when behind reverse proxy (has X-Forwarded-Proto header)
  if (forwardedProto === 'http') {
    return res.redirect(301, `https://${host}${req.originalUrl}`);
  }

  next();
});

// Proxy sitemap.xml to API server
app.get('/sitemap.xml', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  pathRewrite: { '^/sitemap.xml': '/api/sitemap.xml' }
}));

// Proxy /api requests to the API server
// Note: When mounted at '/api', express strips the prefix, so we prepend it back
app.use('/api', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  pathRewrite: (path) => '/api' + path,
  // Forward cookies and headers properly
  xfwd: true,
  cookieDomainRewrite: '',
  onProxyReq: (proxyReq, req) => {
    // Forward cookies
    if (req.headers.cookie) {
      proxyReq.setHeader('Cookie', req.headers.cookie);
    }
    // Forward protocol info for secure cookies
    const proto = req.headers['x-forwarded-proto'] || 'https';
    proxyReq.setHeader('X-Forwarded-Proto', proto);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log response for debugging
    console.log('Proxy response:', req.method, '/api' + req.path, proxyRes.statusCode);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(502).json({ error: 'API server unavailable' });
  }
}));

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing - serve index.html for all other routes
app.use((req, res, next) => {
  // Skip API routes (handled by proxy)
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// WebSocket proxy for /ws/gateway
const wsProxy = createProxyMiddleware({
  target: API_URL.replace('http', 'ws'),
  ws: true,
  changeOrigin: true,
});

server.on('upgrade', (req, socket, head) => {
  if (req.url === '/ws/gateway') {
    wsProxy.upgrade(req, socket, head);
  }
});

server.listen(PORT, () => {
  console.log(`Static server running on port ${PORT}`);
  console.log(`Proxying /api to ${API_URL}`);
  console.log(`WebSocket proxy /ws/gateway to ${API_URL}`);
});
