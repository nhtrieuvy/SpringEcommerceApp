const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  
  const host = process.env.HOST || 'localhost';
  const isNgrok = host.includes('ngrok');
  
  // Create appropriate target URL based on environment
  const targetUrl = isNgrok 
    ? 'https://38ed-2405-4802-813a-3050-18ef-9eaa-a3b9-da03.ngrok-free.app'
    : 'https://localhost:8080';
  
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