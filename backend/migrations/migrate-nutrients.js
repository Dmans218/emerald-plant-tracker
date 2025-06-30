const { query, getClient } = require('../config/database');
const { nutrientBrands } = require('../models/nutrientData-2025');

const migrateNutrientData = async () => {
  console.log('🚀 Starting nutrient data migration...');
  
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    // Clear existing nutrient data (in case of re-migration)
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
    
    console.log('🎉 Nutrient data migration completed successfully!');
    console.log(`📊 Migration summary:`);
    console.log(`   • Brands: ${totalBrands}`);
    console.log(`   • Products: ${totalProducts}`);
    console.log(`   • Multipliers: ${totalMultipliers}`);
    console.log(`   • Targets: ${totalTargets}`);
    console.log(`   • Weekly schedules: ${totalSchedules}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during nutrient data migration:', error);
    throw error;
  } finally {
    client.release();
  }
};

const verifyMigration = async () => {
  console.log('🔍 Verifying nutrient data migration...');
  
  try {
    const brandsResult = await query('SELECT COUNT(*) as count FROM nutrient_brands');
    const productsResult = await query('SELECT COUNT(*) as count FROM nutrient_products');
    const multipliersResult = await query('SELECT COUNT(*) as count FROM nutrient_multipliers');
    const targetsResult = await query('SELECT COUNT(*) as count FROM nutrient_targets');
    
    console.log('📊 Verification results:');
    console.log(`   • Brands in database: ${brandsResult.rows[0].count}`);
    console.log(`   • Products in database: ${productsResult.rows[0].count}`);
    console.log(`   • Multipliers in database: ${multipliersResult.rows[0].count}`);
    console.log(`   • Targets in database: ${targetsResult.rows[0].count}`);
    
    // Test fetching a specific brand
    const testBrand = await query(`
      SELECT nb.*, 
             COUNT(DISTINCT np.id) as product_count,
             COUNT(DISTINCT nm.id) as multiplier_count,
             COUNT(DISTINCT nt.id) as target_count
      FROM nutrient_brands nb
      LEFT JOIN nutrient_products np ON nb.id = np.brand_id
      LEFT JOIN nutrient_multipliers nm ON nb.id = nm.brand_id
      LEFT JOIN nutrient_targets nt ON nb.id = nt.brand_id
      WHERE nb.brand_key = 'general-hydroponics'
      GROUP BY nb.id
    `);
    
    if (testBrand.rows.length > 0) {
      const brand = testBrand.rows[0];
      console.log(`🧪 Test brand (General Hydroponics):`);
      console.log(`   • Name: ${brand.name}`);
      console.log(`   • Products: ${brand.product_count}`);
      console.log(`   • Multipliers: ${brand.multiplier_count}`);
      console.log(`   • Targets: ${brand.target_count}`);
    }
    
    console.log('✅ Migration verification completed');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  }
};

module.exports = {
  migrateNutrientData,
  verifyMigration
};
