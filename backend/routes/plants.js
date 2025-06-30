const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { query, getClient } = require('../config/database');

// Validation schemas
const plantSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  strain: Joi.string().max(100).allow(null, ''),
  stage: Joi.string().valid('seedling', 'vegetative', 'flowering', 'harvested').default('seedling'),
  planted_date: Joi.date().iso().allow(null, ''),
  expected_harvest: Joi.date().iso().allow(null, ''),
  notes: Joi.string().max(1000).allow(null, ''),
  grow_tent: Joi.string().max(50).allow(null, '')
});

const updatePlantSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  strain: Joi.string().max(100).allow(null, ''),
  stage: Joi.string().valid('seedling', 'vegetative', 'flowering', 'harvested'),
  planted_date: Joi.date().iso().allow(null, ''),
  expected_harvest: Joi.date().iso().allow(null, ''),
  notes: Joi.string().max(1000).allow(null, ''),
  grow_tent: Joi.string().max(50).allow(null, ''),
  archived: Joi.boolean(),
  harvest_date: Joi.date().iso().allow(null, ''),
  final_yield: Joi.number().min(0).allow(null, ''),
  archive_reason: Joi.string().max(500).allow(null, '')
});

// GET /api/plants/grow-tents - Get all unique grow tents
router.get('/grow-tents', async (req, res) => {
  try {
    const sql = `
      SELECT DISTINCT grow_tent, COUNT(*) as plant_count, MAX(created_at) as last_updated
      FROM plants 
      WHERE grow_tent IS NOT NULL AND grow_tent != '' AND archived = FALSE
      GROUP BY grow_tent
      ORDER BY grow_tent
    `;
    
    const result = await query(sql, []);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching grow tents:', err);
    res.status(500).json({ error: 'Failed to fetch grow tents' });
  }
});

