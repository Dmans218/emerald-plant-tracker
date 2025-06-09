const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'growlogger.db');
const db = new sqlite3.Database(dbPath);

// Add sample archived grows and logs
const sampleData = [
  {
    plant_id: 1,
    plant_name: 'Blue Dream #1',
    strain: 'Blue Dream',
    grow_tent: 'Tent A',
    grow_cycle_id: 'tent_a_2024-01-15_blue_dream_1',
    planted_date: '2024-01-15',
    harvest_date: '2024-04-20',
    final_yield: 85.5,
    archive_reason: 'harvested',
    total_logs: 15,
    final_stage: 'flowering',
    notes: 'Great yield, excellent quality'
  },
  {
    plant_id: 2,
    plant_name: 'Blue Dream #2',
    strain: 'Blue Dream',
    grow_tent: 'Tent A',
    grow_cycle_id: 'tent_a_2024-01-15_blue_dream_1',
    planted_date: '2024-01-15',
    harvest_date: '2024-04-20',
    final_yield: 92.3,
    archive_reason: 'harvested',
    total_logs: 18,
    final_stage: 'flowering',
    notes: 'Outstanding results'
  },
  {
    plant_id: 3,
    plant_name: 'White Widow #1',
    strain: 'White Widow',
    grow_tent: 'Tent A',
    grow_cycle_id: 'tent_a_2024-05-01_white_widow_1',
    planted_date: '2024-05-01',
    harvest_date: '2024-08-15',
    final_yield: 78.2,
    archive_reason: 'harvested',
    total_logs: 12,
    final_stage: 'flowering',
    notes: 'Good quality, dense buds'
  }
];

console.log('Adding sample archived grows...');

// Insert sample archived grows
const insertGrow = db.prepare(`
  INSERT INTO archived_grows (
    plant_id, plant_name, strain, grow_tent, grow_cycle_id, planted_date,
    harvest_date, final_yield, archive_reason, total_logs, final_stage, notes
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

sampleData.forEach(grow => {
  insertGrow.run([
    grow.plant_id, grow.plant_name, grow.strain, grow.grow_tent, grow.grow_cycle_id,
    grow.planted_date, grow.harvest_date, grow.final_yield, grow.archive_reason,
    grow.total_logs, grow.final_stage, grow.notes
  ]);
});

insertGrow.finalize();

// Add sample archived logs
const sampleLogs = [
  // Logs for Blue Dream cycle
  { archived_grow_id: 1, plant_name: 'Blue Dream #1', type: 'watering', description: 'Regular watering', logged_at: '2024-01-20' },
  { archived_grow_id: 1, plant_name: 'Blue Dream #1', type: 'feeding', description: 'NPK nutrients', logged_at: '2024-01-25' },
  { archived_grow_id: 2, plant_name: 'Blue Dream #2', type: 'watering', description: 'Regular watering', logged_at: '2024-01-20' },
  { archived_grow_id: 2, plant_name: 'Blue Dream #2', type: 'feeding', description: 'NPK nutrients', logged_at: '2024-01-25' },
  
  // Logs for White Widow cycle
  { archived_grow_id: 3, plant_name: 'White Widow #1', type: 'watering', description: 'Initial watering', logged_at: '2024-05-05' },
  { archived_grow_id: 3, plant_name: 'White Widow #1', type: 'training', description: 'LST applied', logged_at: '2024-05-15' }
];

const insertLog = db.prepare(`
  INSERT INTO archived_logs (
    archived_grow_id, plant_name, type, description, logged_at
  ) VALUES (?, ?, ?, ?, ?)
`);

sampleLogs.forEach(log => {
  insertLog.run([log.archived_grow_id, log.plant_name, log.type, log.description, log.logged_at]);
});

insertLog.finalize();

console.log('✅ Sample archived data added successfully');
console.log('📊 Added:');
console.log('  - 3 archived grows (2 grow cycles)');
console.log('  - 6 archived activity logs');
console.log('  - Tent A: 2 grow cycles with different strains');

db.close();
