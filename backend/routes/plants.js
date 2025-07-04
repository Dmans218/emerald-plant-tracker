const express = require('express');
const router = express.Router();
const Joi = require('joi');
const db = require('../database');

// Validation schemas
const plantSchema = Joi.object({
  name: Joi.string().required().max(100),
  strain: Joi.string().max(100).allow(null, ''),
  stage: Joi.string().valid('seedling', 'vegetative', 'flowering', 'harvest', 'drying', 'curing', 'cured').default('seedling'),
  planted_date: Joi.date().iso().allow(null, ''),
  expected_harvest: Joi.date().iso().allow(null, ''),
  harvest_date: Joi.date().iso().allow(null, ''),
  final_yield: Joi.number().min(0).allow(null, ''),
  notes: Joi.string().max(1000).allow(null, ''),
  grow_tent: Joi.string().max(100).allow(null, '')
});

const updatePlantSchema = Joi.object({
  name: Joi.string().max(100).allow(null, ''),
  strain: Joi.string().max(100).allow(null, ''),
  stage: Joi.string().valid('seedling', 'vegetative', 'flowering', 'harvest', 'drying', 'curing', 'cured'),
  planted_date: Joi.date().iso().allow(null, ''),
  expected_harvest: Joi.date().iso().allow(null, ''),
  harvest_date: Joi.date().iso().allow(null, ''),
  final_yield: Joi.number().min(0).allow(null, ''),
  notes: Joi.string().max(1000).allow(null, ''),
  archived: Joi.boolean(),
  archive_reason: Joi.string().max(500).allow(null, ''),
  grow_tent: Joi.string().max(100).allow(null, '')
});

// GET /api/plants/grow-tents - Get all grow tents
router.get('/grow-tents', (req, res) => {
  const database = db.getDb();
  
  const sql = `
    SELECT DISTINCT grow_tent, COUNT(*) as plant_count
    FROM plants 
    WHERE grow_tent IS NOT NULL AND grow_tent != '' AND archived = 0
    GROUP BY grow_tent
    ORDER BY grow_tent
  `;
  
  database.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching grow tents:', err);
      return res.status(500).json({ error: 'Failed to fetch grow tents' });
    }
    res.json(rows);
  });
});

// GET /api/plants - Get all plants
router.get('/', (req, res) => {
  const database = db.getDb();
  const { archived, grow_tent } = req.query;
  
  let whereClause = '1=1';
  if (archived === 'true') {
    whereClause = 'p.archived = 1';
  } else if (archived === 'false' || archived === undefined) {
    whereClause = 'p.archived = 0';
  }
  
  // Safely handle grow_tent parameter to prevent SQL injection
  let growTentCondition = '';
  let params = [];
  
  if (grow_tent) {
    growTentCondition = ' AND p.grow_tent = ?';
    params.push(grow_tent);
  }
  
  const sql = `
    SELECT p.*, 
           COUNT(l.id) as log_count,
           MAX(l.logged_at) as last_log_date
    FROM plants p 
    LEFT JOIN logs l ON p.id = l.plant_id 
    WHERE ${whereClause}${growTentCondition}
    GROUP BY p.id 
    ORDER BY p.created_at DESC
  `;
  
  database.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching plants:', err);
      return res.status(500).json({ error: 'Failed to fetch plants' });
    }
    res.json(rows);
  });
});

// Get all archived grows (MUST BE BEFORE /:id route)
router.get('/archived', (req, res) => {
  const database = db.getDb();
  
  const sql = `
    SELECT 
      ag.*,
      COUNT(al.id) as activity_logs_count
    FROM archived_grows ag
    LEFT JOIN archived_logs al ON ag.id = al.archived_grow_id
    GROUP BY ag.id
    ORDER BY ag.archived_at DESC
  `;
  
  database.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching archived grows:', err);
      return res.status(500).json({ error: 'Failed to fetch archived grows' });
    }
    res.json(rows);
  });
});

