const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    createProxyMiddleware('/grammer-check', {
      target: 'https://spell-checker.co.kr',
      changeOrigin: true,
    }),
  );
};
