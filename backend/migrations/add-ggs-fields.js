const { query } = require('../config/database');

const addGgsFields = async () => {
  console.log('🔧 Adding SpiderFarmer GGS fields to environment_logs table...');

  try {
    // Add device serial number field
    await query(`
      ALTER TABLE environment_logs 
      ADD COLUMN IF NOT EXISTS device_serial VARCHAR(100)
    `);

    // Add soil temperature fields (Fahrenheit and Celsius)
    await query(`
      ALTER TABLE environment_logs 
      ADD COLUMN IF NOT EXISTS soil_temperature_f DECIMAL(5,2)
    `);

    await query(`
      ALTER TABLE environment_logs 
      ADD COLUMN IF NOT EXISTS soil_temperature_c DECIMAL(5,2)
    `);

    // Add power consumption field
    await query(`
      ALTER TABLE environment_logs 
      ADD COLUMN IF NOT EXISTS power_consumption DECIMAL(8,2)
    `);

    // Add index for device serial for better performance when filtering by device
    await query(`
      CREATE INDEX IF NOT EXISTS idx_env_logs_device_serial ON environment_logs(device_serial)
    `);

    console.log('✅ SpiderFarmer GGS fields added successfully');
  } catch (error) {
    console.error('❌ Error adding GGS fields:', error);
    throw error;
  }
};

const init = async () => {
  try {
    await addGgsFields();
    console.log('✅ GGS fields migration completed successfully');
  } catch (error) {
    console.error('❌ GGS fields migration failed:', error);
    throw error;
  }
};

module.exports = {
  addGgsFields,
  init
};

// Run migration if this file is executed directly
if (require.main === module) {
  init().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
} 