const { query, getClient } = require('../config/database');

const createTables = async () => {
  console.log('🔧 Creating PostgreSQL tables...');

  try {
    // Plants table
    await query(`
      CREATE TABLE IF NOT EXISTS plants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        strain VARCHAR(255),
        stage VARCHAR(50) DEFAULT 'seedling',
        planted_date DATE,
        expected_harvest DATE,
        harvest_date TIMESTAMP,
        final_yield DECIMAL(10,2),
        grow_tent VARCHAR(100),
        archived BOOLEAN DEFAULT FALSE,
        archived_at TIMESTAMP,
        archive_reason TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Logs table
    await query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        plant_id INTEGER REFERENCES plants(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL,
        description TEXT,
        value DECIMAL(10,4),
        unit VARCHAR(50),
        notes TEXT,
        ph_level DECIMAL(4,2),
        ec_tds DECIMAL(8,2),
        temperature DECIMAL(5,2),
        humidity DECIMAL(5,2),
        light_intensity DECIMAL(8,2),
        co2_level DECIMAL(8,2),
        water_amount DECIMAL(8,2),
        nutrient_info TEXT,
        height_cm DECIMAL(6,2),
        photo_url TEXT,
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Environment logs table
    await query(`
      CREATE TABLE IF NOT EXISTS environment_logs (
        id SERIAL PRIMARY KEY,
        temperature DECIMAL(5,2),
        humidity DECIMAL(5,2),
        ph_level DECIMAL(4,2),
        light_hours DECIMAL(4,2),
        vpd DECIMAL(4,2),
        co2_ppm DECIMAL(8,2),
        ppfd DECIMAL(8,2),
        grow_tent VARCHAR(100),
        notes TEXT,
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Archived grows table
    await query(`
      CREATE TABLE IF NOT EXISTS archived_grows (
        id SERIAL PRIMARY KEY,
        plant_id INTEGER,
        plant_name VARCHAR(255) NOT NULL,
        strain VARCHAR(255),
        grow_tent VARCHAR(100),
        grow_cycle_id VARCHAR(255),
        planted_date DATE,
        harvest_date DATE,
        final_yield DECIMAL(10,2),
        archive_reason TEXT,
        total_logs INTEGER DEFAULT 0,
        final_stage VARCHAR(50),
        notes TEXT,
        archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Archived environment data table
    await query(`
      CREATE TABLE IF NOT EXISTS archived_environment_data (
        id SERIAL PRIMARY KEY,
        archived_grow_id INTEGER REFERENCES archived_grows(id) ON DELETE CASCADE,
        original_log_id INTEGER,
        temperature DECIMAL(5,2),
        humidity DECIMAL(5,2),
        ph_level DECIMAL(4,2),
        light_hours DECIMAL(4,2),
        vpd DECIMAL(4,2),
        co2_ppm DECIMAL(8,2),
        ppfd DECIMAL(8,2),
        grow_tent VARCHAR(100),
        logged_at TIMESTAMP,
        archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Archived logs table
    await query(`
      CREATE TABLE IF NOT EXISTS archived_logs (
        id SERIAL PRIMARY KEY,
        archived_grow_id INTEGER REFERENCES archived_grows(id) ON DELETE CASCADE,
        original_log_id INTEGER,
        plant_id INTEGER,
        type VARCHAR(100) NOT NULL,
        description TEXT,
        value DECIMAL(10,4),
        notes TEXT,
        logged_at TIMESTAMP,
        archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Nutrient brands table
    await query(`
      CREATE TABLE IF NOT EXISTS nutrient_brands (
        id SERIAL PRIMARY KEY,
        brand_key VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Nutrient products table
    await query(`
      CREATE TABLE IF NOT EXISTS nutrient_products (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER REFERENCES nutrient_brands(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        growth_stage VARCHAR(50) NOT NULL, -- seedling, vegetative, flowering, supplements
        ratio DECIMAL(10,4) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        is_optional BOOLEAN DEFAULT FALSE,
        is_flowering_only BOOLEAN DEFAULT FALSE,
        is_hydro_only BOOLEAN DEFAULT FALSE,
        is_early_growth BOOLEAN DEFAULT FALSE,
        week_range TEXT, -- JSON array for specific weeks like [4,5,6]
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Nutrient multipliers table
    await query(`
      CREATE TABLE IF NOT EXISTS nutrient_multipliers (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER REFERENCES nutrient_brands(id) ON DELETE CASCADE,
        multiplier_type VARCHAR(50) NOT NULL, -- strength, watering_method
        multiplier_key VARCHAR(50) NOT NULL, -- light, medium, aggressive OR hand-watering, drip-system, etc.
        multiplier_value DECIMAL(4,3) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(brand_id, multiplier_type, multiplier_key)
      )
    `);

    // Nutrient targets table
    await query(`
      CREATE TABLE IF NOT EXISTS nutrient_targets (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER REFERENCES nutrient_brands(id) ON DELETE CASCADE,
        growth_stage VARCHAR(50) NOT NULL, -- seedling, vegetative, flowering
        feeding_strength VARCHAR(50) NOT NULL, -- light, medium, aggressive
        target_ec DECIMAL(4,2),
        target_tds INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(brand_id, growth_stage, feeding_strength)
      )
    `);

    // Nutrient weekly schedules table (for brands like CANNA that have specific schedules)
    await query(`
      CREATE TABLE IF NOT EXISTS nutrient_weekly_schedules (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER REFERENCES nutrient_brands(id) ON DELETE CASCADE,
        growth_stage VARCHAR(50) NOT NULL, -- vegetative, flowering
        week_number INTEGER NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        ratio DECIMAL(10,4) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ All tables created successfully');

    // Create indexes for better performance
    await createIndexes();

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

const createIndexes = async () => {
  console.log('🔧 Creating database indexes...');

  try {
    // Plants indexes
    await query('CREATE INDEX IF NOT EXISTS idx_plants_name ON plants(name)');
    await query('CREATE INDEX IF NOT EXISTS idx_plants_stage ON plants(stage)');
    await query('CREATE INDEX IF NOT EXISTS idx_plants_archived ON plants(archived)');
    await query('CREATE INDEX IF NOT EXISTS idx_plants_grow_tent ON plants(grow_tent)');

    // Logs indexes
    await query('CREATE INDEX IF NOT EXISTS idx_logs_plant_id ON logs(plant_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_logs_type ON logs(type)');
    await query('CREATE INDEX IF NOT EXISTS idx_logs_logged_at ON logs(logged_at)');

    // Environment logs indexes
    await query('CREATE INDEX IF NOT EXISTS idx_env_logs_logged_at ON environment_logs(logged_at)');
    await query('CREATE INDEX IF NOT EXISTS idx_env_logs_grow_tent ON environment_logs(grow_tent)');

    // Nutrient-related indexes
    await query('CREATE INDEX IF NOT EXISTS idx_nutrient_brands_key ON nutrient_brands(brand_key)');
    await query('CREATE INDEX IF NOT EXISTS idx_nutrient_products_brand_stage ON nutrient_products(brand_id, growth_stage)');
    await query('CREATE INDEX IF NOT EXISTS idx_nutrient_multipliers_brand_type ON nutrient_multipliers(brand_id, multiplier_type)');
    await query('CREATE INDEX IF NOT EXISTS idx_nutrient_targets_brand_stage_strength ON nutrient_targets(brand_id, growth_stage, feeding_strength)');

    console.log('✅ All indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
};

const init = async () => {
  try {
    await createTables();
    console.log('✅ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = {
  init,
  createTables,
  createIndexes
};

// Run initialization if this file is executed directly
if (require.main === module) {
  init().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
}
