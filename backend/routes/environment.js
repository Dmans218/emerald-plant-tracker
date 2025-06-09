const express = require('express');
const router = express.Router();
const Joi = require('joi');
const db = require('../database');

// Validation schema
const environmentSchema = Joi.object({
  temperature: Joi.number().min(-50).max(150).allow(null, ''),
  humidity: Joi.number().min(0).max(100).allow(null, ''),
  ph_level: Joi.number().min(0).max(14).allow(null, ''),
  light_hours: Joi.number().min(0).max(24).allow(null, ''),
  vpd: Joi.number().min(0).max(10).allow(null, ''),
  co2_ppm: Joi.number().min(0).max(5000).allow(null, ''),
  ppfd: Joi.number().min(0).max(3000).allow(null, ''),
  grow_tent: Joi.string().max(100).allow(null, ''),
  notes: Joi.string().max(1000).allow(null, ''),
  logged_at: Joi.date().iso().allow(null, '')
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// GET /api/environment - Get environment logs
router.get('/', (req, res) => {
  const database = db.getDb();
  const { limit = 50, offset = 0, from_date, to_date, grow_tent } = req.query;
  
  // Enhanced query to include plant growth stages from the tent at the time of reading
  let sql = `
    SELECT 
      e.*,
      GROUP_CONCAT(DISTINCT p.stage) as plant_stages,
      COUNT(DISTINCT p.id) as plant_count
    FROM environment_logs e
    LEFT JOIN plants p ON (p.grow_tent = e.grow_tent AND p.archived_at IS NULL)
    WHERE 1=1
  `;
  const params = [];
  
  if (from_date) {
    sql += ' AND e.logged_at >= ?';
    params.push(from_date);
  }
  
  if (to_date) {
    sql += ' AND e.logged_at <= ?';
    params.push(to_date);
  }
  
  if (grow_tent) {
    sql += ' AND e.grow_tent = ?';
    params.push(grow_tent);
  }
  
  sql += ' GROUP BY e.id ORDER BY e.logged_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  database.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching environment logs:', err);
      return res.status(500).json({ error: 'Failed to fetch environment logs' });
    }
    
    // Process the results to format the stage information
    const processedRows = rows.map(row => {
      let dominantStage = 'N/A';
      
      if (row.plant_stages) {
        const stages = row.plant_stages.split(',');
        // Count stage occurrences
        const stageCounts = {};
        stages.forEach(stage => {
          stageCounts[stage] = (stageCounts[stage] || 0) + 1;
        });
        
        // Find most common stage
        dominantStage = Object.keys(stageCounts).reduce((a, b) => 
          stageCounts[a] > stageCounts[b] ? a : b
        );
        
        // Capitalize the stage name
        dominantStage = dominantStage.charAt(0).toUpperCase() + dominantStage.slice(1);
      }
      
      return {
        ...row,
        stage: dominantStage,
        plant_stages: undefined // Remove the raw data
      };
    });
    
    res.json(processedRows);
  });
});

// GET /api/environment/latest - Get latest environment reading
router.get('/latest', (req, res) => {
  const database = db.getDb();
  const { grow_tent } = req.query;
  
  let sql = `
    SELECT 
      e.*,
      GROUP_CONCAT(DISTINCT p.stage) as plant_stages,
      COUNT(DISTINCT p.id) as plant_count
    FROM environment_logs e
    LEFT JOIN plants p ON (p.grow_tent = e.grow_tent AND p.archived_at IS NULL)
  `;
  const params = [];
  
  if (grow_tent) {
    sql += ' WHERE e.grow_tent = ?';
    params.push(grow_tent);
  }
  
  sql += ' GROUP BY e.id ORDER BY e.logged_at DESC LIMIT 1';
  
  database.get(sql, params, (err, row) => {
    if (err) {
      console.error('Error fetching latest environment log:', err);
      return res.status(500).json({ error: 'Failed to fetch latest environment log' });
    }
    
    if (row) {
      let dominantStage = 'N/A';
      
      if (row.plant_stages) {
        const stages = row.plant_stages.split(',');
        const stageCounts = {};
        stages.forEach(stage => {
          stageCounts[stage] = (stageCounts[stage] || 0) + 1;
        });
        
        dominantStage = Object.keys(stageCounts).reduce((a, b) => 
          stageCounts[a] > stageCounts[b] ? a : b
        );
        
        dominantStage = dominantStage.charAt(0).toUpperCase() + dominantStage.slice(1);
      }
      
      row.stage = dominantStage;
      delete row.plant_stages;
    }
    
    res.json(row || {});
  });
});