// GET /api/plants - Get all plants with optional filtering
router.get('/', async (req, res) => {
  try {
    const { 
      stage, 
      grow_tent, 
      archived = 'false', 
      limit = 100, 
      offset = 0 
    } = req.query;
    
    let sql = `
      SELECT p.*, 
             COUNT(l.id) as log_count,
             MAX(l.logged_at) as last_activity
      FROM plants p
      LEFT JOIN logs l ON p.id = l.plant_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    // Handle archived filter
    if (archived === 'true') {
      sql += ` AND p.archived = true`;
    } else {
      sql += ` AND p.archived = false`;
    }
    
    if (stage) {
      sql += ` AND p.stage = $${paramIndex++}`;
      params.push(stage);
    }
    
    if (grow_tent) {
      sql += ` AND p.grow_tent = $${paramIndex++}`;
      params.push(grow_tent);
    }
    
    sql += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching plants:', err);
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

// Get all archived grows (MUST BE BEFORE /:id route)
router.get('/archived', async (req, res) => {
  try {
    const sql = `
      SELECT 
        ag.*,
        COUNT(al.id) as activity_logs_count
      FROM archived_grows ag
      LEFT JOIN archived_logs al ON ag.id = al.archived_grow_id
      GROUP BY ag.id
      ORDER BY ag.archived_at DESC
    `;
    
    const result = await query(sql, []);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching archived grows:', err);
    res.status(500).json({ error: 'Failed to fetch archived grows' });
  }
});

// Export all archived data for a specific tent as CSV (MUST BE BEFORE /:id route)
router.get('/archived/tent/:tentName/export', async (req, res) => {
  try {
    const tentName = req.params.tentName;
    
    if (!tentName) {
      return res.status(400).json({ error: 'Tent name is required' });
    }
  
    // Get all archived grows for this tent
    const growsResult = await query(
      'SELECT * FROM archived_grows WHERE grow_tent = $1 ORDER BY archived_at DESC',
      [tentName]
    );
    
    const grows = growsResult.rows;
    
    if (!grows || grows.length === 0) {
      return res.status(404).json({ error: 'No archived grows found for this tent' });
    }

    const growIds = grows.map(g => g.id);
    
    // Get all environment data for these grows
    const environmentResult = await query(
      `SELECT * FROM archived_environment_data 
       WHERE archived_grow_id = ANY($1) 
       ORDER BY logged_at ASC`,
      [growIds]
    );
    const environmentData = environmentResult.rows;

    // Get all plant logs for these grows
    const plantLogsResult = await query(
      `SELECT al.*, ag.plant_name FROM archived_logs al
       JOIN archived_grows ag ON al.archived_grow_id = ag.id
       WHERE al.archived_grow_id = ANY($1) 
       ORDER BY al.logged_at ASC`,
      [growIds]
    );
    const plantLogs = plantLogsResult.rows;

    // Create comprehensive CSV content
    let csvContent = `Tent Archive Data Export - ${tentName}\n`;
    csvContent += `Export Date,${new Date().toISOString()}\n`;
    csvContent += `Total Grow Cycles,${grows.length}\n\n`;

    // Group grows by grow cycle
    const growCycles = {};
    grows.forEach(grow => {
      const cycleKey = grow.grow_cycle_id || `cycle_${grow.id}`;
      if (!growCycles[cycleKey]) {
        growCycles[cycleKey] = [];
      }
      growCycles[cycleKey].push(grow);
    });

    // Export each grow cycle separately
    Object.keys(growCycles).forEach((cycleKey, index) => {
      const cycleGrows = growCycles[cycleKey];
      const cycleIds = cycleGrows.map(g => g.id);
      
      csvContent += `=== GROW CYCLE ${index + 1}: ${cycleKey} ===\n\n`;
      
      // Plants in this cycle
      csvContent += 'Plants in this Cycle\n';
      csvContent += 'Plant Name,Strain,Planted Date,Harvest Date,Final Yield,Final Stage,Archive Reason,Total Logs,Archived At\n';
      cycleGrows.forEach(grow => {
        csvContent += `${grow.plant_name},${grow.strain || ''},${grow.planted_date || ''},${grow.harvest_date || ''},${grow.final_yield || ''},${grow.final_stage || ''},${grow.archive_reason || ''},${grow.total_logs},${grow.archived_at}\n`;
      });
      csvContent += '\n';

      // Environment data for this cycle
      const cycleEnvironmentData = environmentData.filter(env => 
        cycleIds.includes(env.archived_grow_id)
      );
      
      if (cycleEnvironmentData.length > 0) {
        csvContent += 'Environment Data for this Cycle\n';
        csvContent += 'Date,Temperature,Humidity,pH Level,Light Hours,VPD,CO2 PPM,PPFD\n';
        cycleEnvironmentData.forEach(env => {
          csvContent += `${env.logged_at},${env.temperature || ''},${env.humidity || ''},${env.light_hours || ''},${env.vpd || ''},${env.co2_ppm || ''},${env.ppfd || ''}\n`;
        });
        csvContent += '\n';
      }

      // Plant activity logs for this cycle
      const cyclePlantLogs = plantLogs.filter(log => 
        cycleIds.includes(log.archived_grow_id)
      );
      
      if (cyclePlantLogs.length > 0) {
        csvContent += 'Plant Activity Logs for this Cycle\n';
        csvContent += 'Plant Name,Date,Activity Type,Description,Value,Notes\n';
        cyclePlantLogs.forEach(log => {
          csvContent += `${log.plant_name},${log.logged_at},${log.type},${log.description || ''},${log.value || ''},${log.notes || ''}\n`;
        });
        csvContent += '\n';
      }
      
      csvContent += '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${tentName}_complete_grow_data.csv"`);
    res.send(csvContent);
  } catch (err) {
    console.error('Error exporting tent data:', err);
    res.status(500).json({ error: 'Failed to export tent data' });
  }
});

// Get archived grow details (MUST BE BEFORE /:id route)
router.get('/archived/:id', async (req, res) => {
  try {
    const archivedGrowId = parseInt(req.params.id);
    
    if (isNaN(archivedGrowId)) {
      return res.status(400).json({ error: 'Invalid archived grow ID' });
    }

    // Get archived grow info
    const growResult = await query('SELECT * FROM archived_grows WHERE id = $1', [archivedGrowId]);
    
    if (growResult.rows.length === 0) {
      return res.status(404).json({ error: 'Archived grow not found' });
    }
    
    const grow = growResult.rows[0];

    // Get archived activity logs
    const logsResult = await query(
      'SELECT * FROM archived_logs WHERE archived_grow_id = $1 ORDER BY logged_at DESC',
      [archivedGrowId]
    );

    res.json({
      ...grow,
      activityLogs: logsResult.rows || []
    });
  } catch (err) {
    console.error('Error fetching archived grow:', err);
    res.status(500).json({ error: 'Failed to fetch archived grow' });
  }
});

