const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'growlogger.db');
const db = new sqlite3.Database(dbPath);

db.run('ALTER TABLE archived_grows ADD COLUMN grow_cycle_id TEXT;', function(err) {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('Error:', err.message);
  } else {
    console.log('✅ grow_cycle_id column added or already exists');
  }
  db.close();
});
