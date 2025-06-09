const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'emerald-plant-tracker.db');
const db = new sqlite3.Database(dbPath);

console.log('=== CURRENT PLANTS TABLE ===');
db.all('SELECT id, name, archived FROM plants;', [], function(err, rows) {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Plants:', rows);
  }
  
  console.log('\n=== CURRENT ARCHIVED_GROWS TABLE ===');
  db.all('SELECT id, plant_id, plant_name FROM archived_grows;', [], function(err, rows) {
    if (err) {
      console.error('Error:', err.message);
    } else {
      console.log('Archived grows:', rows);
    }
    db.close();
  });
});
