const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'emerald-plant-tracker.db');
const db = new sqlite3.Database(dbPath);

console.log('=== LOGS TABLE STRUCTURE ===');
db.all('PRAGMA table_info(logs);', [], function(err, rows) {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Logs columns:', rows.map(r => r.name));
  }
  
  console.log('\n=== ARCHIVED_LOGS TABLE STRUCTURE ===');
  db.all('PRAGMA table_info(archived_logs);', [], function(err, rows) {
    if (err) {
      console.error('Error:', err.message);
    } else {
      console.log('Archived logs columns:', rows.map(r => r.name));
    }
    db.close();
  });
});
