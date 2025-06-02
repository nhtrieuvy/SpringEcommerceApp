const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  
  const host = process.env.HOST || 'localhost';
  const isNgrok = host.includes('ngrok');
  
  // Create appropriate target URL based on environment
  const targetUrl = isNgrok 
    ? 'https://d0d3-2405-4802-37-ca00-5cb4-2712-7f6b-9f68.ngrok-free.app'
    : 'https://localhost:8443';
  
  console.log(`Setting up proxy with target: ${targetUrl}`);
  
  app.use(
    '/SpringEcommerceApp-1.0-SNAPSHOT',
    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      secure: false,
     
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
     
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
      },
      
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: ${req.method} ${proxyReq.path}`);
      }
    })
  );
};