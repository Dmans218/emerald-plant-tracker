const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('=== EMERALD PLANT TRACKER DB ===');
const dbPath1 = path.join(__dirname, 'data', 'emerald-plant-tracker.db');
const db1 = new sqlite3.Database(dbPath1);

db1.all("SELECT name FROM sqlite_master WHERE type='table';", [], function(err, rows) {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Tables in emerald-plant-tracker.db:', rows.map(row => row.name));
  }
  
  db1.all("SELECT * FROM archived_grows;", [], function(err, rows) {
    if (err) {
      console.log('No archived_grows table or error:', err.message);
    } else {
      console.log('archived_grows data:', rows);
    }
    
    db1.close();
    
    console.log('\n=== GROWLOGGER DB ===');
    const dbPath2 = path.join(__dirname, 'data', 'growlogger.db');
    const db2 = new sqlite3.Database(dbPath2);
    
    db2.all("SELECT name FROM sqlite_master WHERE type='table';", [], function(err, rows) {
      if (err) {
        console.error('Error:', err.message);
      } else {
        console.log('Tables in growlogger.db:', rows.map(row => row.name));
      }
      
      db2.all("SELECT * FROM archived_grows;", [], function(err, rows) {
        if (err) {
          console.log('No archived_grows table or error:', err.message);
        } else {
          console.log('archived_grows data:', rows);
        }
        db2.close();
      });
    });
  });
});
