const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_URL || path.join(__dirname, 'data', 'emerald-plant-tracker.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
try {
  if (!fs.existsSync(dataDir)) {
    console.log(`📁 Creating data directory: ${dataDir}`);
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`✅ Data directory created successfully`);
  } else {
    console.log(`📁 Data directory already exists: ${dataDir}`);
  }
} catch (err) {
  console.error(`❌ Error creating data directory: ${err.message}`);
}

let db;

const init = () => {
  return new Promise((resolve, reject) => {
    console.log(`🔍 Attempting to connect to database at: ${DB_PATH}`);
    console.log(`📂 Data directory: ${dataDir}`);
    console.log(`📊 Data directory exists: ${fs.existsSync(dataDir)}`);
    
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Database connection error:', err);
        reject(err);
        return;
      }
      console.log('📁 Connected to SQLite database successfully');
      console.log(`📍 Database file exists: ${fs.existsSync(DB_PATH)}`);
      
      // Enable foreign key constraints for SQLite
      db.run('PRAGMA foreign_keys = ON', (pragmaErr) => {
        if (pragmaErr) {
          console.error('❌ Failed to enable foreign key constraints:', pragmaErr.message);
        } else {
          console.log('🔑 SQLite foreign key constraints enabled');
        }
      });
      
      createTables().then(() => {
        console.log('✅ Database tables created/verified successfully');
        resolve();
      }).catch((tableErr) => {
        console.error('❌ Error creating tables:', tableErr);
        reject(tableErr);
      });
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

    const archivedGrowsTableSQL = `
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
        archived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (plant_id) REFERENCES plants (id)
      )
    `;

    const archivedEnvironmentTableSQL = `
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
    `;

    const archivedLogsTableSQL = `
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
    `;

    db.serialize(() => {
      db.run(plantTableSQL);
      db.run(logTableSQL);
      db.run(environmentTableSQL);
      db.run(archivedGrowsTableSQL);
      db.run(archivedEnvironmentTableSQL);
      db.run(archivedLogsTableSQL, (err) => {
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
        const hasArchiveReason = columns.some(col => col.name === 'archive_reason');
        const hasHarvestDate = columns.some(col => col.name === 'harvest_date');
        const hasFinalYield = columns.some(col => col.name === 'final_yield');
        
        const migrations = [];
        
        if (!hasArchived) {
          migrations.push("ALTER TABLE plants ADD COLUMN archived BOOLEAN DEFAULT 0");
          console.log('🔄 Adding archived column to plants table...');
        }
        
        if (!hasArchivedAt) {
          migrations.push("ALTER TABLE plants ADD COLUMN archived_at DATETIME");
          console.log('🔄 Adding archived_at column to plants table...');
        }
        
        if (!hasArchiveReason) {
          migrations.push("ALTER TABLE plants ADD COLUMN archive_reason TEXT");
          console.log('🔄 Adding archive_reason column to plants table...');
        }
        
        if (!hasHarvestDate) {
          migrations.push("ALTER TABLE plants ADD COLUMN harvest_date DATETIME");
          console.log('🔄 Adding harvest_date column to plants table...');
        }
        
        if (!hasFinalYield) {
          migrations.push("ALTER TABLE plants ADD COLUMN final_yield REAL");
          console.log('🔄 Adding final_yield column to plants table...');
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
          
          const hasEnvGrowTent = envColumns.some(col => col.name === 'grow_tent');
          const hasVpd = envColumns.some(col => col.name === 'vpd');
          const hasCo2 = envColumns.some(col => col.name === 'co2_ppm');
          const hasPpfd = envColumns.some(col => col.name === 'ppfd');
          
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
          
          // Check logs table for new columns
          db.all("PRAGMA table_info(logs)", (err, logColumns) => {
            if (err) {
              reject(err);
              return;
            }
            
            const hasNotes = logColumns.some(col => col.name === 'notes');
            const hasPhLevel = logColumns.some(col => col.name === 'ph_level');
            const hasEcTds = logColumns.some(col => col.name === 'ec_tds');
            const hasTemperature = logColumns.some(col => col.name === 'temperature');
            const hasHumidity = logColumns.some(col => col.name === 'humidity');
            const hasLightIntensity = logColumns.some(col => col.name === 'light_intensity');
            const hasCo2Level = logColumns.some(col => col.name === 'co2_level');
            const hasWaterAmount = logColumns.some(col => col.name === 'water_amount');
            const hasNutrientInfo = logColumns.some(col => col.name === 'nutrient_info');
            const hasHeightCm = logColumns.some(col => col.name === 'height_cm');
            
            if (!hasNotes) {
              migrations.push("ALTER TABLE logs ADD COLUMN notes TEXT");
              console.log('🔄 Adding notes column to logs table...');
            }
            
            if (!hasPhLevel) {
              migrations.push("ALTER TABLE logs ADD COLUMN ph_level REAL");
              console.log('🔄 Adding ph_level column to logs table...');
            }
            
            if (!hasEcTds) {
              migrations.push("ALTER TABLE logs ADD COLUMN ec_tds REAL");
              console.log('🔄 Adding ec_tds column to logs table...');
            }
            
            if (!hasTemperature) {
              migrations.push("ALTER TABLE logs ADD COLUMN temperature REAL");
              console.log('🔄 Adding temperature column to logs table...');
            }
            
            if (!hasHumidity) {
              migrations.push("ALTER TABLE logs ADD COLUMN humidity REAL");
              console.log('🔄 Adding humidity column to logs table...');
            }
            
            if (!hasLightIntensity) {
              migrations.push("ALTER TABLE logs ADD COLUMN light_intensity REAL");
              console.log('🔄 Adding light_intensity column to logs table...');
            }
            
            if (!hasCo2Level) {
              migrations.push("ALTER TABLE logs ADD COLUMN co2_level REAL");
              console.log('🔄 Adding co2_level column to logs table...');
            }
            
            if (!hasWaterAmount) {
              migrations.push("ALTER TABLE logs ADD COLUMN water_amount REAL");
              console.log('🔄 Adding water_amount column to logs table...');
            }
            
            if (!hasNutrientInfo) {
              migrations.push("ALTER TABLE logs ADD COLUMN nutrient_info TEXT");
              console.log('🔄 Adding nutrient_info column to logs table...');
            }
            
            if (!hasHeightCm) {
              migrations.push("ALTER TABLE logs ADD COLUMN height_cm REAL");
              console.log('🔄 Adding height_cm column to logs table...');
            }
            
            // Execute all migrations
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