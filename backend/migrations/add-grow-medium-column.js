const { query } = require('../config/database');

const addGrowMediumColumn = async () => {
  console.log('🔧 Adding grow_medium column to plants table...');

  try {
    // Add grow_medium column to plants table
    await query(`
      ALTER TABLE plants
      ADD COLUMN IF NOT EXISTS grow_medium VARCHAR(50) DEFAULT 'soil'
    `);

    // Update any existing plants to have a default grow_medium
    await query(`
      UPDATE plants
      SET grow_medium = 'soil'
      WHERE grow_medium IS NULL
    `);

    console.log('✅ grow_medium column added successfully');

    // Also add an index for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_plants_grow_medium
      ON plants(grow_medium)
    `);

    console.log('✅ Index on grow_medium created successfully');
  } catch (error) {
    console.error('❌ Error adding grow_medium column:', error);
    throw error;
  }
};

// Run the migration
if (require.main === module) {
  addGrowMediumColumn()
    .then(() => {
      console.log('🎉 Migration completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addGrowMediumColumn };