// Export all archived data for a specific tent as CSV (MUST BE BEFORE /:id route)
router.get('/archived/tent/:tentName/export', (req, res) => {
  const tentName = req.params.tentName;
  
  if (!tentName) {
    return res.status(400).json({ error: 'Tent name is required' });
  }

  const database = db.getDb();
  
  // Get all archived grows for this tent
  database.all(
    'SELECT * FROM archived_grows WHERE grow_tent = ? ORDER BY archived_at DESC',
    [tentName],
    (err, grows) => {
      if (err) {
        console.error('Error fetching archived grows for tent:', err);
        return res.status(500).json({ error: 'Failed to fetch archived grows' });
      }
      
      if (!grows || grows.length === 0) {
        return res.status(404).json({ error: 'No archived grows found for this tent' });
      }

      const growIds = grows.map(g => g.id);
      
      // Get all environment data for these grows
      database.all(
        `SELECT * FROM archived_environment_data 
         WHERE archived_grow_id IN (${growIds.map(() => '?').join(',')}) 
         ORDER BY logged_at ASC`,
        growIds,
        (err, environmentData) => {
          if (err) {
            console.error('Error fetching archived environment data:', err);
            return res.status(500).json({ error: 'Failed to fetch environment data' });
          }

          // Get all plant logs for these grows
          database.all(
            `SELECT al.*, ag.plant_name FROM archived_logs al
             JOIN archived_grows ag ON al.archived_grow_id = ag.id
             WHERE al.archived_grow_id IN (${growIds.map(() => '?').join(',')}) 
             ORDER BY al.logged_at ASC`,
            growIds,
            (err, plantLogs) => {
              if (err) {
                console.error('Error fetching archived plant logs:', err);
                return res.status(500).json({ error: 'Failed to fetch plant logs' });
              }

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
            }
          );
        }
      );
    }
  );
});

// Get archived grow details (MUST BE BEFORE /:id route)
router.get('/archived/:id', (req, res) => {
  const archivedGrowId = parseInt(req.params.id);
  
  if (isNaN(archivedGrowId)) {
    return res.status(400).json({ error: 'Invalid archived grow ID' });
  }

  const database = db.getDb();
  
  // Get archived grow info
  database.get('SELECT * FROM archived_grows WHERE id = ?', [archivedGrowId], (err, grow) => {
    if (err) {
      console.error('Error fetching archived grow:', err);
      return res.status(500).json({ error: 'Failed to fetch archived grow' });
    }
    
    if (!grow) {
      return res.status(404).json({ error: 'Archived grow not found' });
    }

    // Get archived activity logs
    database.all(
      'SELECT * FROM archived_logs WHERE archived_grow_id = ? ORDER BY logged_at DESC',
      [archivedGrowId],
      (err, activityLogs) => {
        if (err) {
          console.error('Error fetching archived activity logs:', err);
          return res.status(500).json({ error: 'Failed to fetch activity logs' });
        }

        res.json({
          ...grow,
          activityLogs: activityLogs || []
        });
      }
    );
  });
});

// GET /api/plants/:id - Get specific plant
router.get('/:id', (req, res) => {
  const database = db.getDb();
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
    WHERE p.id = ?
    GROUP BY p.id
  `;
  
  database.get(sql, [plantId], (err, row) => {
    if (err) {
      console.error('Error fetching plant:', err);
      return res.status(500).json({ error: 'Failed to fetch plant' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    res.json(row);
  });
});

// POST /api/plants - Create new plant
router.post('/', (req, res) => {
  const { error, value } = plantSchema.validate(req.body);
  
  if (error) {
    console.error('❌ Plant validation error:', error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }

  const database = db.getDb();
  
  if (!database) {
    console.error('❌ Database not available when creating plant');
    return res.status(500).json({ error: 'Database not available' });
  }
  
  const { name, strain, stage, planted_date, expected_harvest, notes, grow_tent } = value;
  
  console.log('🌱 Creating new plant:', { name, strain, stage, grow_tent });
  
  const sql = `
    INSERT INTO plants (name, strain, stage, planted_date, expected_harvest, notes, grow_tent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  database.run(sql, [name, strain, stage, planted_date, expected_harvest, notes, grow_tent], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        console.error('❌ Plant name already exists:', name);
        return res.status(409).json({ error: 'Plant name already exists' });
      }
      console.error('❌ Error creating plant:', err);
      console.error('❌ SQL Query:', sql);
      console.error('❌ Values:', [name, strain, stage, planted_date, expected_harvest, notes, grow_tent]);
      return res.status(500).json({ error: 'Failed to create plant', details: err.message });
    }
    
    console.log('✅ Plant created successfully with ID:', this.lastID);
    
    // Fetch the created plant
    database.get('SELECT * FROM plants WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        console.error('❌ Error fetching created plant:', err);
        return res.status(500).json({ error: 'Plant created but failed to fetch', details: err.message });
      }
      console.log('✅ Returning created plant:', row);
      res.status(201).json(row);
    });
  });
});

