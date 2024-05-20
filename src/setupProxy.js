const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    createProxyMiddleware('/', {
      target: 'https://spell-checker.co.kr',
      changeOrigin: true,
    }),
  );
  app.use(
    createProxyMiddleware('/', {
      target: 'http://spell-checker.co.kr',
      changeOrigin: true,
    }),
  );
  app.use(
    createProxyMiddleware('/grammer-check', {
      target: 'https://api.spell-checker.co.kr',
      changeOrigin: true,
    }),
  );
  app.use(
    createProxyMiddleware('/grammer-check', {
      target: 'http://api.spell-checker.co.kr',
      changeOrigin: true,
    }),
  );
};
