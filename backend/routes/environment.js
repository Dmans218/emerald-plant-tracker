const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { query } = require('../config/database');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const upload = multer({
  dest: path.join(__dirname, '../uploads/temp/'),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../uploads/temp/');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

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
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, from_date, to_date, grow_tent } = req.query;
    
    // Enhanced query to include plant growth stages from the tent at the time of reading
    let sql = `
      SELECT 
        e.*,
        STRING_AGG(DISTINCT p.stage, ',') as plant_stages,
        COUNT(DISTINCT p.id) as plant_count
      FROM environment_logs e
      LEFT JOIN plants p ON (p.grow_tent = e.grow_tent AND p.archived_at IS NULL)
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    if (from_date) {
      sql += ` AND e.logged_at >= $${paramIndex++}`;
      params.push(from_date);
    }
    
    if (to_date) {
      sql += ` AND e.logged_at <= $${paramIndex++}`;
      params.push(to_date);
    }
    
    if (grow_tent) {
      sql += ` AND e.grow_tent = $${paramIndex++}`;
      params.push(grow_tent);
    }
    
    sql += ` GROUP BY e.id ORDER BY e.logged_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await query(sql, params);
    
    // Process the results to format the stage information
    const processedRows = result.rows.map(row => {
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
  } catch (err) {
    console.error('Error fetching environment logs:', err);
    res.status(500).json({ error: 'Failed to fetch environment logs' });
  }
});

// GET /api/environment/latest - Get latest environment reading
router.get('/latest', async (req, res) => {
  try {
    const { grow_tent } = req.query;
    
    let sql = `
      SELECT 
        e.*,
        STRING_AGG(DISTINCT p.stage, ',') as plant_stages,
        COUNT(DISTINCT p.id) as plant_count
      FROM environment_logs e
      LEFT JOIN plants p ON (p.grow_tent = e.grow_tent AND p.archived_at IS NULL)
    `;
    const params = [];
    let paramIndex = 1;
    
    if (grow_tent) {
      sql += ` WHERE e.grow_tent = $${paramIndex++}`;
      params.push(grow_tent);
    }
    
    sql += ' GROUP BY e.id ORDER BY e.logged_at DESC LIMIT 1';
    
    const result = await query(sql, params);
    let row = result.rows[0];
    
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
  } catch (err) {
    console.error('Error fetching latest environment log:', err);
    res.status(500).json({ error: 'Failed to fetch latest environment log' });
  }
});

