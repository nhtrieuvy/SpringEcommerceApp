const { createProxyMiddleware } = require('http-proxy-middleware');

const PROXY_PATH = '/SpringEcommerceApp';
const DEFAULT_BACKEND_URL = 'https://springecommerceapp.fly.dev';
const DEFAULT_NGROK_URL = 'https://38ed-2405-4802-813a-3050-18ef-9eaa-a3b9-da03.ngrok-free.app';

module.exports = function (app) {
  const host = process.env.HOST || 'localhost';
  const isNgrok = host.includes('ngrok');
  const backendUrl = process.env.BACKEND_URL;

  const targetUrl = backendUrl || (isNgrok ? DEFAULT_NGROK_URL : DEFAULT_BACKEND_URL);

  console.log(`[proxy] ${PROXY_PATH} -> ${targetUrl}`);

  app.use(
    PROXY_PATH,
    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      secure: false,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
      onError: (err) => {
        console.error('[proxy] Error:', err);
      },
      onProxyReq: (proxyReq, req) => {
        console.log(`[proxy] ${req.method} ${proxyReq.path}`);
      }
    })
  );
};