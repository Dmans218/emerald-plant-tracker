const { query } = require('../config/database');

const addStageToEnvironment = async () => {
  console.log('🔧 Adding stage column to environment_logs table...');

  try {
    // Add stage column to environment_logs table
    await query(`
      ALTER TABLE environment_logs 
      ADD COLUMN IF NOT EXISTS stage VARCHAR(50)
    `);

    // Add index for stage column for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_env_logs_stage ON environment_logs(stage)
    `);

    console.log('✅ Stage column added to environment_logs successfully');

  } catch (error) {
    console.error('❌ Error adding stage column to environment_logs:', error);
    throw error;
  }
};

const rollback = async () => {
  console.log('🔄 Rolling back stage column addition...');

  try {
    // Remove the index first
    await query('DROP INDEX IF EXISTS idx_env_logs_stage');
    
    // Remove the stage column
    await query('ALTER TABLE environment_logs DROP COLUMN IF EXISTS stage');

    console.log('✅ Rollback completed successfully');
  } catch (error) {
    console.error('❌ Error during rollback:', error);
    throw error;
  }
};

module.exports = {
  addStageToEnvironment,
  rollback
};

// Run migration if this file is executed directly
if (require.main === module) {
  addStageToEnvironment().then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
} 