// PUT /api/plants/:id - Update plant
router.put('/:id', (req, res) => {
  const plantId = parseInt(req.params.id);
  
  if (isNaN(plantId)) {
    return res.status(400).json({ error: 'Invalid plant ID' });
  }

  const { error, value } = updatePlantSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const database = db.getDb();
  const updates = [];
  const values = [];
  
  // Define allowed fields to prevent SQL injection
  const allowedFields = [
    'name', 'strain', 'planted_date', 'stage', 'grow_tent', 'notes', 
    'archived', 'harvest_date', 'final_yield', 'archive_reason'
  ];
  
  Object.keys(value).forEach(key => {
    if (value[key] !== undefined && allowedFields.includes(key)) {
      if (key === 'archived' && value[key] === true) {
        updates.push(`${key} = ?`);
        values.push(value[key]);
        updates.push('archived_at = CURRENT_TIMESTAMP');
      } else {
        updates.push(`${key} = ?`);
        values.push(value[key]);
      }
    }
  });
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(plantId);
  
  const sql = `UPDATE plants SET ${updates.join(', ')} WHERE id = ?`;
  
  database.run(sql, values, function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'Plant name already exists' });
      }
      console.error('Error updating plant:', err);
      return res.status(500).json({ error: 'Failed to update plant' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    // Fetch the updated plant
    database.get('SELECT * FROM plants WHERE id = ?', [plantId], (err, row) => {
      if (err) {
        console.error('Error fetching updated plant:', err);
        return res.status(500).json({ error: 'Plant updated but failed to fetch' });
      }
      res.json(row);
    });
  });
});

