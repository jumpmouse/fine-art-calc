module.exports = {
  globDirectory: 'dist',
  globPatterns: [
    '**/*.{html,js,css,png,svg,ico,json,ttf,woff,woff2}'
  ],
  swDest: 'dist/sw.js',
  clientsClaim: true,
  skipWaiting: true,
  navigateFallback: '/index.html',
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: { cacheName: 'pages' }
    },
    {
      urlPattern: /^https:\/\/(fonts\.googleapis|fonts\.gstatic)\.com\//,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'google-fonts' }
    }
  ]
};
