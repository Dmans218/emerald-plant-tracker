#!/usr/bin/env node

const { testConnection } = require('./config/database');
const { init: initTables } = require('./migrations/init');
const { migrateNutrientData, verifyMigration } = require('./migrations/migrate-nutrients');

const runMigrations = async () => {
  console.log('🚀 Starting Emerald Plant Tracker database migration...');
  console.log('📊 Target: PostgreSQL');
  
  try {
    // Test connection first
    console.log('🔍 Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      throw new Error('❌ Database connection failed');
    }
    
    console.log('✅ Database connection successful');
    
    // Initialize tables
    console.log('🔧 Creating database tables...');
    await initTables();
    console.log('✅ Tables created successfully');
    
    // Migrate nutrient data
    console.log('📦 Migrating nutrient vendor data...');
    await migrateNutrientData();
    console.log('✅ Nutrient data migrated successfully');
    
    // Verify migration
    console.log('🔍 Verifying migration...');
    await verifyMigration();
    console.log('✅ Migration verification complete');
    
    console.log('🎉 Database migration completed successfully!');
    console.log('📊 Your Emerald Plant Tracker is now running on PostgreSQL');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('🔧 Please check your PostgreSQL connection and try again');
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Migration interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Migration terminated');
  process.exit(1);
});

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations }; 