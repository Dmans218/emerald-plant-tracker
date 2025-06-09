const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const db = require('./database');
const plantsRouter = require('./routes/plants');
const logsRouter = require('./routes/logs');
const environmentRouter = require('./routes/environment');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - HTTP-optimized configuration for self-hosting
app.use(helmet({
  contentSecurityPolicy: false, // Disable Helmet's CSP entirely to avoid upgrade-insecure-requests
  crossOriginOpenerPolicy: false, // Disable COOP to avoid the header warning
  crossOriginEmbedderPolicy: false, // Disable COEP for better compatibility
  originAgentCluster: false, // Disable Origin-Agent-Cluster header
  hsts: false, // Disable HSTS/Strict-Transport-Security for HTTP serving
  hidePoweredBy: false, // Keep Express header for debugging
  crossOriginResourcePolicy: false, // Better compatibility for self-hosting
}));

// Add custom CSP header without upgrade-insecure-requests
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src-elem 'self' 'unsafe-inline'; " +
    "script-src-elem 'self' 'unsafe-inline'; " +
    "worker-src 'self' blob:; " +
    "child-src 'self' blob:; " +
    "img-src 'self' data: blob:; " +
    "connect-src 'self'; " +
    "font-src 'self' data:; " +
    "object-src 'none'; " +
    "media-src 'self'; " +
    "frame-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'self'; " +
    "script-src-attr 'none'"
    // NOTE: upgrade-insecure-requests is deliberately EXCLUDED for HTTP serving
  );
  next();
});
app.use(cors());
app.use(morgan('combined'));

// Middleware to ensure HTTP serving works properly
app.use((req, res, next) => {
  // Remove any headers that might force HTTPS
  res.removeHeader('Strict-Transport-Security');
  res.removeHeader('Origin-Agent-Cluster');
  res.removeHeader('Cross-Origin-Resource-Policy');
  
  // Override any problematic headers set by Helmet
  res.setHeader('Origin-Agent-Cluster', '?0');
  
  // Ensure proper protocol is used in responses
  res.locals.protocol = req.protocol;
  res.locals.host = req.get('host');
  
  // Add HTTP-only headers to prevent SSL errors
  res.setHeader('Referrer-Policy', 'same-origin');
  
  // Add aggressive cache-busting headers 
  if (req.path === '/' || req.path.endsWith('.html')) {
    // For HTML files, use very aggressive caching headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', 'Thu, 01 Jan 1970 00:00:00 GMT');
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.setHeader('ETag', Math.random().toString(36).substring(7));
  } else {
    // For other assets, use standard cache-busting
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - more generous for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // limit each IP to 200 requests per minute
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files (uploaded images)
app.use('/uploads', express.static(uploadsDir));

// Serve static files from React build
const clientBuildPath = path.join(__dirname, 'public');
if (fs.existsSync(clientBuildPath)) {
  // Serve static assets with proper headers for HTTP
  app.use(express.static(clientBuildPath, {
    setHeaders: (res, path) => {
      // Remove any HTTPS enforcement headers
      res.removeHeader('Strict-Transport-Security');
      // Set aggressive cache-busting headers for all files
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      if (path.endsWith('.html')) {
        res.setHeader('Last-Modified', new Date().toUTCString());
        res.setHeader('ETag', Math.random().toString(36).substring(7));
      }
    }
  }));
  
  // Serve index.html for any non-API, non-static route with proper headers
  app.get(/^\/(?!api|static|uploads).*/, (req, res) => {
    res.removeHeader('Strict-Transport-Security');
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Routes
app.use('/api/plants', plantsRouter);
app.use('/api/logs', logsRouter);
app.use('/api/environment', environmentRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize database and start server
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`🌿 Emerald Plant Tracker API running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});