// GET /api/environment/latest-per-tent - Get latest environment reading for each tent
router.get('/latest-per-tent', (req, res) => {
  const database = db.getDb();
  
  const sql = `
    SELECT 
      e1.*,
      GROUP_CONCAT(DISTINCT p.stage) as plant_stages,
      COUNT(DISTINCT p.id) as plant_count
    FROM environment_logs e1
    LEFT JOIN plants p ON (p.grow_tent = e1.grow_tent AND p.archived_at IS NULL)
    INNER JOIN (
      SELECT grow_tent, MAX(logged_at) as max_logged_at
      FROM environment_logs 
      WHERE grow_tent IS NOT NULL AND grow_tent != ''
      GROUP BY grow_tent
    ) e2 ON e1.grow_tent = e2.grow_tent AND e1.logged_at = e2.max_logged_at
    GROUP BY e1.grow_tent, e1.logged_at
    ORDER BY e1.grow_tent
  `;
  
  database.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching latest environment readings per tent:', err);
      return res.status(500).json({ error: 'Failed to fetch latest environment readings per tent' });
    }
    
    // Process the rows to add dominant stage
    const processedRows = rows.map(row => {
      let dominantStage = 'N/A';
      
      if (row.plant_stages) {
        const stages = row.plant_stages.split(',');
        const stageCounts = {};
        stages.forEach(stage => {
          stageCounts[stage] = (stageCounts[stage] || 0) + 1;
        });
        
        dominantStage = Object.keys(stageCounts).reduce((a, b) => 
          stageCounts[a] > stageCounts[b] ? a : b
        );
        
        dominantStage = dominantStage.charAt(0).toUpperCase() + dominantStage.slice(1);
      }
      
      return {
        ...row,
        stage: dominantStage,
        plant_stages: undefined // Remove this from response
      };
    });
    
    res.json(processedRows);
  });
});

// GET /api/environment/grow-tents - Get all grow tents with environment data
router.get('/grow-tents', (req, res) => {
  const database = db.getDb();
  
  const sql = `
    SELECT DISTINCT grow_tent, COUNT(*) as reading_count, MAX(logged_at) as last_reading
    FROM environment_logs 
    WHERE grow_tent IS NOT NULL AND grow_tent != ''
    GROUP BY grow_tent
    ORDER BY grow_tent
  `;
  
  database.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching environment grow tents:', err);
      return res.status(500).json({ error: 'Failed to fetch grow tents' });
    }
    res.json(rows);
  });
});

// GET /api/environment/weekly - Get weekly averages
router.get('/weekly', (req, res) => {
  const database = db.getDb();
  const { weeks = 8, grow_tent } = req.query;
  
  let whereClause = `logged_at >= datetime('now', '-${parseInt(weeks)} weeks')`;
  const params = [];
  
  if (grow_tent) {
    whereClause += ' AND grow_tent = ?';
    params.push(grow_tent);
  }
  
  const sql = `
    SELECT 
      strftime('%Y-%W', logged_at) as week,
      AVG(temperature) as avg_temperature,
      AVG(humidity) as avg_humidity,
      AVG(ph_level) as avg_ph_level,
      AVG(light_hours) as avg_light_hours,
      AVG(vpd) as avg_vpd,
      AVG(co2_ppm) as avg_co2,
      AVG(ppfd) as avg_ppfd,
      MIN(logged_at) as week_start,
      COUNT(*) as reading_count
    FROM environment_logs 
    WHERE ${whereClause}
    GROUP BY strftime('%Y-%W', logged_at)
    ORDER BY week DESC
  `;
  
  database.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching weekly environment data:', err);
      return res.status(500).json({ error: 'Failed to fetch weekly environment data' });
    }
    res.json(rows);
  });
});