// GET /api/plants/:id - Get specific plant
router.get('/:id', async (req, res) => {
  try {
    const plantId = parseInt(req.params.id);
    
    if (isNaN(plantId)) {
      return res.status(400).json({ error: 'Invalid plant ID' });
    }

    const sql = `
      SELECT p.*, 
             COUNT(l.id) as log_count,
             MAX(l.logged_at) as last_log_date
      FROM plants p 
      LEFT JOIN logs l ON p.id = l.plant_id 
      WHERE p.id = $1
      GROUP BY p.id
    `;
    
    const result = await query(sql, [plantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching plant:', err);
    res.status(500).json({ error: 'Failed to fetch plant' });
  }
});

// POST /api/plants - Create new plant
router.post('/', async (req, res) => {
  try {
    const { error, value } = plantSchema.validate(req.body);
    
    if (error) {
      console.error('❌ Plant validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { name, strain, stage, planted_date, expected_harvest, notes, grow_tent } = value;
    
    console.log('🌱 Creating new plant:', { name, strain, stage, grow_tent });
    
    const sql = `
      INSERT INTO plants (name, strain, stage, planted_date, expected_harvest, notes, grow_tent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await query(sql, [name, strain, stage, planted_date, expected_harvest, notes, grow_tent]);
    
    console.log('✅ Plant created successfully with ID:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // PostgreSQL unique constraint violation
      console.error('❌ Plant name already exists:', req.body.name);
      return res.status(409).json({ error: 'Plant name already exists' });
    }
    console.error('❌ Error creating plant:', err);
    res.status(500).json({ error: 'Failed to create plant', details: err.message });
  }
});

// PUT /api/plants/:id - Update plant
router.put('/:id', async (req, res) => {
  try {
    const plantId = parseInt(req.params.id);
    
    if (isNaN(plantId)) {
      return res.status(400).json({ error: 'Invalid plant ID' });
    }

    const { error, value } = updatePlantSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    // Define allowed fields to prevent SQL injection
    const allowedFields = [
      'name', 'strain', 'planted_date', 'stage', 'grow_tent', 'notes', 
      'archived', 'harvest_date', 'final_yield', 'archive_reason'
    ];
    
    Object.keys(value).forEach(key => {
      if (value[key] !== undefined && allowedFields.includes(key)) {
        if (key === 'archived' && value[key] === true) {
          updates.push(`${key} = $${paramIndex++}`);
          values.push(value[key]);
          updates.push('archived_at = CURRENT_TIMESTAMP');
        } else {
          updates.push(`${key} = $${paramIndex++}`);
          values.push(value[key]);
        }
      }
    });
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(plantId);
    
    const sql = `UPDATE plants SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const result = await query(sql, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // PostgreSQL unique constraint violation
      return res.status(409).json({ error: 'Plant name already exists' });
    }
    console.error('Error updating plant:', err);
    res.status(500).json({ error: 'Failed to update plant' });
  }
});

// DELETE /api/plants/:id - Delete plant
router.delete('/:id', async (req, res) => {
  try {
    const plantId = parseInt(req.params.id);
    
    if (isNaN(plantId)) {
      return res.status(400).json({ error: 'Invalid plant ID' });
    }

    const sql = 'DELETE FROM plants WHERE id = $1 RETURNING id';
    const result = await query(sql, [plantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    res.json({ message: 'Plant deleted successfully' });
  } catch (err) {
    console.error('Error deleting plant:', err);
    res.status(500).json({ error: 'Failed to delete plant' });
  }
});

// Archive a plant with all related data
router.post('/:id/archive', async (req, res) => {
  const plantId = parseInt(req.params.id);
  const { reason, archive_reason, final_yield, harvest_date } = req.body;
  
  // Use either 'reason' or 'archive_reason' parameter
  const archiveReason = reason || archive_reason;
  
  if (isNaN(plantId)) {
    return res.status(400).json({ error: 'Invalid plant ID' });
  }

  const client = await getClient();
  
  try {
    // Start transaction
    await client.query('BEGIN');

    // Get plant data
    const plantResult = await client.query(
      'SELECT * FROM plants WHERE id = $1 AND archived = false', 
      [plantId]
    );

    if (plantResult.rows.length === 0) {
      throw new Error('Plant not found or already archived');
    }
    
    const plant = plantResult.rows[0];

    // Count total logs for this plant
    const logCountResult = await client.query(
      'SELECT COUNT(*) as count FROM logs WHERE plant_id = $1', 
      [plantId]
    );
    const logCount = parseInt(logCountResult.rows[0].count);

    // Generate grow cycle ID: tent_name + planted_date + plant_name
    const growCycleId = `${plant.grow_tent || 'unknown'}_${plant.planted_date || 'unknown'}_${plant.name}`.replace(/[^a-zA-Z0-9_]/g, '_');
    
    // Create archived grow entry
    const archivedGrowResult = await client.query(`
      INSERT INTO archived_grows (
        plant_id, plant_name, strain, grow_tent, grow_cycle_id, planted_date, 
        harvest_date, final_yield, archive_reason, total_logs, final_stage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [
      plant.id, plant.name, plant.strain, plant.grow_tent, growCycleId,
      plant.planted_date, harvest_date, final_yield, archiveReason, 
      logCount, plant.stage
    ]);
    
    const archivedGrowId = archivedGrowResult.rows[0].id;

    // Archive environment data for this grow tent during the plant's lifecycle
    if (plant.grow_tent && plant.planted_date) {
      // Determine the end date for environment data (harvest_date or current time)
      const endDate = harvest_date || new Date().toISOString();
      
      const environmentLogsResult = await client.query(`
        SELECT * FROM environment_logs 
        WHERE grow_tent = $1 AND logged_at >= $2 AND logged_at <= $3
        ORDER BY logged_at DESC
      `, [plant.grow_tent, plant.planted_date, endDate]);

      // Insert archived environment data
      for (const envLog of environmentLogsResult.rows) {
        await client.query(`
          INSERT INTO archived_environment_data (
            archived_grow_id, original_log_id, temperature, humidity, 
            ph_level, light_hours, vpd, co2_ppm, ppfd, grow_tent, logged_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          archivedGrowId, envLog.id, envLog.temperature, envLog.humidity,
          envLog.ph_level, envLog.light_hours, envLog.vpd, envLog.co2_ppm,
          envLog.ppfd, envLog.grow_tent, envLog.logged_at
        ]);
      }
    }

    // Archive plant logs
    const plantLogsResult = await client.query(`
      SELECT * FROM logs 
      WHERE plant_id = $1 
      ORDER BY logged_at ASC
    `, [plantId]);

    // Insert archived plant logs
    for (const log of plantLogsResult.rows) {
      await client.query(`
        INSERT INTO archived_logs (
          archived_grow_id, original_log_id, plant_id, type, 
          description, value, notes, logged_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        archivedGrowId, log.id, log.plant_id, log.type,
        log.description, log.value, log.notes, log.logged_at
      ]);
    }

    // Remove plant from plants table (since it's now in archived_grows)
    await client.query('DELETE FROM plants WHERE id = $1', [plantId]);

    // Commit transaction
    await client.query('COMMIT');

    res.json({ 
      message: 'Plant archived successfully',
      archivedGrowId: archivedGrowId,
      environmentLogsArchived: plant.grow_tent ? true : false
    });

  } catch (error) {
    // Rollback transaction
    await client.query('ROLLBACK');
    console.error('Error archiving plant:', error);
    res.status(500).json({ error: error.message || 'Failed to archive plant' });
  } finally {
    client.release();
  }
});

// POST /api/plants/archived/:id/unarchive - Unarchive a plant (restore from archived_grows to plants)
router.post('/archived/:id/unarchive', async (req, res) => {
  const archivedGrowId = parseInt(req.params.id);
  
  if (isNaN(archivedGrowId)) {
    return res.status(400).json({ error: 'Invalid archived grow ID' });
  }

  const client = await getClient();
  
  try {
    // Begin transaction
    await client.query('BEGIN');

    // Get archived grow data
    const archivedGrowResult = await client.query(
      'SELECT * FROM archived_grows WHERE id = $1', 
      [archivedGrowId]
    );

    if (archivedGrowResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Archived grow not found' });
    }
    
    const archivedGrow = archivedGrowResult.rows[0];

    // Calculate expected harvest date (4 months from planted date)
    let expectedHarvest = null;
    if (archivedGrow.planted_date) {
      const plantedDate = new Date(archivedGrow.planted_date);
      expectedHarvest = new Date(plantedDate);
      expectedHarvest.setMonth(expectedHarvest.getMonth() + 4);
    }

    // Create new plant record from archived data
    const newPlantResult = await client.query(`
      INSERT INTO plants (
        name, strain, stage, planted_date, expected_harvest, notes, 
        grow_tent, archived, harvest_date, final_yield
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, NULL, NULL)
      RETURNING id
    `, [
      archivedGrow.plant_name,
      archivedGrow.strain,
      archivedGrow.final_stage || 'vegetative',
      archivedGrow.planted_date,
      expectedHarvest,
      archivedGrow.notes,
      archivedGrow.grow_tent
    ]);
    
    const newPlantId = newPlantResult.rows[0].id;

    // Restore archived activity logs (only columns that exist in both tables)
    await client.query(`
      INSERT INTO logs (
        plant_id, type, description, value, notes, logged_at
      )
      SELECT 
        $1, type, description, value, notes, logged_at
      FROM archived_logs 
      WHERE archived_grow_id = $2
    `, [newPlantId, archivedGrowId]);

    // Delete from archived tables
    await client.query('DELETE FROM archived_logs WHERE archived_grow_id = $1', [archivedGrowId]);
    await client.query('DELETE FROM archived_grows WHERE id = $1', [archivedGrowId]);

    // Commit transaction
    await client.query('COMMIT');

    res.json({ 
      message: 'Plant unarchived successfully',
      newPlantId: newPlantId,
      plantName: archivedGrow.plant_name
    });

  } catch (error) {
    // Rollback transaction
    await client.query('ROLLBACK');
    console.error('Error unarchiving plant:', error);
    res.status(500).json({ error: error.message || 'Failed to unarchive plant' });
  } finally {
    client.release();
  }
});

// Clear environment data for a tent (for starting new grow cycles)
router.delete('/tent/:tentName/environment', async (req, res) => {
  const tentName = req.params.tentName;
  const { confirm } = req.body;
  
  if (!tentName) {
    return res.status(400).json({ error: 'Tent name is required' });
  }
  
  if (!confirm) {
    return res.status(400).json({ error: 'Confirmation required to clear environment data' });
  }

  try {
    // Check if there are any active plants in this tent
    const result = await query(
      'SELECT COUNT(*) as count FROM plants WHERE grow_tent = $1 AND archived = false',
      [tentName]
    );
    
    if (parseInt(result.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot clear environment data while there are active plants in this tent. Archive all plants first.' 
      });
    }
    
    // Clear environment data for this tent
    const deleteResult = await query(
      'DELETE FROM environment_logs WHERE grow_tent = $1',
      [tentName]
    );
    
    res.json({ 
      message: `Environment data cleared for tent ${tentName}`,
      deletedRows: deleteResult.rowCount
    });

  } catch (error) {
    console.error('Error clearing environment data:', error);
    res.status(500).json({ error: 'Failed to clear environment data' });
  }
});

// Get tent summary with grow cycles
router.get('/tent/:tentName/summary', async (req, res) => {
  const tentName = req.params.tentName;
  
  if (!tentName) {
    return res.status(400).json({ error: 'Tent name is required' });
  }

  try {
    // Get current active plants
    const activePlantsResult = await query(
      'SELECT * FROM plants WHERE grow_tent = $1 AND archived = false',
      [tentName]
    );
    
    // Get archived grows (grow cycles)
    const archivedGrowsResult = await query(
      'SELECT * FROM archived_grows WHERE grow_tent = $1 ORDER BY archived_at DESC',
      [tentName]
    );
    
    // Get environment logs count
    const envCountResult = await query(
      'SELECT COUNT(*) as count FROM environment_logs WHERE grow_tent = $1',
      [tentName]
    );
    
    res.json({
      tentName,
      activePlants: activePlantsResult.rows || [],
      archivedGrows: archivedGrowsResult.rows || [],
      environmentLogsCount: parseInt(envCountResult.rows[0].count),
      totalGrowCycles: (archivedGrowsResult.rows || []).length + (activePlantsResult.rows.length > 0 ? 1 : 0)
    });

  } catch (error) {
    console.error('Error fetching tent summary:', error);
    res.status(500).json({ error: 'Failed to fetch tent summary' });
  }
});

module.exports = router;