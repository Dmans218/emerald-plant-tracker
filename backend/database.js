const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'emerald_db',
  user: process.env.DB_USER || 'plant_user',
  password: process.env.DB_PASSWORD || 'securepassword',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Use DATABASE_URL if provided (for production environments)
if (process.env.DATABASE_URL) {
  console.log('🔗 Using DATABASE_URL for database connection');
} else {
  console.log('🔗 Using individual database environment variables');
}

let pool;

const init = async () => {
  try {
    console.log('🔍 Attempting to connect to PostgreSQL database...');
    
    if (process.env.DATABASE_URL) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
    } else {
      pool = new Pool(dbConfig);
    }
    
    // Test the connection
    const client = await pool.connect();
    console.log('📁 Connected to PostgreSQL database successfully');
    client.release();
    
    await createTables();
    console.log('✅ Database tables created/verified successfully');
    
  } catch (err) {
    console.error('❌ Database connection error:', err);
    throw err;
  }
};

const createTables = async () => {
  try {
    const client = await pool.connect();
    
    const plantTableSQL = `
      CREATE TABLE IF NOT EXISTS plants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        strain VARCHAR(255),
        stage VARCHAR(50) DEFAULT 'seedling',
        planted_date DATE,
        expected_harvest DATE,
        notes TEXT,
        grow_tent VARCHAR(100),
        archived BOOLEAN DEFAULT FALSE,
        archived_at TIMESTAMPTZ,
        archive_reason TEXT,
        harvest_date TIMESTAMPTZ,
        final_yield DECIMAL(10,2),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const logTableSQL = `
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        plant_id INTEGER,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        value DECIMAL(10,2),
        unit VARCHAR(20),
        notes TEXT,
        ph_level DECIMAL(4,2),
        ec_tds DECIMAL(10,2),
        temperature DECIMAL(5,2),
        humidity DECIMAL(5,2),
        light_intensity DECIMAL(10,2),
        co2_level DECIMAL(10,2),
        water_amount DECIMAL(10,2),
        nutrient_info TEXT,
        height_cm DECIMAL(6,2),
        photo_url VARCHAR(500),
        logged_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (plant_id) REFERENCES plants (id) ON DELETE CASCADE
      )
    `;

    const environmentTableSQL = `
      CREATE TABLE IF NOT EXISTS environment_logs (
        id SERIAL PRIMARY KEY,
        temperature DECIMAL(5,2),
        humidity DECIMAL(5,2),
        ph_level DECIMAL(4,2),
        light_hours DECIMAL(4,2),
        vpd DECIMAL(4,2),
        co2_ppm INTEGER,
        ppfd INTEGER,
        grow_tent VARCHAR(100),
        notes TEXT,
        logged_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const archivedGrowsTableSQL = `
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
        archived_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const archivedEnvironmentTableSQL = `
      CREATE TABLE IF NOT EXISTS archived_environment_data (
        id SERIAL PRIMARY KEY,
        archived_grow_id INTEGER,
        original_log_id INTEGER,
        temperature DECIMAL(5,2),
        humidity DECIMAL(5,2),
        ph_level DECIMAL(4,2),
        light_hours DECIMAL(4,2),
        vpd DECIMAL(4,2),
        co2_ppm INTEGER,
        ppfd INTEGER,
        grow_tent VARCHAR(100),
        logged_at TIMESTAMPTZ,
        archived_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (archived_grow_id) REFERENCES archived_grows (id) ON DELETE CASCADE
      )
    `;

    const archivedLogsTableSQL = `
      CREATE TABLE IF NOT EXISTS archived_logs (
        id SERIAL PRIMARY KEY,
        archived_grow_id INTEGER,
        original_log_id INTEGER,
        plant_id INTEGER,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        value DECIMAL(10,2),
        notes TEXT,
        logged_at TIMESTAMPTZ,
        archived_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (archived_grow_id) REFERENCES archived_grows (id) ON DELETE CASCADE
      )
    `;

    // Execute table creation queries
    await client.query(plantTableSQL);
    await client.query(logTableSQL);
    await client.query(environmentTableSQL);
    await client.query(archivedGrowsTableSQL);
    await client.query(archivedEnvironmentTableSQL);
    await client.query(archivedLogsTableSQL);
    
    console.log('📊 Database tables created successfully');
    
    // Run migrations after table creation
    await runMigrations(client);
    
    client.release();
  } catch (err) {
    console.error('❌ Error creating tables:', err);
    throw err;
  }
};

const runMigrations = async (client) => {
  try {
    console.log('🔄 Running database migrations...');
    
    // Check and add missing columns using PostgreSQL syntax
    const migrations = [
      // Add indexes for performance
      `CREATE INDEX IF NOT EXISTS idx_plants_grow_tent ON plants(grow_tent)`,
      `CREATE INDEX IF NOT EXISTS idx_plants_stage ON plants(stage)`,
      `CREATE INDEX IF NOT EXISTS idx_plants_archived ON plants(archived)`,
      `CREATE INDEX IF NOT EXISTS idx_logs_plant_id ON logs(plant_id)`,
      `CREATE INDEX IF NOT EXISTS idx_logs_type ON logs(type)`,
      `CREATE INDEX IF NOT EXISTS idx_logs_logged_at ON logs(logged_at)`,
      `CREATE INDEX IF NOT EXISTS idx_environment_grow_tent ON environment_logs(grow_tent)`,
      `CREATE INDEX IF NOT EXISTS idx_environment_logged_at ON environment_logs(logged_at)`,
    ];
    
    for (const migration of migrations) {
      try {
        await client.query(migration);
        console.log('✅ Migration completed:', migration.substring(0, 50) + '...');
      } catch (err) {
        // Ignore errors for existing indexes/columns
        if (!err.message.includes('already exists')) {
          console.warn('⚠️ Migration warning:', err.message);
        }
      }
    }
    
    console.log('✅ Database migrations completed');
  } catch (err) {
    console.error('❌ Error running migrations:', err);
    throw err;
  }
};

// Query function for executing SQL queries
const query = async (text, params = []) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err) {
    console.error('❌ Database query error:', err);
    console.error('❌ Query:', text);
    console.error('❌ Params:', params);
    throw err;
  }
};

// Get a client from the pool for transactions
const getClient = async () => {
  return await pool.connect();
};

const close = async () => {
  if (pool) {
    await pool.end();
    console.log('📁 Database connection pool closed');
  }
};

module.exports = {
  init,
  query,
  getClient,
  close
}; 