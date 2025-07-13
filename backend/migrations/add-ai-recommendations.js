const { query } = require('../config/database');

/**
 * Migration: Add AI Recommendation Tables
 * Creates tables for storing AI recommendations, feedback, and history
 */

async function up() {
  try {
    console.log('Creating AI recommendation tables...');

    // Create recommendations table
    await query(`
      CREATE TABLE IF NOT EXISTS recommendations (
        id SERIAL PRIMARY KEY,
        plant_id INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
        recommendation_type VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        actions JSONB NOT NULL,
        confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
        reasoning TEXT NOT NULL,
        expected_benefit VARCHAR(255),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'implemented', 'dismissed')),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create recommendation feedback table
    await query(`
      CREATE TABLE IF NOT EXISTS recommendation_feedback (
        id SERIAL PRIMARY KEY,
        recommendation_id VARCHAR(100) NOT NULL,
        implemented BOOLEAN NOT NULL,
        effectiveness VARCHAR(20) CHECK (effectiveness IN ('positive', 'neutral', 'negative')),
        notes TEXT,
        outcome_data JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create recommendation history table
    await query(`
      CREATE TABLE IF NOT EXISTS recommendation_history (
        id SERIAL PRIMARY KEY,
        recommendation_id VARCHAR(100) NOT NULL,
        plant_id INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
        recommendation_data JSONB NOT NULL,
        implemented BOOLEAN DEFAULT false,
        effectiveness VARCHAR(20) CHECK (effectiveness IN ('positive', 'neutral', 'negative')),
        notes TEXT,
        outcome_data JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create AI model performance tracking table
    await query(`
      CREATE TABLE IF NOT EXISTS ai_model_performance (
        id SERIAL PRIMARY KEY,
        model_name VARCHAR(100) NOT NULL,
        model_version VARCHAR(50) NOT NULL,
        accuracy_score DECIMAL(3,2),
        precision_score DECIMAL(3,2),
        recall_score DECIMAL(3,2),
        f1_score DECIMAL(3,2),
        training_data_size INTEGER,
        last_trained_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_recommendations_plant_id 
      ON recommendations(plant_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_recommendations_type_category 
      ON recommendations(recommendation_type, category)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_recommendations_priority_confidence 
      ON recommendations(priority, confidence DESC)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_recommendation_id 
      ON recommendation_feedback(recommendation_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_recommendation_history_plant_id 
      ON recommendation_history(plant_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_recommendation_history_created_at 
      ON recommendation_history(created_at DESC)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_ai_model_performance_model_name 
      ON ai_model_performance(model_name, model_version)
    `);

    // Add triggers for updated_at timestamps
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await query(`
      CREATE TRIGGER update_recommendations_updated_at 
      BEFORE UPDATE ON recommendations 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    await query(`
      CREATE TRIGGER update_recommendation_feedback_updated_at 
      BEFORE UPDATE ON recommendation_feedback 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    await query(`
      CREATE TRIGGER update_recommendation_history_updated_at 
      BEFORE UPDATE ON recommendation_history 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    // Insert initial AI model performance record
    await query(`
      INSERT INTO ai_model_performance (
        model_name, 
        model_version, 
        accuracy_score, 
        precision_score, 
        recall_score, 
        f1_score,
        training_data_size,
        last_trained_at
      ) VALUES (
        'cannabis_recommendation_engine',
        '1.0.0',
        0.85,
        0.82,
        0.88,
        0.85,
        0,
        CURRENT_TIMESTAMP
      ) ON CONFLICT DO NOTHING
    `);

    console.log('✅ AI recommendation tables created successfully');

  } catch (error) {
    console.error('❌ Error creating AI recommendation tables:', error);
    throw error;
  }
}

async function down() {
  try {
    console.log('Rolling back AI recommendation tables...');

    // Drop triggers first
    await query('DROP TRIGGER IF EXISTS update_recommendation_history_updated_at ON recommendation_history');
    await query('DROP TRIGGER IF EXISTS update_recommendation_feedback_updated_at ON recommendation_feedback');
    await query('DROP TRIGGER IF EXISTS update_recommendations_updated_at ON recommendations');

    // Drop function
    await query('DROP FUNCTION IF EXISTS update_updated_at_column()');

    // Drop tables
    await query('DROP TABLE IF EXISTS ai_model_performance CASCADE');
    await query('DROP TABLE IF EXISTS recommendation_history CASCADE');
    await query('DROP TABLE IF EXISTS recommendation_feedback CASCADE');
    await query('DROP TABLE IF EXISTS recommendations CASCADE');

    console.log('✅ AI recommendation tables rolled back successfully');

  } catch (error) {
    console.error('❌ Error rolling back AI recommendation tables:', error);
    throw error;
  }
}

module.exports = { up, down }; 