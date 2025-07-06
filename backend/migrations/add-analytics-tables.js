#!/usr/bin/env node

const { query } = require('../config/database');

/**
 * Analytics Tables Migration
 * Creates tables for storing processed cultivation analytics and insights
 */

const createAnalyticsTables = async () => {
  console.log('🔧 Creating analytics tables...');

  try {
    // Create analytics_data table for processed cultivation insights
    await query(`
      CREATE TABLE IF NOT EXISTS analytics_data (
        analytics_id SERIAL PRIMARY KEY,
        plant_id INTEGER NOT NULL,
        calculation_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        yield_prediction DECIMAL(10,2),
        growth_rate DECIMAL(8,4),
        environmental_efficiency JSONB,
        recommendations JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

        -- Foreign key constraint to plants table
        CONSTRAINT fk_analytics_plant_id
          FOREIGN KEY (plant_id)
          REFERENCES plants(id)
          ON DELETE CASCADE
      );
    `);

    // Create composite index for performance on plant_id + calculation_date
    await query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_plant_date
      ON analytics_data(plant_id, calculation_date DESC);
    `);

    // Create index for calculation_date for trend queries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_date
      ON analytics_data(calculation_date DESC);
    `);

            // Note: Partial indexes with date predicates removed due to PostgreSQL immutability requirements
    // The composite index idx_analytics_plant_date will provide sufficient performance

    console.log('✅ Analytics tables created successfully');
    console.log('📊 Created tables:');
    console.log('   - analytics_data (with foreign key to plants)');
    console.log('📈 Created indexes:');
    console.log('   - idx_analytics_plant_date (composite)');
    console.log('   - idx_analytics_date (calculation_date)');

  } catch (error) {
    console.error('❌ Error creating analytics tables:', error);
    throw error;
  }
};

const dropAnalyticsTables = async () => {
  console.log('🗑️ Dropping analytics tables...');

  try {
    // Drop indexes first
    await query('DROP INDEX IF EXISTS idx_analytics_date;');
    await query('DROP INDEX IF EXISTS idx_analytics_plant_date;');

    // Drop tables
    await query('DROP TABLE IF EXISTS analytics_data CASCADE;');

    console.log('✅ Analytics tables dropped successfully');

  } catch (error) {
    console.error('❌ Error dropping analytics tables:', error);
    throw error;
  }
};

// CLI interface for running migration
const runMigration = async () => {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'up':
        await createAnalyticsTables();
        break;
      case 'down':
        await dropAnalyticsTables();
        break;
      default:
        console.log('Usage: node add-analytics-tables.js [up|down]');
        console.log('  up   - Create analytics tables');
        console.log('  down - Drop analytics tables');
        process.exit(1);
    }

    console.log('🎉 Migration completed successfully');
    process.exit(0);

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
};

// Export functions for programmatic use
module.exports = {
  createAnalyticsTables,
  dropAnalyticsTables,
  up: createAnalyticsTables,
  down: dropAnalyticsTables
};

// Run migration if called directly
if (require.main === module) {
  runMigration();
}