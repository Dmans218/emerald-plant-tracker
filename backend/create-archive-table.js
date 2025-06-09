const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'growlogger.db');
const db = new sqlite3.Database(dbPath);

const createTable = `
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

db.run(createTable, function(err) {
  if (err) {
    console.error('Error creating table:', err.message);
  } else {
    console.log('✅ archived_grows table created successfully');
  }
  db.close();
});
