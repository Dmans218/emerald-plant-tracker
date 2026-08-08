const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_URL || path.join(__dirname, 'data', 'emerald-plant-tracker.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (err) {
  console.error(`Error creating data directory: ${err.message}`);
}

let db;

/**
 * Canonical schema (post-migration). Column-add migrations below keep older DBs current.
 */
const SCHEMA = {
  plants: `
    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      strain TEXT,
      stage TEXT DEFAULT 'seedling',
      planted_date DATE,
      expected_harvest DATE,
      notes TEXT,
      archived BOOLEAN DEFAULT 0,
      archived_at DATETIME,
      archive_reason TEXT,
      harvest_date DATETIME,
      final_yield REAL,
      grow_tent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  logs: `
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id INTEGER,
      type TEXT NOT NULL,
      description TEXT,
      value REAL,
      unit TEXT,
      notes TEXT,
      ph_level REAL,
      ec_tds REAL,
      temperature REAL,
      humidity REAL,
      light_intensity REAL,
      co2_level REAL,
      water_amount REAL,
      nutrient_info TEXT,
      height_cm REAL,
      photo_url TEXT,
      logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plant_id) REFERENCES plants (id) ON DELETE CASCADE
    )
  `,
  environment_logs: `
    CREATE TABLE IF NOT EXISTS environment_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      temperature REAL,
      humidity REAL,
      ph_level REAL,
      light_hours REAL,
      vpd REAL,
      co2_ppm REAL,
      ppfd REAL,
      grow_tent TEXT,
      notes TEXT,
      logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  archived_grows: `
    CREATE TABLE IF NOT EXISTS archived_grows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id INTEGER,
      plant_name TEXT NOT NULL,
      strain TEXT,
      grow_tent TEXT,
      grow_cycle_id TEXT,
      planted_date DATE,
      harvest_date DATE,
      final_yield REAL,
      archive_reason TEXT,
      total_logs INTEGER DEFAULT 0,
      final_stage TEXT,
      notes TEXT,
      archived_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  archived_environment_data: `
    CREATE TABLE IF NOT EXISTS archived_environment_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      archived_grow_id INTEGER,
      original_log_id INTEGER,
      temperature REAL,
      humidity REAL,
      ph_level REAL,
      light_hours REAL,
      vpd REAL,
      co2_ppm REAL,
      ppfd REAL,
      grow_tent TEXT,
      logged_at DATETIME,
      archived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (archived_grow_id) REFERENCES archived_grows (id) ON DELETE CASCADE
    )
  `,
  archived_logs: `
    CREATE TABLE IF NOT EXISTS archived_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      archived_grow_id INTEGER,
      original_log_id INTEGER,
      plant_id INTEGER,
      type TEXT NOT NULL,
      description TEXT,
      value REAL,
      notes TEXT,
      logged_at DATETIME,
      archived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (archived_grow_id) REFERENCES archived_grows (id) ON DELETE CASCADE
    )
  `
};

const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_logs_plant_id ON logs(plant_id)',
  'CREATE INDEX IF NOT EXISTS idx_logs_logged_at ON logs(logged_at)',
  'CREATE INDEX IF NOT EXISTS idx_logs_type ON logs(type)',
  'CREATE INDEX IF NOT EXISTS idx_plants_grow_tent ON plants(grow_tent)',
  'CREATE INDEX IF NOT EXISTS idx_plants_archived ON plants(archived)',
  'CREATE INDEX IF NOT EXISTS idx_env_grow_tent ON environment_logs(grow_tent)',
  'CREATE INDEX IF NOT EXISTS idx_env_logged_at ON environment_logs(logged_at)',
  'CREATE INDEX IF NOT EXISTS idx_archived_grows_tent ON archived_grows(grow_tent)',
  'CREATE INDEX IF NOT EXISTS idx_archived_logs_grow ON archived_logs(archived_grow_id)',
  'CREATE INDEX IF NOT EXISTS idx_archived_env_grow ON archived_environment_data(archived_grow_id)'
];

const init = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Database connection error:', err);
        reject(err);
        return;
      }

      db.run('PRAGMA foreign_keys = ON', (fkErr) => {
        if (fkErr) {
          console.error('Failed to enable foreign keys:', fkErr);
          reject(fkErr);
          return;
        }

        createTables()
          .then(() => resolve())
          .catch(reject);
      });
    });
  });
};

const runSql = (sql) =>
  new Promise((resolve, reject) => {
    db.run(sql, (err) => (err ? reject(err) : resolve()));
  });

const createTables = async () => {
  for (const sql of Object.values(SCHEMA)) {
    await runSql(sql);
  }
  await runMigrations();
  for (const idx of INDEXES) {
    await runSql(idx);
  }
};

const tableColumns = (table) =>
  new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, (err, columns) => {
      if (err) reject(err);
      else resolve(columns || []);
    });
  });

const runMigrations = async () => {
  const plantCols = await tableColumns('plants');
  const plantNames = new Set(plantCols.map((c) => c.name));
  const plantMigrations = [
    ['archived', 'ALTER TABLE plants ADD COLUMN archived BOOLEAN DEFAULT 0'],
    ['archived_at', 'ALTER TABLE plants ADD COLUMN archived_at DATETIME'],
    ['archive_reason', 'ALTER TABLE plants ADD COLUMN archive_reason TEXT'],
    ['harvest_date', 'ALTER TABLE plants ADD COLUMN harvest_date DATETIME'],
    ['final_yield', 'ALTER TABLE plants ADD COLUMN final_yield REAL'],
    ['grow_tent', 'ALTER TABLE plants ADD COLUMN grow_tent TEXT']
  ];
  for (const [col, sql] of plantMigrations) {
    if (!plantNames.has(col)) await runSql(sql);
  }

  const envCols = await tableColumns('environment_logs');
  const envNames = new Set(envCols.map((c) => c.name));
  const envMigrations = [
    ['grow_tent', 'ALTER TABLE environment_logs ADD COLUMN grow_tent TEXT'],
    ['vpd', 'ALTER TABLE environment_logs ADD COLUMN vpd REAL'],
    ['co2_ppm', 'ALTER TABLE environment_logs ADD COLUMN co2_ppm REAL'],
    ['ppfd', 'ALTER TABLE environment_logs ADD COLUMN ppfd REAL']
  ];
  for (const [col, sql] of envMigrations) {
    if (!envNames.has(col)) await runSql(sql);
  }

  const logCols = await tableColumns('logs');
  const logNames = new Set(logCols.map((c) => c.name));
  const logMigrations = [
    ['notes', 'ALTER TABLE logs ADD COLUMN notes TEXT'],
    ['ph_level', 'ALTER TABLE logs ADD COLUMN ph_level REAL'],
    ['ec_tds', 'ALTER TABLE logs ADD COLUMN ec_tds REAL'],
    ['temperature', 'ALTER TABLE logs ADD COLUMN temperature REAL'],
    ['humidity', 'ALTER TABLE logs ADD COLUMN humidity REAL'],
    ['light_intensity', 'ALTER TABLE logs ADD COLUMN light_intensity REAL'],
    ['co2_level', 'ALTER TABLE logs ADD COLUMN co2_level REAL'],
    ['water_amount', 'ALTER TABLE logs ADD COLUMN water_amount REAL'],
    ['nutrient_info', 'ALTER TABLE logs ADD COLUMN nutrient_info TEXT'],
    ['height_cm', 'ALTER TABLE logs ADD COLUMN height_cm REAL']
  ];
  for (const [col, sql] of logMigrations) {
    if (!logNames.has(col)) await runSql(sql);
  }

  // notes on archived_grows if missing
  const archCols = await tableColumns('archived_grows');
  if (!archCols.some((c) => c.name === 'notes')) {
    await runSql('ALTER TABLE archived_grows ADD COLUMN notes TEXT');
  }
};

const getDb = () => db;
const getDbPath = () => DB_PATH;

const close = () => {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) console.error('Error closing database:', err);
        resolve();
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  init,
  getDb,
  getDbPath,
  close,
  SCHEMA
};
