const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'emerald-plant-tracker.db');
const db = new sqlite3.Database(dbPath);

console.log('🗑️ Deleting orphaned archived grow data...');

db.run('DELETE FROM archived_grows WHERE id = 1;', function(err) {
  if (err) {
    console.error('Error deleting data:', err.message);
  } else {
    console.log('✅ Deleted orphaned archived grow data');
  }
  
  // Add grow_cycle_id column if it doesn't exist
  db.run('ALTER TABLE archived_grows ADD COLUMN grow_cycle_id TEXT;', function(err) {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding column:', err.message);
    } else {
      console.log('✅ grow_cycle_id column added or already exists');
    }
    
    // Verify the data is gone
    db.all('SELECT * FROM archived_grows;', [], function(err, rows) {
      if (err) {
        console.error('Error checking data:', err.message);
      } else {
        console.log('📊 Current archived_grows data:', rows);
      }
      db.close();
    });
  });
});
