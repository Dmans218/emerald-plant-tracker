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

// Middleware - Security configuration optimized for HTTP self-hosting
app.use(helmet({
  contentSecurityPolicy: false, // Disable Helmet's CSP - we'll add our own
  crossOriginOpenerPolicy: false, // Disable COOP for better compatibility
  crossOriginEmbedderPolicy: false, // Disable COEP for better compatibility
  originAgentCluster: false, // Disable Origin-Agent-Cluster header
  hsts: false, // Disable HSTS for HTTP serving
  hidePoweredBy: true, // Hide Express header for security
  crossOriginResourcePolicy: false, // Better compatibility for self-hosting
}));

// Custom CSP header optimized for HTTP serving (no upgrade-insecure-requests)
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self' http: https:; " +
    "style-src 'self' 'unsafe-inline' http: https:; " +
    "script-src 'self' http: https: 'unsafe-eval'; " +
    "script-src-elem 'self' http: https: cdn.jsdelivr.net; " +
    "worker-src 'self' blob: data: https: cdn.jsdelivr.net; " +
    "img-src 'self' data: blob: http: https:; " +
    "connect-src 'self' http: https:; " +
    "font-src 'self' data: http: https:; " +
    "object-src 'none'; " +
    "media-src 'self' http: https:; " +
    "frame-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'self'"
    // NOTE: upgrade-insecure-requests is deliberately EXCLUDED for HTTP serving
  );
  
  // Explicitly remove any HTTPS enforcement headers that might be added elsewhere
  res.removeHeader('Strict-Transport-Security');
  res.removeHeader('upgrade-insecure-requests');
  
  // Add headers to help with HTTP serving
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  next();
});

// CORS configuration - secure but allows both HTTP and HTTPS
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from localhost on common ports for both HTTP and HTTPS
    const allowedOrigins = [
      'http://localhost:420',
      'https://localhost:420',
      'http://localhost:3000',
      'https://localhost:3000',
      'http://127.0.0.1:420',
      'https://127.0.0.1:420'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
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
// In Docker: frontend build is copied to ./public
// In development: frontend build is at ../frontend/build
const clientBuildPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'public')
  : path.join(__dirname, '..', 'frontend', 'build');

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