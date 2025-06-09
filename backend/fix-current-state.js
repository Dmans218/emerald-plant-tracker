const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'emerald-plant-tracker.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing current state - removing archived plant from plants table...');

db.run('DELETE FROM plants WHERE id = 5 AND archived = 1;', function(err) {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('✅ Removed archived plant from plants table');
  }
  
  // Verify the fix
  console.log('\n=== AFTER FIX ===');
  db.all('SELECT id, name, archived FROM plants;', [], function(err, rows) {
    if (err) {
      console.error('Error:', err.message);
    } else {
      console.log('Plants:', rows);
    }
    db.close();
  });
});
