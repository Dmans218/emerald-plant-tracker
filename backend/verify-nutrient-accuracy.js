#!/usr/bin/env node

// Verification script to compare database data against 2025 documentation
// Run with: node backend/verify-nutrient-accuracy.js

const { query } = require('./config/database');
const { nutrientBrands } = require('./models/nutrientData-2025');

async function verifyAccuracy() {
  console.log('🔍 Verifying Nutrient Data Accuracy Against 2025 Documentation');
  console.log('');
  
  try {
    // Get all brands from database
    const dbBrands = await query(`
      SELECT brand_key, name, description FROM nutrient_brands 
      ORDER BY brand_key
    `);
    
    console.log('📊 Database vs Documentation Comparison:');
    console.log('');
    
    for (const dbBrand of dbBrands.rows) {
      const brandKey = dbBrand.brand_key;
      const docBrand = nutrientBrands[brandKey];
      
      if (!docBrand) {
        console.log(`⚠️  Brand '${brandKey}' found in database but not in 2025 documentation`);
        continue;
      }
      
      console.log(`✅ ${dbBrand.name}`);
      
      // Verify products for each growth stage
      const dbProducts = await query(`
        SELECT growth_stage, name, ratio, unit 
        FROM nutrient_products 
        WHERE brand_id = (SELECT id FROM nutrient_brands WHERE brand_key = $1)
        ORDER BY growth_stage, name
      `, [brandKey]);
      
      const stages = ['seedling', 'vegetative', 'flowering', 'supplements'];
      
      for (const stage of stages) {
        const dbStageProducts = dbProducts.rows.filter(p => p.growth_stage === stage);
        const docStageProducts = docBrand.products[stage] || [];
        
        if (dbStageProducts.length !== docStageProducts.length) {
          console.log(`   ⚠️  ${stage}: DB has ${dbStageProducts.length} products, doc has ${docStageProducts.length}`);
        }
        
        // Check individual products
        for (const docProduct of docStageProducts) {
          const dbProduct = dbStageProducts.find(p => p.name === docProduct.name);
          if (!dbProduct) {
            console.log(`   ❌ ${stage}: Missing '${docProduct.name}' in database`);
          } else if (dbProduct.ratio !== docProduct.ratio) {
            console.log(`   ❌ ${stage}: '${docProduct.name}' ratio mismatch - DB: ${dbProduct.ratio}, Doc: ${docProduct.ratio}`);
          }
        }
      }
      
      // Verify strength multipliers
      const dbMultipliers = await query(`
        SELECT multiplier_key, multiplier_value 
        FROM nutrient_multipliers 
        WHERE brand_id = (SELECT id FROM nutrient_brands WHERE brand_key = $1)
        AND multiplier_type = 'strength'
        ORDER BY multiplier_key
      `, [brandKey]);
      
      const docMultipliers = docBrand.strengthMultipliers || {};
      
      for (const [strengthKey, strengthValue] of Object.entries(docMultipliers)) {
        const dbMultiplier = dbMultipliers.rows.find(m => m.multiplier_key === strengthKey);
        if (!dbMultiplier) {
          console.log(`   ❌ Missing strength multiplier '${strengthKey}' in database`);
        } else if (parseFloat(dbMultiplier.multiplier_value) !== strengthValue) {
          console.log(`   ❌ Strength '${strengthKey}' mismatch - DB: ${dbMultiplier.multiplier_value}, Doc: ${strengthValue}`);
        }
      }
      
      // Verify target EC values
      const dbTargets = await query(`
        SELECT growth_stage, feeding_strength, target_ec, target_tds 
        FROM nutrient_targets 
        WHERE brand_id = (SELECT id FROM nutrient_brands WHERE brand_key = $1)
        ORDER BY growth_stage, feeding_strength
      `, [brandKey]);
      
      const docTargetEC = docBrand.targetEC || {};
      const docTargetTDS = docBrand.targetTDS || {};
      
      for (const [stage, stageTargets] of Object.entries(docTargetEC)) {
        for (const [strength, ecValue] of Object.entries(stageTargets)) {
          const dbTarget = dbTargets.rows.find(t => t.growth_stage === stage && t.feeding_strength === strength);
          if (!dbTarget) {
            console.log(`   ❌ Missing target EC for ${stage}/${strength} in database`);
          } else if (parseFloat(dbTarget.target_ec) !== ecValue) {
            console.log(`   ❌ Target EC ${stage}/${strength} mismatch - DB: ${dbTarget.target_ec}, Doc: ${ecValue}`);
          }
          
          const tdsValue = docTargetTDS[stage]?.[strength];
          if (tdsValue && parseInt(dbTarget.target_tds) !== tdsValue) {
            console.log(`   ❌ Target TDS ${stage}/${strength} mismatch - DB: ${dbTarget.target_tds}, Doc: ${tdsValue}`);
          }
        }
      }
      
      console.log('');
    }
    
    // Check for documentation brands not in database
    for (const [docBrandKey, docBrandData] of Object.entries(nutrientBrands)) {
      const dbBrand = dbBrands.rows.find(b => b.brand_key === docBrandKey);
      if (!dbBrand) {
        console.log(`⚠️  Brand '${docBrandKey}' (${docBrandData.name}) found in documentation but not in database`);
      }
    }
    
    console.log('🎉 Verification completed!');
    console.log('');
    console.log('📈 Current Database Stats:');
    
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM nutrient_brands) as brands,
        (SELECT COUNT(*) FROM nutrient_products) as products,
        (SELECT COUNT(*) FROM nutrient_multipliers) as multipliers,
        (SELECT COUNT(*) FROM nutrient_targets) as targets
    `);
    
    const { brands, products, multipliers, targets } = stats.rows[0];
    console.log(`   • Brands: ${brands}`);
    console.log(`   • Products: ${products}`);
    console.log(`   • Multipliers: ${multipliers}`);
    console.log(`   • Targets: ${targets}`);
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  }
}

// Run verification
verifyAccuracy(); 