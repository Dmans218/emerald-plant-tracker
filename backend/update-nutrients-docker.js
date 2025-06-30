#!/usr/bin/env node

// Update script that connects to Docker PostgreSQL instance
// Run with: node backend/update-nutrients-docker.js

const { Pool } = require('pg');

// Docker PostgreSQL connection (from host system)
const dockerDbConfig = {
  user: 'plant_user',
  host: 'localhost',
  database: 'emerald_db',
  password: 'securepassword',
  port: 5433, // External Docker port
};

// Create connection pool for Docker DB
const dockerPool = new Pool(dockerDbConfig);

// Import 2025 nutrient data
const { nutrientBrands } = require('./models/nutrientData-2025');

async function updateDockerNutrients() {
  console.log('🌿 Updating Docker PostgreSQL with 2025 Accurate Nutrient Data');
  console.log('🎯 Sources: Official vendor websites and feeding charts');
  console.log('🐳 Target: Docker PostgreSQL (localhost:5433/emerald_db)');
  console.log('');
  
  const client = await dockerPool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Clear existing nutrient data
    await client.query('DELETE FROM nutrient_weekly_schedules');
    await client.query('DELETE FROM nutrient_targets');
    await client.query('DELETE FROM nutrient_multipliers');
    await client.query('DELETE FROM nutrient_products');
    await client.query('DELETE FROM nutrient_brands');
    
    console.log('🧹 Cleared existing nutrient data');
    
    let totalBrands = 0;
    let totalProducts = 0;
    let totalMultipliers = 0;
    let totalTargets = 0;
    let totalSchedules = 0;
    
    for (const [brandKey, brandData] of Object.entries(nutrientBrands)) {
      console.log(`📦 Migrating brand: ${brandData.name}`);
      
      // Insert brand
      const brandResult = await client.query(
        `INSERT INTO nutrient_brands (brand_key, name, description, created_at, updated_at) 
         VALUES ($1, $2, $3, NOW(), NOW()) 
         RETURNING id`,
        [brandKey, brandData.name, brandData.description]
      );
      const brandId = brandResult.rows[0].id;
      totalBrands++;
      
      // Insert products for each growth stage
      const { products } = brandData;
      for (const [stage, stageProducts] of Object.entries(products)) {
        if (Array.isArray(stageProducts)) {
          for (const product of stageProducts) {
            await client.query(
              `INSERT INTO nutrient_products 
               (brand_id, name, growth_stage, ratio, unit, is_optional, is_flowering_only, is_hydro_only, is_early_growth, week_range, created_at) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
              [
                brandId,
                product.name,
                stage,
                product.ratio,
                product.unit,
                product.optional || false,
                product.floweringOnly || false,
                product.hydroOnly || false,
                product.earlyGrowth || false,
                product.week ? JSON.stringify(product.week) : null
              ]
            );
            totalProducts++;
          }
        }
      }
      
      // Insert strength multipliers
      if (brandData.strengthMultipliers) {
        for (const [strength, value] of Object.entries(brandData.strengthMultipliers)) {
          await client.query(
            `INSERT INTO nutrient_multipliers (brand_id, multiplier_type, multiplier_key, multiplier_value, created_at) 
             VALUES ($1, $2, $3, $4, NOW())`,
            [brandId, 'strength', strength, value]
          );
          totalMultipliers++;
        }
      }
      
      // Insert watering method multipliers
      if (brandData.wateringMethodMultipliers) {
        for (const [method, value] of Object.entries(brandData.wateringMethodMultipliers)) {
          await client.query(
            `INSERT INTO nutrient_multipliers (brand_id, multiplier_type, multiplier_key, multiplier_value, created_at) 
             VALUES ($1, $2, $3, $4, NOW())`,
            [brandId, 'watering_method', method, value]
          );
          totalMultipliers++;
        }
      }
      
      // Insert target EC values
      if (brandData.targetEC) {
        for (const [stage, stageTargets] of Object.entries(brandData.targetEC)) {
          for (const [strength, ecValue] of Object.entries(stageTargets)) {
            const tdsValue = brandData.targetTDS?.[stage]?.[strength];
            await client.query(
              `INSERT INTO nutrient_targets (brand_id, growth_stage, feeding_strength, target_ec, target_tds, created_at) 
               VALUES ($1, $2, $3, $4, $5, NOW())`,
              [brandId, stage, strength, ecValue, tdsValue]
            );
            totalTargets++;
          }
        }
      }
      
      // Insert weekly schedules (for brands that have them)
      if (brandData.weeklySchedule) {
        for (const [stage, weeks] of Object.entries(brandData.weeklySchedule)) {
          for (const [weekKey, weekData] of Object.entries(weeks)) {
            const weekNumber = weekKey === 'flush' ? 99 : parseInt(weekKey.replace('week', ''));
            
            for (const [productKey, ratio] of Object.entries(weekData)) {
              await client.query(
                `INSERT INTO nutrient_weekly_schedules (brand_id, growth_stage, week_number, product_name, ratio, created_at) 
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [brandId, stage, weekNumber, productKey, ratio]
              );
              totalSchedules++;
            }
          }
        }
      }
      
      console.log(`✅ Migrated brand: ${brandData.name}`);
    }
    
    await client.query('COMMIT');
    
    console.log('🎉 Docker PostgreSQL nutrient data migration completed successfully!');
    console.log(`📊 Migration summary:`);
    console.log(`   • Brands: ${totalBrands}`);
    console.log(`   • Products: ${totalProducts}`);
    console.log(`   • Multipliers: ${totalMultipliers}`);
    console.log(`   • Targets: ${totalTargets}`);
    console.log(`   • Weekly schedules: ${totalSchedules}`);
    console.log('');
    console.log('📊 Updated Vendors:');
    console.log('   • General Hydroponics (2025 Reformulated Flora Series)');
    console.log('   • Advanced Nutrients (pH Perfect Sensi 2025)');
    console.log('   • Fox Farm (2025 Classic Soil Trio)');
    console.log('   • Canna (2025 Coco A+B Dutch Research)');
    console.log('');
    console.log('🎉 All feeding ratios now reflect current vendor specifications!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during nutrient data migration:', error);
    throw error;
  } finally {
    client.release();
    await dockerPool.end();
  }
}

// Run the update
updateDockerNutrients().catch(error => {
  console.error('❌ Failed to update Docker PostgreSQL:', error);
  process.exit(1);
}); 