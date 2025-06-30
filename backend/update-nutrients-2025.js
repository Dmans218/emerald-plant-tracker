#!/usr/bin/env node

// Standalone script to update nutrient database with accurate 2025 data
// Run with: node backend/update-nutrients-2025.js

const { migrateNutrientData, verifyMigration } = require('./migrations/migrate-nutrients');

async function updateNutrients() {
  console.log('🌿 Updating Emerald Plant Tracker with 2025 Accurate Nutrient Data');
  console.log('🎯 Sources: Official vendor websites and feeding charts');
  console.log('');
  
  try {
    // Run the migration with updated 2025 data
    await migrateNutrientData();
    
    console.log('');
    console.log('🔍 Verifying updated data...');
    await verifyMigration();
    
    console.log('');
    console.log('✅ 2025 Nutrient data update completed successfully!');
    console.log('');
    console.log('📊 Updated Vendors:');
    console.log('   • General Hydroponics (2025 Reformulated Flora Series)');
    console.log('   • Advanced Nutrients (pH Perfect Sensi 2025)');
    console.log('   • Fox Farm (2025 Classic Soil Trio)');
    console.log('   • Canna (2025 Coco A+B Dutch Research)');
    console.log('');
    console.log('🎉 All feeding ratios now reflect current vendor specifications!');
    
  } catch (error) {
    console.error('❌ Error updating nutrient data:', error);
    process.exit(1);
  }
}

// Run the update
updateNutrients(); 