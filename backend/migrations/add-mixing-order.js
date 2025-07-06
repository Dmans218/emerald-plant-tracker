const { query } = require('../config/database');

const addMixingOrder = async () => {
  console.log('🔧 Adding mixing_order column to nutrient_products table...');

  try {
    // Add mixing_order column to nutrient_products table
    await query(`
      ALTER TABLE nutrient_products
      ADD COLUMN IF NOT EXISTS mixing_order INTEGER DEFAULT 999
    `);

    // Add index for better performance when ordering by mixing_order
    await query(`
      CREATE INDEX IF NOT EXISTS idx_nutrient_products_mixing_order
      ON nutrient_products(brand_id, growth_stage, mixing_order)
    `);

    console.log('✅ mixing_order column added successfully');

    // Update mixing orders for each brand
    console.log('📝 Updating mixing orders for proper nutrient mixing sequence...');

    // General Hydroponics - FloraMicro MUST be first
    await query(`
      UPDATE nutrient_products
      SET mixing_order = CASE
        WHEN name = 'FloraMicro' THEN 1
        WHEN name = 'FloraGro' THEN 2
        WHEN name = 'FloraBloom' THEN 3
        ELSE 999
      END
      WHERE brand_id = (SELECT id FROM nutrient_brands WHERE brand_key = 'general-hydroponics')
        AND growth_stage != 'supplements'
    `);

    // Advanced Nutrients - Part A before Part B
    await query(`
      UPDATE nutrient_products
      SET mixing_order = CASE
        WHEN name LIKE '%Micro%' OR name LIKE '%A' THEN 1
        WHEN name LIKE '%Grow%' AND name NOT LIKE '%Micro%' THEN 2
        WHEN name LIKE '%Bloom%' AND name NOT LIKE '%Micro%' THEN 3
        WHEN name LIKE '%B' THEN 2
        ELSE 999
      END
      WHERE brand_id = (SELECT id FROM nutrient_brands WHERE brand_key = 'advanced-nutrients')
        AND growth_stage != 'supplements'
    `);

    // Jack's 321 - Specific order to prevent precipitation
    await query(`
      UPDATE nutrient_products
      SET mixing_order = CASE
        WHEN name LIKE '%5-12-26%' OR name LIKE 'Part A%' THEN 1
        WHEN name = 'Epsom Salt' THEN 2
        WHEN name = 'Calcium Nitrate' THEN 3
        ELSE 999
      END
      WHERE brand_id = (SELECT id FROM nutrient_brands WHERE brand_key = 'jacks-321')
        AND growth_stage != 'supplements'
    `);

    // Canna - Part A before Part B
    await query(`
      UPDATE nutrient_products
      SET mixing_order = CASE
        WHEN name LIKE '%A' THEN 1
        WHEN name LIKE '%B' THEN 2
        ELSE 999
      END
      WHERE brand_id = (SELECT id FROM nutrient_brands WHERE brand_key = 'canna')
        AND growth_stage != 'supplements'
    `);

    // Fox Farm - Big Bloom can go first, then others
    await query(`
      UPDATE nutrient_products
      SET mixing_order = CASE
        WHEN name = 'Big Bloom' THEN 1
        WHEN name = 'Grow Big' THEN 2
        WHEN name = 'Tiger Bloom' THEN 3
        ELSE 999
      END
      WHERE brand_id = (SELECT id FROM nutrient_brands WHERE brand_key = 'fox-farm')
        AND growth_stage != 'supplements'
    `);

    // House & Garden - Part A before Part B
    await query(`
      UPDATE nutrient_products
      SET mixing_order = CASE
        WHEN name LIKE '%A' OR name LIKE '%Part A%' THEN 1
        WHEN name LIKE '%B' OR name LIKE '%Part B%' THEN 2
        ELSE 999
      END
      WHERE brand_id = (SELECT id FROM nutrient_brands WHERE brand_key = 'house-garden')
        AND growth_stage != 'supplements'
    `);

    // Masterblend - Same as Jack's, prevent precipitation
    await query(`
      UPDATE nutrient_products
      SET mixing_order = CASE
        WHEN name LIKE '%4-18-38%' THEN 1
        WHEN name = 'Calcium Nitrate' THEN 2
        WHEN name = 'Epsom Salt' THEN 3
        ELSE 999
      END
      WHERE brand_id = (SELECT id FROM nutrient_brands WHERE brand_key = 'masterblend')
        AND growth_stage != 'supplements'
    `);

    // Single part nutrients get order 1
    await query(`
      UPDATE nutrient_products
      SET mixing_order = 1
      WHERE growth_stage != 'supplements'
        AND mixing_order = 999
        AND brand_id IN (
          SELECT id FROM nutrient_brands
          WHERE brand_key IN ('megacrop', 'botanicare', 'biobizz')
        )
    `);

    // Supplements maintain their special categorization (pre-base vs post-base handled in app logic)
    await query(`
      UPDATE nutrient_products
      SET mixing_order = 999
      WHERE growth_stage = 'supplements'
    `);

    console.log('✅ Mixing orders updated for all brands');

    // Display the results
    const result = await query(`
      SELECT nb.name as brand_name, np.name as product_name, np.growth_stage, np.mixing_order
      FROM nutrient_products np
      JOIN nutrient_brands nb ON np.brand_id = nb.id
      WHERE np.growth_stage != 'supplements'
      ORDER BY nb.name, np.growth_stage, np.mixing_order
      LIMIT 20
    `);

    console.log('📊 Sample mixing orders:');
    result.rows.forEach(row => {
      console.log(
        `   ${row.brand_name} - ${row.growth_stage}: ${row.product_name} (order: ${row.mixing_order})`
      );
    });
  } catch (error) {
    console.error('❌ Error adding mixing_order column:', error);
    throw error;
  }
};

const rollback = async () => {
  console.log('🔄 Rolling back mixing_order addition...');

  try {
    // Remove the index first
    await query('DROP INDEX IF EXISTS idx_nutrient_products_mixing_order');

    // Remove the mixing_order column
    await query('ALTER TABLE nutrient_products DROP COLUMN IF EXISTS mixing_order');

    console.log('✅ Rollback completed successfully');
  } catch (error) {
    console.error('❌ Error during rollback:', error);
    throw error;
  }
};

module.exports = {
  addMixingOrder,
  rollback,
};

// Run migration if this file is executed directly
if (require.main === module) {
  addMixingOrder()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}