// GET /api/environment/latest-per-tent - Get latest environment reading for each tent
router.get('/latest-per-tent', async (req, res) => {
  try {
    const sql = `
      SELECT 
        e1.*,
        STRING_AGG(DISTINCT p.stage, ',') as plant_stages,
        COUNT(DISTINCT p.id) as plant_count
      FROM environment_logs e1
      LEFT JOIN plants p ON (p.grow_tent = e1.grow_tent AND p.archived_at IS NULL)
      INNER JOIN (
        SELECT grow_tent, MAX(logged_at) as max_logged_at
        FROM environment_logs 
        WHERE grow_tent IS NOT NULL AND grow_tent != ''
        GROUP BY grow_tent
      ) e2 ON e1.grow_tent = e2.grow_tent AND e1.logged_at = e2.max_logged_at
      GROUP BY e1.grow_tent, e1.logged_at, e1.id, e1.temperature, e1.humidity, e1.ph_level, e1.light_hours, e1.vpd, e1.co2_ppm, e1.ppfd, e1.notes, e1.logged_at, e1.created_at
      ORDER BY e1.grow_tent
    `;
    
    const result = await query(sql, []);
    
    // Process the rows to add dominant stage
    const processedRows = result.rows.map(row => {
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
  } catch (err) {
    console.error('Error fetching latest environment readings per tent:', err);
    res.status(500).json({ error: 'Failed to fetch latest environment readings per tent' });
  }
});

// GET /api/environment/grow-tents - Get all grow tents with environment data
router.get('/grow-tents', async (req, res) => {
  try {
    const sql = `
      SELECT DISTINCT grow_tent, COUNT(*) as reading_count, MAX(logged_at) as last_reading
      FROM environment_logs 
      WHERE grow_tent IS NOT NULL AND grow_tent != ''
      GROUP BY grow_tent
      ORDER BY grow_tent
    `;
    
    const result = await query(sql, []);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching environment grow tents:', err);
    res.status(500).json({ error: 'Failed to fetch grow tents' });
  }
});

// GET /api/environment/weekly - Get weekly averages
router.get('/weekly', async (req, res) => {
  try {
    const { weeks = 8, grow_tent } = req.query;
    
    let whereClause = `logged_at >= NOW() - INTERVAL '${parseInt(weeks)} weeks'`;
    const params = [];
    let paramIndex = 1;
    
    if (grow_tent) {
      whereClause += ` AND grow_tent = $${paramIndex++}`;
      params.push(grow_tent);
    }
    
    const sql = `
      SELECT 
        TO_CHAR(logged_at, 'IYYY-IW') as week,
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
      GROUP BY TO_CHAR(logged_at, 'IYYY-IW')
      ORDER BY week DESC
    `;
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching weekly environment data:', err);
    res.status(500).json({ error: 'Failed to fetch weekly environment data' });
  }
});

// POST /api/environment - Create environment log
router.post('/', async (req, res) => {
  try {
    const { error, value } = environmentSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { temperature, humidity, ph_level, light_hours, vpd, co2_ppm, ppfd, grow_tent, notes, logged_at } = value;
    
    const sql = `
      INSERT INTO environment_logs (
        temperature, humidity, ph_level, light_hours, vpd, co2_ppm, ppfd, 
        grow_tent, notes, logged_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const result = await query(sql, [
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
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating environment log:', err);
    res.status(500).json({ error: 'Failed to create environment log' });
  }
});

// POST /api/environment/import-csv - Import CSV data from Spider Farmer GGS
router.post('/import-csv', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    let { grow_tent } = req.body;
    
    // If no tent specified, try to get existing tent or default to 'Main Tent'
    if (!grow_tent || grow_tent.trim() === '') {
      // Check if there are any existing tents
      const existingTents = await query(`
        SELECT DISTINCT grow_tent 
        FROM plants 
        WHERE grow_tent IS NOT NULL AND grow_tent != '' 
        LIMIT 1
      `);
      
      if (existingTents.rows.length > 0) {
        grow_tent = existingTents.rows[0].grow_tent;
        console.log(`📍 Using existing tent: ${grow_tent}`);
      } else {
        grow_tent = 'Main Tent';
        console.log(`📍 Creating new tent: ${grow_tent}`);
      }
    }
    const csvFilePath = req.file.path;
    const results = [];
    const errors = [];
    let duplicateCount = 0;
    let importedCount = 0;

    // Parse CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            // Map SpiderFarmer GGS CSV columns to our database fields
            const timestamp = row['Timestamp'] || row['timestamp'];
            const deviceSerial = row['deviceSerialnum'] || row['device_serial'] || null;
            
            // Temperature fields - prefer Fahrenheit from GGS, convert Celsius if needed
            const temperatureF = parseFloat(row['temperature(°F)'] || row['temperature_f']);
            const temperatureC = parseFloat(row['temperature(°C)'] || row['temperature_c'] || row['temperature']);
            
            // Use Fahrenheit if available, otherwise convert from Celsius
            let finalTempF = null;
            if (!isNaN(temperatureF)) {
              finalTempF = temperatureF;
            } else if (!isNaN(temperatureC)) {
              finalTempF = (temperatureC * 9/5) + 32; // Convert C to F
            }
            
            // Other environmental data
            const humidity = parseFloat(row['humidity']);
            const vpd = parseFloat(row['vpd'] || row['VPD']);
            const co2 = parseFloat(row['co2'] || row['CO2']);
            const ppfd = parseFloat(row['ppfd'] || row['PPFD']);
            
            // Soil temperature fields
            const soilTempF = parseFloat(row['temperature_soil_f(°F)'] || row['soil_temp_f']);
            const soilTempC = parseFloat(row['temperature_soil(°C)'] || row['soil_temp_c']);
            
            // Power consumption
            const power = parseFloat(row['power'] || row['power_consumption']);
            
            // Validate essential fields
            if (!timestamp || (isNaN(finalTempF) && isNaN(temperatureC)) || isNaN(humidity)) {
              errors.push(`Missing essential data in row: ${JSON.stringify(row)}`);
              return;
            }

            // Convert timestamp to ISO format
            const loggedAt = new Date(timestamp);
            if (isNaN(loggedAt.getTime())) {
              errors.push(`Invalid timestamp format: ${timestamp}`);
              return;
            }

            results.push({
              device_serial: deviceSerial,
              temperature: finalTempF || temperatureC, // Store final temperature
              humidity: humidity,
              vpd: isNaN(vpd) ? null : vpd,
              co2_ppm: isNaN(co2) ? null : co2,
              ppfd: isNaN(ppfd) ? null : ppfd,
              soil_temperature_f: isNaN(soilTempF) ? null : soilTempF,
              soil_temperature_c: isNaN(soilTempC) ? null : soilTempC,
              power_consumption: isNaN(power) ? null : power,
              grow_tent: grow_tent,
              notes: `Imported from SpiderFarmer GGS${deviceSerial ? ` (Device: ${deviceSerial})` : ''}`,
              logged_at: loggedAt.toISOString()
            });
          } catch (error) {
            errors.push(`Error parsing row: ${error.message}`);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Clean up uploaded file
    fs.unlinkSync(csvFilePath);

    console.log(`📊 Parsed ${results.length} records from SpiderFarmer GGS CSV`);

    // Process records and handle deduplication
    for (const record of results) {
      try {
        // Check if record already exists (within 2 minute tolerance for timestamp matching)
        const existingCheck = await query(`
          SELECT id FROM environment_logs 
          WHERE grow_tent = $1 
          AND logged_at BETWEEN $2 AND $3
          ${record.device_serial ? 'AND device_serial = $4' : ''}
        `, record.device_serial ? [
          record.grow_tent,
          new Date(new Date(record.logged_at).getTime() - 120000).toISOString(), // 2 minutes before
          new Date(new Date(record.logged_at).getTime() + 120000).toISOString(),  // 2 minutes after
          record.device_serial
        ] : [
          record.grow_tent,
          new Date(new Date(record.logged_at).getTime() - 120000).toISOString(),
          new Date(new Date(record.logged_at).getTime() + 120000).toISOString()
        ]);

        if (existingCheck.rows.length > 0) {
          duplicateCount++;
          console.log(`⚠️  Duplicate record found for ${record.logged_at}, skipping`);
          continue;
        }

        // Insert new record with all GGS fields
        await query(`
          INSERT INTO environment_logs (
            device_serial, temperature, humidity, vpd, co2_ppm, ppfd, 
            soil_temperature_f, soil_temperature_c, power_consumption, 
            grow_tent, notes, logged_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          record.device_serial,
          record.temperature,
          record.humidity,
          record.vpd,
          record.co2_ppm,
          record.ppfd,
          record.soil_temperature_f,
          record.soil_temperature_c,
          record.power_consumption,
          record.grow_tent,
          record.notes,
          record.logged_at
        ]);

        importedCount++;
      } catch (insertError) {
        console.error('Error inserting record:', insertError);
        errors.push(`Failed to insert record for ${record.logged_at}: ${insertError.message}`);
      }
    }

    // Analyze what fields were successfully imported
    const fieldsImported = [];
    if (results.some(r => r.temperature)) fieldsImported.push('Temperature');
    if (results.some(r => r.humidity)) fieldsImported.push('Humidity');
    if (results.some(r => r.vpd)) fieldsImported.push('VPD');
    if (results.some(r => r.co2_ppm)) fieldsImported.push('CO2');
    if (results.some(r => r.ppfd)) fieldsImported.push('PPFD');
    if (results.some(r => r.soil_temperature_f)) fieldsImported.push('Soil Temperature');
    if (results.some(r => r.power_consumption)) fieldsImported.push('Power Consumption');
    if (results.some(r => r.device_serial)) fieldsImported.push('Device Serial');

    res.json({
      success: true,
      message: 'SpiderFarmer GGS CSV import completed',
      stats: {
        totalParsed: results.length,
        imported: importedCount,
        duplicates: duplicateCount,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors.slice(0, 10) : [], // Limit errors in response
      fieldsImported: fieldsImported,
      targetTent: grow_tent,
      deviceInfo: results.length > 0 && results[0].device_serial ? {
        deviceSerial: results[0].device_serial,
        dateRange: {
          start: results[results.length - 1].logged_at,
          end: results[0].logged_at
        }
      } : null
    });

  } catch (error) {
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Error importing CSV:', error);
    res.status(500).json({ 
      error: 'Failed to import CSV file', 
      details: error.message 
    });
  }
});