// POST /api/environment - Create environment log
router.post('/', (req, res) => {
  const { error, value } = environmentSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const database = db.getDb();
  const { temperature, humidity, ph_level, light_hours, vpd, co2_ppm, ppfd, grow_tent, notes, logged_at } = value;
  
  const sql = `
    INSERT INTO environment_logs (temperature, humidity, ph_level, light_hours, vpd, co2_ppm, ppfd, grow_tent, notes, logged_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  database.run(sql, [
    temperature, 
    humidity, 
    ph_level, 
    light_hours,
    vpd,
    co2_ppm,
    ppfd,
    grow_tent,
    notes, 
    logged_at || new Date().toISOString()
  ], function(err) {
    if (err) {
      console.error('Error creating environment log:', err);
      return res.status(500).json({ error: 'Failed to create environment log' });
    }
    
    // Fetch the created log
    database.get('SELECT * FROM environment_logs WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        console.error('Error fetching created environment log:', err);
        return res.status(500).json({ error: 'Environment log created but failed to fetch' });
      }
      res.status(201).json(row);
    });
  });
});

// POST /api/environment/spider-farmer - Endpoint for Spider Farmer GGS integration
router.post('/spider-farmer', (req, res) => {
  const { temperature, humidity, ph, light_duration, vpd, timestamp } = req.body;
  
  // Convert Spider Farmer format to our format
  const environmentData = {
    temperature: temperature,
    humidity: humidity,
    ph_level: ph,
    light_hours: light_duration ? light_duration / 3600 : null, // Convert seconds to hours
    notes: vpd ? `VPD: ${vpd}` : 'Auto-logged from Spider Farmer GGS',
    logged_at: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString()
  };
  
  const { error, value } = environmentSchema.validate(environmentData);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const database = db.getDb();
  const { temperature: temp, humidity: hum, ph_level, light_hours, notes, logged_at } = value;
  
  const sql = `
    INSERT INTO environment_logs (temperature, humidity, ph_level, light_hours, notes, logged_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  database.run(sql, [temp, hum, ph_level, light_hours, notes, logged_at], function(err) {
    if (err) {
      console.error('Error creating Spider Farmer environment log:', err);
      return res.status(500).json({ error: 'Failed to create environment log' });
    }
    
    res.status(201).json({ 
      id: this.lastID,
      message: 'Environment data received from Spider Farmer GGS',
      logged_at: logged_at
    });
  });
});

// PUT /api/environment/:id - Update environment log
router.put('/:id', (req, res) => {
  const logId = parseInt(req.params.id);
  
  if (isNaN(logId)) {
    return res.status(400).json({ error: 'Invalid log ID' });
  }
  
  const { error, value } = environmentSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const database = db.getDb();
  const { temperature, humidity, ph_level, light_hours, vpd, co2_ppm, ppfd, grow_tent, notes, logged_at } = value;
  
  const sql = `
    UPDATE environment_logs 
    SET temperature = ?, humidity = ?, ph_level = ?, light_hours = ?, vpd = ?, co2_ppm = ?, ppfd = ?, grow_tent = ?, notes = ?, logged_at = ?
    WHERE id = ?
  `;
  
  database.run(sql, [
    temperature, 
    humidity, 
    ph_level, 
    light_hours,
    vpd,
    co2_ppm,
    ppfd,
    grow_tent,
    notes, 
    logged_at || new Date().toISOString(),
    logId
  ], function(err) {
    if (err) {
      console.error('Error updating environment log:', err);
      return res.status(500).json({ error: 'Failed to update environment log' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Environment log not found' });
    }
    
    // Fetch the updated log
    database.get('SELECT * FROM environment_logs WHERE id = ?', [logId], (err, row) => {
      if (err) {
        console.error('Error fetching updated environment log:', err);
        return res.status(500).json({ error: 'Environment log updated but failed to fetch' });
      }
      res.json(row);
    });
  });
});

// DELETE /api/environment/:id - Delete environment log
router.delete('/:id', (req, res) => {
  const logId = parseInt(req.params.id);
  
  if (isNaN(logId)) {
    return res.status(400).json({ error: 'Invalid log ID' });
  }

  const database = db.getDb();
  
  database.run('DELETE FROM environment_logs WHERE id = ?', [logId], function(err) {
    if (err) {
      console.error('Error deleting environment log:', err);
      return res.status(500).json({ error: 'Failed to delete environment log' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Environment log not found' });
    }
    
    res.json({ message: 'Environment log deleted successfully' });
  });
});

module.exports = router;