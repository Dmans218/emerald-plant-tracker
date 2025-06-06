const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_URL || path.join(__dirname, 'data', 'emerald-plant-tracker.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

const init = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('📁 Connected to SQLite database');
      createTables().then(resolve).catch(reject);
    });
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    const plantTableSQL = `
      CREATE TABLE IF NOT EXISTS plants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        strain TEXT,
        stage TEXT DEFAULT 'seedling',
        planted_date DATE,
        expected_harvest DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const logTableSQL = `
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plant_id INTEGER,
        type TEXT NOT NULL,
        description TEXT,
        value REAL,
        unit TEXT,
        photo_url TEXT,
        logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (plant_id) REFERENCES plants (id) ON DELETE CASCADE
      )
    `;

    const environmentTableSQL = `
      CREATE TABLE IF NOT EXISTS environment_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        temperature REAL,
        humidity REAL,
        ph_level REAL,
        light_hours REAL,
        notes TEXT,
        logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.serialize(() => {
      db.run(plantTableSQL);
      db.run(logTableSQL);
      db.run(environmentTableSQL, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('📊 Database tables created successfully');
          // Run migrations after table creation
          runMigrations().then(resolve).catch(reject);
        }
      });
    });
  });
};

const runMigrations = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Check if archived column exists
      db.all("PRAGMA table_info(plants)", (err, columns) => {
        if (err) {
          reject(err);
          return;
        }
        
        const hasArchived = columns.some(col => col.name === 'archived');
        const hasArchivedAt = columns.some(col => col.name === 'archived_at');
        
        const migrations = [];
        
        if (!hasArchived) {
          migrations.push("ALTER TABLE plants ADD COLUMN archived BOOLEAN DEFAULT 0");
          console.log('🔄 Adding archived column to plants table...');
        }
        
        if (!hasArchivedAt) {
          migrations.push("ALTER TABLE plants ADD COLUMN archived_at DATETIME");
          console.log('🔄 Adding archived_at column to plants table...');
        }
        
        const hasGrowTent = columns.some(col => col.name === 'grow_tent');
        
        if (!hasGrowTent) {
          migrations.push("ALTER TABLE plants ADD COLUMN grow_tent TEXT");
          console.log('🔄 Adding grow_tent column to plants table...');
        }
        
        // Check environment_logs table for grow_tent column
        db.all("PRAGMA table_info(environment_logs)", (err, envColumns) => {
          if (err) {
            reject(err);
            return;
          }
          const hasEnvPlantId = envColumns.some(col => col.name === 'plant_id');
          const hasEnvGrowTent = envColumns.some(col => col.name === 'grow_tent');
          const hasVpd = envColumns.some(col => col.name === 'vpd');
          const hasCo2 = envColumns.some(col => col.name === 'co2_ppm');
          const hasPpfd = envColumns.some(col => col.name === 'ppfd');
          const hasGrowthStage = envColumns.some(col => col.name === 'growth_stage');
          if (!hasEnvPlantId) {
            migrations.push("ALTER TABLE environment_logs ADD COLUMN plant_id INTEGER REFERENCES plants(id)");
            console.log('🔄 Adding plant_id column to environment_logs table...');
          }
          
          if (!hasEnvGrowTent) {
            migrations.push("ALTER TABLE environment_logs ADD COLUMN grow_tent TEXT");
            console.log('🔄 Adding grow_tent column to environment_logs table...');
          }
          
          if (!hasVpd) {
            migrations.push("ALTER TABLE environment_logs ADD COLUMN vpd REAL");
            console.log('🔄 Adding vpd column to environment_logs table...');
          }
          
          if (!hasCo2) {
            migrations.push("ALTER TABLE environment_logs ADD COLUMN co2_ppm REAL");
            console.log('🔄 Adding co2_ppm column to environment_logs table...');
          }
          
          if (!hasPpfd) {
            migrations.push("ALTER TABLE environment_logs ADD COLUMN ppfd REAL");
            console.log('🔄 Adding ppfd column to environment_logs table...');
          }
          
          if (!hasGrowthStage) {
            migrations.push("ALTER TABLE environment_logs ADD COLUMN growth_stage TEXT");
            console.log('🔄 Adding growth_stage column to environment_logs table...');
          }
          
          // Check logs table for growth_stage column
          db.all("PRAGMA table_info(logs)", (err, logColumns) => {
            if (err) {
              reject(err);
              return;
            }
            
            const hasLogGrowthStage = logColumns.some(col => col.name === 'growth_stage');
            
            if (!hasLogGrowthStage) {
              migrations.push("ALTER TABLE logs ADD COLUMN growth_stage TEXT");
              console.log('🔄 Adding growth_stage column to logs table...');
            }
          
            if (migrations.length === 0) {
              console.log('✅ All migrations up to date');
              resolve();
              return;
            }
        
            let completed = 0;
            migrations.forEach(migration => {
              db.run(migration, (err) => {
                if (err) {
                  reject(err);
                  return;
                }
                completed++;
                if (completed === migrations.length) {
                  console.log('✅ Database migrations completed');
                  resolve();
                }
              });
            });
          });
        });
      });
    });
  });
};

const getDb = () => db;

const close = () => {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
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
  close
}; 