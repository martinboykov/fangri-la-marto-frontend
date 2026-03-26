// Simple static file server for Railway deployment
// Serves the Angular build output (www/) with SPA fallback
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4200;
const DIST = path.join(__dirname, 'www');

app.use(express.static(DIST, { maxAge: '1y', etag: false }));

// SPA fallback — all routes return index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Frontend] Serving on port ${PORT}`);
});
