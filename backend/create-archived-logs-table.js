const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'growlogger.db');
const db = new sqlite3.Database(dbPath);

const createTable = `
  CREATE TABLE IF NOT EXISTS archived_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    archived_grow_id INTEGER,
    plant_name TEXT,
    original_log_id INTEGER,
    type TEXT NOT NULL,
    description TEXT,
    value REAL,
    notes TEXT,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ph_level REAL,
    ec_tds REAL,
    temperature REAL,
    humidity REAL,
    light_intensity TEXT,
    co2_level REAL,
    water_amount REAL,
    nutrient_info TEXT,
    height_cm REAL,
    FOREIGN KEY (archived_grow_id) REFERENCES archived_grows (id)
  )
`;

db.run(createTable, function(err) {
  if (err) {
    console.error('Error creating table:', err.message);
  } else {
    console.log('✅ archived_logs table created successfully');
  }
  db.close();
});
