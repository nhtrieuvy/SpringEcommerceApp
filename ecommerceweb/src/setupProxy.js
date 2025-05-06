const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/SpringEcommerceApp-1.0-SNAPSHOT',
    createProxyMiddleware({
      target: 'https://localhost:8443',
      changeOrigin: true,
      secure: false,
      // Add support for all HTTP methods
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
      // Add better error handling
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
      },
      // Add logging for debugging
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: ${req.method} ${proxyReq.path}`);
      }
    })
  );
};