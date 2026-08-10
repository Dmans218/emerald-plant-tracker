const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const db = require('./database');
const plantsRouter = require('./routes/plants');
const logsRouter = require('./routes/logs');
const environmentRouter = require('./routes/environment');
const tentsRouter = require('./routes/tents');

const app = express();
const PORT = process.env.PORT || 420;
const isProduction = process.env.NODE_ENV === 'production';
const APP_TOKEN = process.env.APP_AUTH_TOKEN || '';

// Trust reverse proxy (for secure cookies / rate limit IP)
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginEmbedderPolicy: false
  })
);

// CORS — configurable origin list; default private ranges + localhost
const extraOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Same-origin / curl / server-side (no Origin header)
    if (!origin) return callback(null, true);

    const allowed = [
      'http://localhost:3000',
      'http://localhost:420',
      'http://127.0.0.1:420',
      'http://127.0.0.1:3000',
      ...extraOrigins,
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}(:\d+)?$/
    ];

    const ok = allowed.some((rule) =>
      rule instanceof RegExp ? rule.test(origin) : rule === origin
    );
    callback(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Token']
};

app.use(cors(corsOptions));
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Optional app-wide token auth (self-host). If APP_AUTH_TOKEN is set, require it.
function optionalAuth(req, res, next) {
  if (!APP_TOKEN) return next();

  // Health without token for orchestrators when ENABLE_PUBLIC_HEALTH=true
  if (req.path === '/api/health' && process.env.ENABLE_PUBLIC_HEALTH === 'true') {
    return next();
  }

  const headerToken = req.get('X-API-Token') || '';
  const bearer = (req.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const token = headerToken || bearer;

  if (token && token === APP_TOKEN) return next();
  return res.status(401).json({ error: 'Unauthorized. Provide X-API-Token or Authorization Bearer token.' });
}

app.use(optionalAuth);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir, {
  maxAge: isProduction ? '7d' : 0,
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// API routes first
app.use('/api/plants', plantsRouter);
app.use('/api/logs', logsRouter);
app.use('/api/environment', environmentRouter);
app.use('/api/tents', tentsRouter);

// Health check
app.get('/api/health', (req, res) => {
  const database = db.getDb();

  if (!database) {
    return res.status(503).json({
      status: 'ERROR',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }

  database.get('SELECT 1 as test', (err) => {
    if (err) {
      return res.status(503).json({
        status: 'ERROR',
        database: 'error',
        timestamp: new Date().toISOString()
      });
    }

    database.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='plants'",
      (err, table) => {
        if (err) {
          return res.status(503).json({
            status: 'ERROR',
            database: 'connected',
            tables: 'error',
            timestamp: new Date().toISOString()
          });
        }

        res.json({
          status: 'OK',
          database: 'connected',
          tables: table ? 'initialized' : 'missing',
          timestamp: new Date().toISOString()
        });
      }
    );
  });
});

// SQLite file backup download
app.get('/api/backup', (req, res) => {
  const dbPath = db.getDbPath();
  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ error: 'Database file not found' });
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  res.download(dbPath, `emerald-plant-tracker-backup-${stamp}.db`);
});

// Debug endpoints — non-production only
if (!isProduction) {
  app.get('/api/debug/database', (req, res) => {
    const dbPath = db.getDbPath();
    const dataDir = path.dirname(dbPath);

    const debugInfo = {
      database_path: dbPath,
      data_directory: dataDir,
      data_dir_exists: fs.existsSync(dataDir),
      database_file_exists: fs.existsSync(dbPath),
      working_directory: __dirname,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };

    if (debugInfo.database_file_exists) {
      try {
        const stats = fs.statSync(dbPath);
        debugInfo.database_size = stats.size;
        debugInfo.database_modified = stats.mtime;
      } catch (err) {
        debugInfo.database_stats_error = err.message;
      }
    }

    res.json(debugInfo);
  });

  app.get('/api/debug/connection', (req, res) => {
    res.json({
      request_protocol: req.protocol,
      headers: {
        host: req.headers.host,
        'x-forwarded-proto': req.headers['x-forwarded-proto'],
        origin: req.headers.origin
      },
      url: req.url,
      method: req.method,
      server_port: PORT,
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });
}

// Static React app (after API routes)
const clientBuildPath =
  process.env.NODE_ENV === 'production'
    ? path.join(__dirname, 'public')
    : path.join(__dirname, '..', 'frontend', 'build');

if (fs.existsSync(clientBuildPath)) {
  app.use(
    express.static(clientBuildPath, {
      maxAge: isProduction ? '1y' : 0,
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        } else if (/\.[0-9a-f]{8}\./.test(path.basename(filePath))) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    })
  );

  app.get(/^\/(?!api|static|uploads).*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err.message || err);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS origin not allowed' });
  }
  res.status(500).json({ error: 'Something went wrong!' });
});

db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Emerald Plant Tracker API running on port ${PORT}`);
      if (APP_TOKEN) {
        console.log('APP_AUTH_TOKEN is set — API requests require authentication');
      }
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
