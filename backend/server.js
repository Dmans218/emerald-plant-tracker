const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { testConnection } = require('./config/database');
const plantsRouter = require('./routes/plants');
const logsRouter = require('./routes/logs');
const environmentRouter = require('./routes/environment');
const nutrientsRouter = require('./routes/nutrients');
const tentsRouter = require('./routes/tents');
const analyticsRouter = require("./routes/analytics");
const recommendationsRouter = require("./routes/recommendations");
const BackgroundProcessor = require("./services/backgroundProcessor");

const app = express();
const PORT = process.env.PORT || 420;

// Enhanced CORS configuration for self-hosted Docker
const corsOptions = {
  origin: [
    // Development
    "http://localhost:3000",
    "http://localhost:420",
    "http://127.0.0.1:420",
    // Common home network ranges on port 420
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:420$/,
    /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:420$/,
    /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:420$/,
    // Docker internal networks
    /^http:\/\/172\.1[7-9]\.\d{1,3}\.\d{1,3}:420$/,
    /^http:\/\/172\.2[0-9]\.\d{1,3}\.\d{1,3}:420$/,
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.use(morgan("combined"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - more generous for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // limit each IP to 200 requests per minute
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files (uploaded images)
app.use("/uploads", express.static(uploadsDir));

// Serve static files from React build
// In Docker: frontend build is copied to ./public
// In development: frontend build is at ../frontend/build
const clientBuildPath =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "public")
    : path.join(__dirname, "..", "frontend", "build");

if (fs.existsSync(clientBuildPath)) {
  // Serve static assets with cache-busting headers
  app.use(
    express.static(clientBuildPath, {
      setHeaders: (res, path) => {
        // Set cache-busting headers for all files
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        if (path.endsWith(".html")) {
          res.setHeader("Last-Modified", new Date().toUTCString());
          res.setHeader("ETag", Math.random().toString(36).substring(7));
        }
      },
    })
  );

  // Serve index.html for any non-API, non-static route
  app.get(/^\/(?!api|static|uploads).*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// Routes
app.use("/api/plants", plantsRouter);
app.use("/api/logs", logsRouter);
app.use("/api/environment", environmentRouter);
app.use("/api/nutrients", nutrientsRouter);
app.use("/api/tents", tentsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/recommendations", recommendationsRouter);

// Health check with database connectivity
app.get("/api/health", async (req, res) => {
  try {
    const { query } = require("./config/database");

    // Test database connectivity
    await query("SELECT 1 as test");

    // Check if plants table exists
    const tableResult = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'plants'
    `);

    res.json({
      status: "OK",
      database: "connected",
      tables: tableResult.rows.length > 0 ? "initialized" : "missing",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Database health check failed:", err);
    res.status(503).json({
      status: "ERROR",
      database: "error",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Debug endpoint for database info
app.get("/api/debug/database", async (req, res) => {
  try {
    const { query } = require("./config/database");

    const debugInfo = {
      database_type: "PostgreSQL",
      database_host: process.env.DB_HOST || "localhost",
      database_port: process.env.DB_PORT || 5432,
      database_name: process.env.DB_NAME || "emerald_db",
      database_user: process.env.DB_USER || "plant_user",
      working_directory: __dirname,
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    };

    // Get database version and connection info
    const versionResult = await query("SELECT version() as version");
    debugInfo.postgres_version = versionResult.rows[0].version;

    // Get table count
    const tableResult = await query(`
      SELECT COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    debugInfo.table_count = parseInt(tableResult.rows[0].table_count);

    res.json(debugInfo);
  } catch (err) {
    console.error("❌ Database debug error:", err);
    res.status(500).json({
      error: "Database debug failed",
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Debug endpoint for protocol and connection info
app.get("/api/debug/connection", (req, res) => {
  const connectionInfo = {
    request_protocol: req.protocol,
    is_secure: req.isSecure,
    headers: {
      host: req.headers.host,
      "x-forwarded-proto": req.headers["x-forwarded-proto"],
      "x-forwarded-for": req.headers["x-forwarded-for"],
      "user-agent": req.headers["user-agent"],
      origin: req.headers.origin,
      referer: req.headers.referer,
    },
    url: req.url,
    method: req.method,
    ip: req.ip,
    server_port: PORT,
    node_env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  res.json(connectionInfo);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Initialize database and start server
const initializeApp = async () => {
  try {
    console.log("🔍 Testing PostgreSQL connection...");
    const isConnected = await testConnection();

    if (!isConnected) {
      throw new Error("Failed to connect to PostgreSQL database");
    }

    app.listen(PORT, () => {
      console.log(`🌿 Emerald Plant Tracker API running on port ${PORT}`);
      console.log(`📊 Connected to PostgreSQL database`);

      // Start background processing
      BackgroundProcessor.start();
    });
  } catch (err) {
    console.error("❌ Failed to initialize application:", err);
    process.exit(1);
  }
};

initializeApp();

// Graceful shutdown handling
const shutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

  // Stop background processor
  BackgroundProcessor.stop();

  // Give some time for cleanup
  setTimeout(() => {
    console.log("✅ Shutdown complete");
    process.exit(0);
  }, 1000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