// POST /api/environment/spider-farmer - Endpoint for Spider Farmer GGS integration
router.post('/spider-farmer', async (req, res) => {
  try {
    const { temperature, humidity, ph, light_duration, vpd, timestamp } = req.body;
    
    // Convert Spider Farmer format to our format
    const environmentData = {
      temperature: temperature,
      humidity: humidity,
      ph_level: ph,
      light_hours: light_duration ? light_duration / 3600 : null, // Convert seconds to hours
      vpd: vpd || null,
      notes: 'Auto-logged from Spider Farmer GGS',
      logged_at: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString()
    };
    
    const { error, value } = environmentSchema.validate(environmentData);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { temperature: temp, humidity: hum, ph_level, light_hours, vpd: vpdValue, notes, logged_at } = value;
    
    const sql = `
      INSERT INTO environment_logs (temperature, humidity, ph_level, light_hours, vpd, notes, logged_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await query(sql, [temp, hum, ph_level, light_hours, vpdValue, notes, logged_at]);
    
    res.status(201).json({ 
      ...result.rows[0],
      message: 'Environment data received from Spider Farmer GGS'
    });
  } catch (err) {
    console.error('Error creating Spider Farmer environment log:', err);
    res.status(500).json({ error: 'Failed to create environment log' });
  }
});

// PUT /api/environment/:id - Update environment log
router.put('/:id', async (req, res) => {
  try {
    const logId = parseInt(req.params.id);
    
    if (isNaN(logId)) {
      return res.status(400).json({ error: 'Invalid log ID' });
    }
    
    const { error, value } = environmentSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { temperature, humidity, ph_level, light_hours, vpd, co2_ppm, ppfd, grow_tent, notes, logged_at } = value;
    
    const sql = `
      UPDATE environment_logs 
      SET temperature = $1, humidity = $2, ph_level = $3, light_hours = $4, vpd = $5, 
          co2_ppm = $6, ppfd = $7, grow_tent = $8, notes = $9, logged_at = $10
      WHERE id = $11
      RETURNING *
    `;
    
    const result = await query(sql, [
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
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Environment log not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating environment log:', err);
    res.status(500).json({ error: 'Failed to update environment log' });
  }
});

// DELETE /api/environment/:id - Delete environment log
router.delete('/:id', async (req, res) => {
  try {
    const logId = parseInt(req.params.id);
    
    if (isNaN(logId)) {
      return res.status(400).json({ error: 'Invalid log ID' });
    }

    const sql = 'DELETE FROM environment_logs WHERE id = $1 RETURNING id';
    const result = await query(sql, [logId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Environment log not found' });
    }
    
    res.json({ message: 'Environment log deleted successfully' });
  } catch (err) {
    console.error('Error deleting environment log:', err);
    res.status(500).json({ error: 'Failed to delete environment log' });
  }
});

module.exports = router;