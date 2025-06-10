const express = require('express');
const cors = require('cors');
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
const PORT = process.env.PORT || 420;

// Enhanced CORS configuration for self-hosted Docker
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:420', 
    'http://192.168.1.221:420',
    'http://192.168.1.221',
    'http://127.0.0.1:420'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(morgan('combined'));

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
  // Serve static assets with cache-busting headers
  app.use(express.static(clientBuildPath, {
    setHeaders: (res, path) => {
      // Set cache-busting headers for all files
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      if (path.endsWith('.html')) {
        res.setHeader('Last-Modified', new Date().toUTCString());
        res.setHeader('ETag', Math.random().toString(36).substring(7));
      }
    }
  }));
  
  // Serve index.html for any non-API, non-static route
  app.get(/^\/(?!api|static|uploads).*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Routes
app.use('/api/plants', plantsRouter);
app.use('/api/logs', logsRouter);
app.use('/api/environment', environmentRouter);

// Health check with database connectivity
app.get('/api/health', (req, res) => {
  const database = db.getDb();
  
  if (!database) {
    return res.status(503).json({ 
      status: 'ERROR', 
      database: 'disconnected',
      timestamp: new Date().toISOString() 
    });
  }
  
  // Test database connectivity
  database.get('SELECT 1 as test', (err, row) => {
    if (err) {
      console.error('❌ Database health check failed:', err);
      return res.status(503).json({ 
        status: 'ERROR', 
        database: 'error',
        error: err.message,
        timestamp: new Date().toISOString() 
      });
    }
    
    // Also check if plants table exists
    database.get("SELECT name FROM sqlite_master WHERE type='table' AND name='plants'", (err, table) => {
      if (err) {
        return res.status(503).json({ 
          status: 'ERROR', 
          database: 'connected',
          tables: 'error',
          error: err.message,
          timestamp: new Date().toISOString() 
        });
      }
      
      res.json({ 
        status: 'OK', 
        database: 'connected',
        tables: table ? 'initialized' : 'missing',
        timestamp: new Date().toISOString() 
      });
    });
  });
});

// Debug endpoint for database info
app.get('/api/debug/database', (req, res) => {
  const dbPath = process.env.DATABASE_URL || path.join(__dirname, 'data', 'emerald-plant-tracker.db');
  const dataDir = path.dirname(dbPath);
  
  const debugInfo = {
    database_path: dbPath,
    data_directory: dataDir,
    data_dir_exists: fs.existsSync(dataDir),
    database_file_exists: fs.existsSync(dbPath),
    working_directory: __dirname,
    process_user: process.getuid ? process.getuid() : 'unknown',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  };
  
  // Try to get file stats if database exists
  if (debugInfo.database_file_exists) {
    try {
      const stats = fs.statSync(dbPath);
      debugInfo.database_size = stats.size;
      debugInfo.database_modified = stats.mtime;
    } catch (err) {
      debugInfo.database_stats_error = err.message;
    }
  }
  
  // Try to list data directory contents
  if (debugInfo.data_dir_exists) {
    try {
      debugInfo.data_dir_contents = fs.readdirSync(dataDir);
    } catch (err) {
      debugInfo.data_dir_list_error = err.message;
    }
  }
  
  res.json(debugInfo);
});

// Debug endpoint for protocol and connection info
app.get('/api/debug/connection', (req, res) => {
  const connectionInfo = {
    request_protocol: req.protocol,
    is_secure: req.isSecure,
    headers: {
      host: req.headers.host,
      'x-forwarded-proto': req.headers['x-forwarded-proto'],
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'user-agent': req.headers['user-agent'],
      origin: req.headers.origin,
      referer: req.headers.referer
    },
    url: req.url,
    method: req.method,
    ip: req.ip,
    server_port: PORT,
    node_env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
  
  res.json(connectionInfo);
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