// DELETE /api/plants/:id - Delete plant
router.delete('/:id', (req, res) => {
  const plantId = parseInt(req.params.id);
  
  if (isNaN(plantId)) {
    return res.status(400).json({ error: 'Invalid plant ID' });
  }

  const database = db.getDb();
  
  database.run('DELETE FROM plants WHERE id = ?', [plantId], function(err) {
    if (err) {
      console.error('Error deleting plant:', err);
      return res.status(500).json({ error: 'Failed to delete plant' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    res.json({ message: 'Plant deleted successfully' });
  });
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

  const database = db.getDb();
  
  try {
    // Start transaction
    await new Promise((resolve, reject) => {
      database.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Get plant data
    const plant = await new Promise((resolve, reject) => {
      database.get('SELECT * FROM plants WHERE id = ? AND archived = 0', [plantId], (err, row) => {
        if (err) reject(err);
        else if (!row) reject(new Error('Plant not found or already archived'));
        else resolve(row);
      });
    });

    // Count total logs for this plant
    const logCount = await new Promise((resolve, reject) => {
      database.get('SELECT COUNT(*) as count FROM logs WHERE plant_id = ?', [plantId], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // Create archived grow entry
    const archivedGrowId = await new Promise((resolve, reject) => {
      // Generate grow cycle ID: tent_name + planted_date + plant_name
      const growCycleId = `${plant.grow_tent || 'unknown'}_${plant.planted_date || 'unknown'}_${plant.name}`.replace(/[^a-zA-Z0-9_]/g, '_');
      
      const sql = `
        INSERT INTO archived_grows (
          plant_id, plant_name, strain, grow_tent, grow_cycle_id, planted_date, 
          harvest_date, final_yield, archive_reason, total_logs, final_stage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      database.run(sql, [
        plant.id, plant.name, plant.strain, plant.grow_tent, growCycleId,
        plant.planted_date, harvest_date, final_yield, archiveReason, 
        logCount, plant.stage
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    // Archive environment data for this grow tent during the plant's lifecycle
    if (plant.grow_tent && plant.planted_date) {
      // Determine the end date for environment data (harvest_date or current time)
      const endDate = harvest_date || new Date().toISOString();
      
      const environmentLogs = await new Promise((resolve, reject) => {
        const sql = `
          SELECT * FROM environment_logs 
          WHERE grow_tent = ? AND logged_at >= ? AND logged_at <= ?
          ORDER BY logged_at DESC
        `;
        database.all(sql, [plant.grow_tent, plant.planted_date, endDate], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      // Insert archived environment data
      for (const envLog of environmentLogs) {
        await new Promise((resolve, reject) => {
          const sql = `
            INSERT INTO archived_environment_data (
              archived_grow_id, original_log_id, temperature, humidity, 
              ph_level, light_hours, vpd, co2_ppm, ppfd, grow_tent, logged_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          database.run(sql, [
            archivedGrowId, envLog.id, envLog.temperature, envLog.humidity,
            envLog.ph_level, envLog.light_hours, envLog.vpd, envLog.co2_ppm,
            envLog.ppfd, envLog.grow_tent, envLog.logged_at
          ], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }

    // Archive plant logs
    const plantLogs = await new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM logs 
        WHERE plant_id = ? 
        ORDER BY logged_at ASC
      `;
      database.all(sql, [plantId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Insert archived plant logs
    for (const log of plantLogs) {
      await new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO archived_logs (
            archived_grow_id, original_log_id, plant_id, type, 
            description, value, notes, logged_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        database.run(sql, [
          archivedGrowId, log.id, log.plant_id, log.type,
          log.description, log.value, log.notes, log.logged_at
        ], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Remove plant from plants table (since it's now in archived_grows)
    await new Promise((resolve, reject) => {
      database.run('DELETE FROM plants WHERE id = ?', [plantId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Commit transaction
    await new Promise((resolve, reject) => {
      database.run('COMMIT', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ 
      message: 'Plant archived successfully',
      archivedGrowId: archivedGrowId,
      environmentLogsArchived: plant.grow_tent ? true : false
    });

  } catch (error) {
    // Rollback transaction
    database.run('ROLLBACK');
    console.error('Error archiving plant:', error);
    res.status(500).json({ error: error.message || 'Failed to archive plant' });
  }
});

// POST /api/plants/archived/:id/unarchive - Unarchive a plant (restore from archived_grows to plants)
router.post('/archived/:id/unarchive', async (req, res) => {
  const archivedGrowId = parseInt(req.params.id);
  
  if (isNaN(archivedGrowId)) {
    return res.status(400).json({ error: 'Invalid archived grow ID' });
  }

  const database = db.getDb();
  
  try {
    // Begin transaction
    await new Promise((resolve, reject) => {
      database.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Get archived grow data
    const archivedGrow = await new Promise((resolve, reject) => {
      database.get('SELECT * FROM archived_grows WHERE id = ?', [archivedGrowId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!archivedGrow) {
      await new Promise((resolve) => database.run('ROLLBACK', resolve));
      return res.status(404).json({ error: 'Archived grow not found' });
    }

    // Create new plant record from archived data
    const newPlantId = await new Promise((resolve, reject) => {
      database.run(`
        INSERT INTO plants (
          name, strain, stage, planted_date, expected_harvest, notes, 
          grow_tent, archived, harvest_date, final_yield
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, NULL)
      `, [
        archivedGrow.plant_name,
        archivedGrow.strain,
        archivedGrow.final_stage || 'vegetative',
        archivedGrow.planted_date,
        (() => {
          // Calculate expected harvest approximately 120 days after planted_date
          if (!archivedGrow.planted_date) return null;
          const planted = new Date(archivedGrow.planted_date);
          if (isNaN(planted.getTime())) return null; // Fallback if date parsing fails
          const expectedHarvest = new Date(planted.getTime() + 120 * 24 * 60 * 60 * 1000);
          return expectedHarvest.toISOString();
        })(),
        archivedGrow.notes,
        archivedGrow.grow_tent
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    // Restore archived activity logs (only columns that exist in both tables)
    await new Promise((resolve, reject) => {
      database.run(`
        INSERT INTO logs (
          plant_id, type, description, value, notes, logged_at
        )
        SELECT 
          ?, type, description, value, notes, logged_at
        FROM archived_logs 
        WHERE archived_grow_id = ?
      `, [newPlantId, archivedGrowId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Delete from archived tables
    await new Promise((resolve, reject) => {
      database.run('DELETE FROM archived_logs WHERE archived_grow_id = ?', [archivedGrowId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      database.run('DELETE FROM archived_grows WHERE id = ?', [archivedGrowId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Commit transaction
    await new Promise((resolve, reject) => {
      database.run('COMMIT', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ 
      message: 'Plant unarchived successfully',
      newPlantId: newPlantId,
      plantName: archivedGrow.plant_name
    });

  } catch (error) {
    // Rollback transaction
    database.run('ROLLBACK');
    console.error('Error unarchiving plant:', error);
    res.status(500).json({ error: error.message || 'Failed to unarchive plant' });
  }
});

// GET /api/plants/:id - Get specific plant
// ARCHIVED ROUTES MOVED - START (COMMENTED OUT TO AVOID CONFLICTS)
/*
router.get('/archived/:id', (req, res) => {
  const archivedGrowId = parseInt(req.params.id);
  
  if (isNaN(archivedGrowId)) {
    return res.status(400).json({ error: 'Invalid archived grow ID' });
  }

  const database = db.getDb();
  
  // Get archived grow info
  database.get('SELECT * FROM archived_grows WHERE id = ?', [archivedGrowId], (err, grow) => {
    if (err) {
      console.error('Error fetching archived grow:', err);
      return res.status(500).json({ error: 'Failed to fetch archived grow' });
    }
    
    if (!grow) {
      return res.status(404).json({ error: 'Archived grow not found' });
    }

    // Get archived activity logs
    database.all(
      'SELECT * FROM archived_logs WHERE archived_grow_id = ? ORDER BY logged_at DESC',
      [archivedGrowId],
      (err, activityLogs) => {
        if (err) {
          console.error('Error fetching archived activity logs:', err);
          return res.status(500).json({ error: 'Failed to fetch activity logs' });
        }

        res.json({
          ...grow,
          activityLogs: activityLogs || []
        });
      }
    );
  });
});

// Export archived grow data as CSV
router.get('/archived/:id/export', (req, res) => {
  const archivedGrowId = parseInt(req.params.id);
  
  if (isNaN(archivedGrowId)) {
    return res.status(400).json({ error: 'Invalid archived grow ID' });
  }

  const database = db.getDb();
  
  // Get archived grow info
  database.get('SELECT * FROM archived_grows WHERE id = ?', [archivedGrowId], (err, grow) => {
    if (err) {
      console.error('Error fetching archived grow:', err);
      return res.status(500).json({ error: 'Failed to fetch archived grow' });
    }
    
    if (!grow) {
      return res.status(404).json({ error: 'Archived grow not found' });
    }

    // Get environment data
    database.all(
      'SELECT * FROM archived_environment_data WHERE archived_grow_id = ? ORDER BY logged_at ASC',
      [archivedGrowId],
      (err, environmentData) => {
        if (err) {
          console.error('Error fetching archived environment data:', err);
          return res.status(500).json({ error: 'Failed to fetch environment data' });
        }

        // Create CSV content
        let csvContent = 'Plant Information\n';
        csvContent += `Plant Name,${grow.plant_name}\n`;
        csvContent += `Strain,${grow.strain || 'N/A'}\n`;
        csvContent += `Grow Tent,${grow.grow_tent || 'N/A'}\n`;
        csvContent += `Planted Date,${grow.planted_date || 'N/A'}\n`;
        csvContent += `Harvest Date,${grow.harvest_date || 'N/A'}\n`;
        csvContent += `Final Yield,${grow.final_yield || 'N/A'}\n`;
        csvContent += `Final Stage,${grow.final_stage || 'N/A'}\n`;
        csvContent += `Archive Reason,${grow.archive_reason || 'N/A'}\n`;
        csvContent += `Total Logs,${grow.total_logs}\n`;
        csvContent += `Archived At,${grow.archived_at}\n\n`;

        if (environmentData && environmentData.length > 0) {
          csvContent += 'Environment Data\n';
          csvContent += 'Date,Temperature,Humidity,pH Level,Light Hours,VPD,CO2 PPM,PPFD\n';
          
          environmentData.forEach(env => {
            csvContent += `${env.logged_at},${env.temperature || ''},${env.humidity || ''},${env.ph_level || ''},${env.light_hours || ''},${env.vpd || ''},${env.co2_ppm || ''},${env.ppfd || ''}\n`;
          });
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${grow.plant_name}_grow_data.csv"`);
        res.send(csvContent);
      }
    );
  });
});

// Export all archived data for a specific tent as CSV
router.get('/archived/tent/:tentName/export', (req, res) => {
  const tentName = req.params.tentName;
  
  if (!tentName) {
    return res.status(400).json({ error: 'Tent name is required' });
  }

  const database = db.getDb();
  
  // Get all archived grows for this tent
  database.all(
    'SELECT * FROM archived_grows WHERE grow_tent = ? ORDER BY archived_at DESC',
    [tentName],
    (err, grows) => {
      if (err) {
        console.error('Error fetching archived grows for tent:', err);
        return res.status(500).json({ error: 'Failed to fetch archived grows' });
      }
      
      if (!grows || grows.length === 0) {
        return res.status(404).json({ error: 'No archived grows found for this tent' });
      }

      const growIds = grows.map(g => g.id);
      
      // Get all environment data for these grows
      database.all(
        `SELECT * FROM archived_environment_data 
         WHERE archived_grow_id IN (${growIds.map(() => '?').join(',')}) 
         ORDER BY logged_at ASC`,
        growIds,
        (err, environmentData) => {
          if (err) {
            console.error('Error fetching archived environment data:', err);
            return res.status(500).json({ error: 'Failed to fetch environment data' });
          }

          // Get all plant logs for these grows
          database.all(
            `SELECT al.*, ag.plant_name FROM archived_logs al
             JOIN archived_grows ag ON al.archived_grow_id = ag.id
             WHERE al.archived_grow_id IN (${growIds.map(() => '?').join(',')}) 
             ORDER BY al.logged_at ASC`,
            growIds,
            (err, plantLogs) => {
              if (err) {
                console.error('Error fetching archived plant logs:', err);
                return res.status(500).json({ error: 'Failed to fetch plant logs' });
              }

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
                    csvContent += `${env.logged_at},${env.temperature || ''},${env.humidity || ''},${env.ph_level || ''},${env.light_hours || ''},${env.vpd || ''},${env.co2_ppm || ''},${env.ppfd || ''}\n`;
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
            }
          );
        }
      );
    }
  );
});

// Clear environment data for a tent (for starting new grow cycles)
router.delete('/tent/:tentName/environment', (req, res) => {
  const tentName = req.params.tentName;
  const { confirm } = req.body;
  
  if (!tentName) {
    return res.status(400).json({ error: 'Tent name is required' });
  }
  
  if (!confirm) {
    return res.status(400).json({ error: 'Confirmation required to clear environment data' });
  }

  const database = db.getDb();
  
  // Check if there are any active plants in this tent
  database.get(
    'SELECT COUNT(*) as count FROM plants WHERE grow_tent = ? AND archived = 0',
    [tentName],
    (err, result) => {
      if (err) {
        console.error('Error checking active plants:', err);
        return res.status(500).json({ error: 'Failed to check active plants' });
      }
      
      if (result.count > 0) {
        return res.status(400).json({ 
          error: 'Cannot clear environment data while there are active plants in this tent. Archive all plants first.' 
        });
      }
      
      // Clear environment data for this tent
      database.run(
        'DELETE FROM environment_logs WHERE grow_tent = ?',
        [tentName],
        function(err) {
          if (err) {
            console.error('Error clearing environment data:', err);
            return res.status(500).json({ error: 'Failed to clear environment data' });
          }
          
          res.json({ 
            message: `Environment data cleared for tent ${tentName}`,
            deletedRows: this.changes
          });
        }
      );
    }
  );
});

// Get tent summary with grow cycles
router.get('/tent/:tentName/summary', (req, res) => {
  const tentName = req.params.tentName;
  
  if (!tentName) {
    return res.status(400).json({ error: 'Tent name is required' });
  }

  const database = db.getDb();
  
  // Get current active plants
  database.all(
    'SELECT * FROM plants WHERE grow_tent = ? AND archived = 0',
    [tentName],
    (err, activePlants) => {
      if (err) {
        console.error('Error fetching active plants:', err);
        return res.status(500).json({ error: 'Failed to fetch active plants' });
      }
      
      // Get archived grows (grow cycles)
      database.all(
        'SELECT * FROM archived_grows WHERE grow_tent = ? ORDER BY archived_at DESC',
        [tentName],
        (err, archivedGrows) => {
          if (err) {
            console.error('Error fetching archived grows:', err);
            return res.status(500).json({ error: 'Failed to fetch archived grows' });
          }
          
          // Get environment logs count
          database.get(
            'SELECT COUNT(*) as count FROM environment_logs WHERE grow_tent = ?',
            [tentName],
            (err, envCount) => {
              if (err) {
                console.error('Error counting environment logs:', err);
                return res.status(500).json({ error: 'Failed to count environment logs' });
              }
              
              res.json({
                tentName,
                activePlants: activePlants || [],
                archivedGrows: archivedGrows || [],
                environmentLogsCount: envCount.count,
                totalGrowCycles: (archivedGrows || []).length + (activePlants.length > 0 ? 1 : 0)
              });
            }
          );
        }
      );
    }
  );
});
*/
// ARCHIVED ROUTES MOVED - END

module.exports = router;