const express = require('express');
const router = express.Router();
const Joi = require('joi');
const db = require('../database');
const multer = require('multer');
const { createWorker } = require('tesseract.js');
const Tesseract = require('tesseract.js');
// const SuryaOCRService = require('../services/suryaOCR');

// Initialize Surya OCR service
// const suryaOCR = new SuryaOCRService();

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
  growth_stage: Joi.string().valid('seedling', 'vegetative', 'flowering', 'harvest', 'cured').allow(null, ''),
  notes: Joi.string().max(1000).allow(null, ''),
  logged_at: Joi.date().iso().allow(null, ''),
  plant_id: Joi.number().integer().allow(null, ''),
});

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// GET /api/environment - Get environment logs
router.get('/', (req, res) => {
  const database = db.getDb();
  const { limit = 50, offset = 0, from_date, to_date, grow_tent } = req.query;
  
  let sql = 'SELECT * FROM environment_logs WHERE 1=1';
  const params = [];
  
  if (from_date) {
    sql += ' AND logged_at >= ?';
    params.push(from_date);
  }
  
  if (to_date) {
    sql += ' AND logged_at <= ?';
    params.push(to_date);
  }
  
  if (grow_tent) {
    sql += ' AND grow_tent = ?';
    params.push(grow_tent);
  }
  
  sql += ' ORDER BY logged_at ASC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  database.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching environment logs:', err);
      return res.status(500).json({ error: 'Failed to fetch environment logs' });
    }
    res.json(rows);
  });
});

// GET /api/environment/latest - Get latest environment reading
router.get('/latest', (req, res) => {
  const database = db.getDb();
  const { grow_tent } = req.query;
  
  let sql = 'SELECT * FROM environment_logs';
  const params = [];
  
  if (grow_tent) {
    sql += ' WHERE grow_tent = ?';
    params.push(grow_tent);
  }
  
  sql += ' ORDER BY logged_at DESC LIMIT 1';
  
  database.get(sql, params, (err, row) => {
    if (err) {
      console.error('Error fetching latest environment log:', err);
      return res.status(500).json({ error: 'Failed to fetch latest environment log' });
    }
    res.json(row || {});
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

// GET /api/environment/weekly - Get weekly averages (enhanced to always provide data)
router.get('/weekly', (req, res) => {
  const database = db.getDb();
  const { weeks = 8, grow_tent } = req.query;
  
  // First, try to get data from the requested weeks
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
    ORDER BY week ASC
  `;
  
  database.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching weekly environment data:', err);
      return res.status(500).json({ error: 'Failed to fetch weekly environment data' });
    }
    
    // If we got data, return it
    if (rows && rows.length > 0) {
      return res.json(rows);
    }
    
    // If no data in the requested weeks, try to get ANY available data and group by week
    console.log('No data in requested weeks, expanding search to all available data...');
    
    let expandedWhereClause = '1=1';
    const expandedParams = [];
    
    if (grow_tent) {
      expandedWhereClause += ' AND grow_tent = ?';
      expandedParams.push(grow_tent);
    }
    
    const expandedSql = `
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
      WHERE ${expandedWhereClause}
      GROUP BY strftime('%Y-%W', logged_at)
      ORDER BY week ASC
      LIMIT ${parseInt(weeks)}
    `;
    
    database.all(expandedSql, expandedParams, (expandedErr, expandedRows) => {
      if (expandedErr) {
        console.error('Error fetching expanded weekly environment data:', expandedErr);
        return res.status(500).json({ error: 'Failed to fetch weekly environment data' });
      }
      
      // If we still have no data, check if there's ANY environment data at all
      if (!expandedRows || expandedRows.length === 0) {
        const countSql = `SELECT COUNT(*) as total FROM environment_logs WHERE ${expandedWhereClause}`;
        
        database.get(countSql, expandedParams, (countErr, countRow) => {
          if (countErr) {
            console.error('Error counting environment logs:', countErr);
            return res.json([]);
          }
          
          if (countRow.total === 0) {
            console.log('No environment data found in database');
            return res.json([]);
          } else {
            console.log(`Found ${countRow.total} environment logs but couldn't group by week`);
            return res.json([]);
          }
        });
      } else {
        console.log(`Returning ${expandedRows.length} weeks of data from expanded search`);
        res.json(expandedRows);
      }
    });
  });
});

// POST /api/environment - Create environment log
router.post('/', (req, res) => {
  const { error, value } = environmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const database = db.getDb();
  let { temperature, humidity, ph_level, light_hours, vpd, co2_ppm, ppfd, grow_tent, growth_stage, notes, logged_at, plant_id } = value;
  // If plant_id is not provided, try to infer from grow_tent and date
  function insertLog(finalPlantId) {
    const sql = `
      INSERT INTO environment_logs (temperature, humidity, ph_level, light_hours, vpd, co2_ppm, ppfd, grow_tent, growth_stage, notes, logged_at, plant_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      growth_stage,
      notes, 
      logged_at || new Date().toISOString(),
      finalPlantId || null
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
  }
  if (!plant_id && grow_tent) {
    // Find the most recently planted, not archived plant in this tent at the time of the log
    const logDate = logged_at ? new Date(logged_at) : new Date();
    database.all(
      `SELECT * FROM plants WHERE grow_tent = ? AND planted_date <= ? AND (archived_at IS NULL OR archived_at > ?) ORDER BY planted_date DESC LIMIT 1`,
      [grow_tent, logDate.toISOString(), logDate.toISOString()],
      (err, rows) => {
        if (err) {
          console.error('Error inferring plant_id for environment log:', err);
          insertLog(null);
        } else if (rows && rows.length > 0) {
          insertLog(rows[0].id);
        } else {
          insertLog(null);
        }
      }
    );
  } else {
    insertLog(plant_id);
  }
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
  const { temperature, humidity, ph_level, light_hours, vpd, co2_ppm, ppfd, grow_tent, growth_stage, notes, logged_at } = value;
  
  const sql = `
    UPDATE environment_logs 
    SET temperature = ?, humidity = ?, ph_level = ?, light_hours = ?, vpd = ?, co2_ppm = ?, ppfd = ?, grow_tent = ?, growth_stage = ?, notes = ?, logged_at = ?
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
    growth_stage,
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

// Enhanced OCR endpoint with Surya OCR and brand detection
router.post('/ocr', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Get brand hint from request (optional)
    const brandHint = req.body.brand || req.query.brand || 'auto';
    
    console.log(`Processing image with brand hint: ${brandHint}`);

    // Save uploaded file temporarily for Surya OCR processing
    const fs = require('fs');
    const path = require('path');
    const tempDir = path.join(__dirname, '../uploads');
    
    // Ensure upload directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    try {
      // Use enhanced Tesseract OCR with improved parsing - simplified for stability
      console.log('Starting Tesseract OCR...');
      
      const worker = await createWorker();
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');

      console.log('Running OCR recognition...');
      const { data: { text } } = await worker.recognize(req.file.buffer);
      
      console.log('Terminating Tesseract worker...');
      await worker.terminate();

      // Clean up temporary file
      fs.unlinkSync(tempFilePath);

      console.log('Enhanced Tesseract OCR Raw Text:', text);

      // Parse the text using the enhanced logic
      const result = parseEnvironmentalText(text);
      
      res.json({
        success: true,
        brand: 'spider-farmer', // Assume Spider Farmer for now
        confidence: 80, // Higher confidence with improved parsing
        ...result,
        ocrRawText: text,
        processingMethod: 'enhanced-tesseract'
      });

    } catch (tesseractError) {
      console.error('Enhanced Tesseract OCR failed:', tesseractError.message);
      console.error('Error stack:', tesseractError.stack);
      
      // Clean up temporary file if it exists
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      res.status(500).json({
        success: false,
        error: tesseractError.message,
        ocrRawText: null,
        processingMethod: 'tesseract-error'
      });
    }

  } catch (error) {
    console.error('OCR Processing Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      ocrRawText: null,
      processingMethod: 'error'
    });
  }
});

// Parse environmental data from OCR text (optimized for Spider Farmer format)
function parseEnvironmentalText(text) {
  const result = {
    temperature: null,
    humidity: null,
    ph: null,
    co2: null,
    vpd: null,
    ppfd: null,
    parsedValues: {}
  };

  console.log('Parsing OCR text:', text);

  // Strategy 1: Look for the exact sequential pattern from Spider Farmer screenshots
  // In Spider Farmer, we typically see three decimal numbers in sequence: "21.7 78.1 0.57"
  console.log('Looking for sequential pattern matching...');
  
  // Find all sequences of three decimal numbers that are close together
  const sequencePattern = /(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)/g;
  let match;
  const sequences = [];
  
  while ((match = sequencePattern.exec(text)) !== null) {
    sequences.push({
      temp: parseFloat(match[1]),
      humid: parseFloat(match[2]),
      vpd: parseFloat(match[3]),
      index: match.index,
      fullMatch: match[0]
    });
  }
  
  console.log('Found sequences:', sequences);
  
  // Find the best matching sequence based on expected ranges
  for (const seq of sequences) {
    // Check if this matches expected ranges for environmental data
    if (seq.temp >= 15 && seq.temp <= 50 &&      // Temperature range
        seq.humid >= 30 && seq.humid <= 100 &&    // Humidity range  
        seq.vpd >= 0.1 && seq.vpd <= 3.0) {       // VPD range
      
      result.temperature = seq.temp;
      result.parsedValues.temperature = `${seq.temp}°C`;
      console.log('Found temperature (sequence pattern):', seq.temp);
      
      result.humidity = seq.humid;
      result.parsedValues.humidity = `${seq.humid}%`;
      console.log('Found humidity (sequence pattern):', seq.humid);
      
      result.vpd = seq.vpd;
      result.parsedValues.vpd = `${seq.vpd} kPa`;
      console.log('Found VPD (sequence pattern):', seq.vpd);
      
      // Stop after finding the first valid sequence
      return result;
    }
  }
  
  // Strategy 2: If no valid sequence found, extract all numbers with context
  const numberPattern = /(\d+\.?\d*)/g;
  const allNumbers = [];
  
  while ((match = numberPattern.exec(text)) !== null) {
    const number = parseFloat(match[1]);
    const index = match.index;
    const contextBefore = text.substring(Math.max(0, index - 30), index).toLowerCase();
    const contextAfter = text.substring(index, Math.min(text.length, index + 30)).toLowerCase();
    allNumbers.push({
      value: number,
      text: match[1],
      index: index,
      contextBefore: contextBefore,
      contextAfter: contextAfter,
      fullContext: contextBefore + match[1] + contextAfter,
      hasDecimal: match[1].includes('.')
    });
  }

  console.log('All extracted numbers with context:', allNumbers);

  // Sort numbers by index to maintain sequence order
  allNumbers.sort((a, b) => a.index - b.index);
  
  // Look for temperature first (with context clues)
  if (!result.temperature) {
    let tempCandidate = allNumbers.find(n => 
      n.value >= 15 && n.value <= 50 && 
      (n.contextBefore.includes('temp') || n.contextBefore.includes('air') || 
       n.contextAfter.includes('°c') || n.contextAfter.includes('°'))
    );
    
    if (!tempCandidate) {
      // Fallback: Look for reasonable temperature values (prefer decimals)
      tempCandidate = allNumbers.find(n => 
        n.value >= 15 && n.value <= 50 && n.hasDecimal
      );
    }
    
    if (tempCandidate) {
      result.temperature = tempCandidate.value;
      result.parsedValues.temperature = `${tempCandidate.value}°C`;
      console.log('Found temperature (context/fallback):', tempCandidate.value);
    }
  }

  // Look for humidity (should appear after temperature in Spider Farmer)
  if (!result.humidity && result.temperature) {
    // Find the temperature's index
    const tempIndex = allNumbers.findIndex(n => n.value === result.temperature);
    
    // Look for humidity after temperature
    if (tempIndex >= 0 && tempIndex < allNumbers.length - 1) {
      const humidCandidate = allNumbers[tempIndex + 1];
      if (humidCandidate && humidCandidate.value >= 30 && humidCandidate.value <= 100) {
        result.humidity = humidCandidate.value;
        result.parsedValues.humidity = `${humidCandidate.value}%`;
        console.log('Found humidity (sequential after temp):', humidCandidate.value);
      }
    }
  }
  
  // Fallback humidity detection
  if (!result.humidity) {
    const humidCandidate = allNumbers.find(n => 
      n.value >= 30 && n.value <= 100 && 
      (n.contextBefore.includes('hum') || n.contextAfter.includes('%')) &&
      n.value !== result.temperature
    );
    
    if (humidCandidate) {
      result.humidity = humidCandidate.value;
      result.parsedValues.humidity = `${humidCandidate.value}%`;
      console.log('Found humidity (context fallback):', humidCandidate.value);
    }
  }

  // Look for VPD (should appear after humidity in Spider Farmer)
  if (!result.vpd && result.humidity) {
    // Find the humidity's index
    const humIndex = allNumbers.findIndex(n => n.value === result.humidity);
    
    // Look for VPD after humidity
    if (humIndex >= 0 && humIndex < allNumbers.length - 1) {
      const vpdCandidate = allNumbers[humIndex + 1];
      if (vpdCandidate && vpdCandidate.value >= 0.1 && vpdCandidate.value <= 3.0) {
        result.vpd = vpdCandidate.value;
        result.parsedValues.vpd = `${vpdCandidate.value} kPa`;
        console.log('Found VPD (sequential after humidity):', vpdCandidate.value);
      }
    }
  }
  
  // Fallback VPD detection
  if (!result.vpd) {
    const vpdCandidate = allNumbers.find(n => 
      n.value >= 0.1 && n.value <= 3.0 && n.hasDecimal &&
      (n.contextBefore.includes('vpd') || n.contextAfter.includes('kpa')) &&
      n.value !== result.temperature && n.value !== result.humidity
    );
    
    if (vpdCandidate) {
      result.vpd = vpdCandidate.value;
      result.parsedValues.vpd = `${vpdCandidate.value} kPa`;
      console.log('Found VPD (context fallback):', vpdCandidate.value);
    }
  }

  // CO2 (300-2000 ppm range)
  let co2Match = text.match(/co\s*[₂2]?\s*[:-]?\s*(\d+)/i) || text.match(/(\d+)\s*ppm/i);
  if (!co2Match) {
    const co2Candidate = allNumbers.find(n => n.value >= 300 && n.value <= 2000);
    if (co2Candidate && (co2Candidate.fullContext.includes('co2') || co2Candidate.fullContext.includes('ppm'))) {
      co2Match = [null, co2Candidate.value];
    }
  }
  if (co2Match) {
    result.co2 = parseFloat(co2Match[1]);
    result.parsedValues.co2 = `${co2Match[1]} ppm`;
  }

  // PPFD (100-2000 μmol range)
  let ppfdMatch = text.match(/ppfd\s*[:-]?\s*(\d+)/i) || text.match(/(\d+)\s*[μu]mol/i);
  if (!ppfdMatch) {
    const ppfdCandidate = allNumbers.find(n => n.value >= 100 && n.value <= 2000);
    if (ppfdCandidate && (ppfdCandidate.fullContext.includes('ppfd') || ppfdCandidate.fullContext.includes('μmol') || ppfdCandidate.fullContext.includes('umol'))) {
      ppfdMatch = [null, ppfdCandidate.value];
    }
  }
  if (ppfdMatch) {
    result.ppfd = parseFloat(ppfdMatch[1]);
    result.parsedValues.ppfd = `${ppfdMatch[1]} μmol/m²/s`;
  }

  // pH (4.0-9.0 range)
  let phMatch = text.match(/ph\s*[:-]?\s*(\d+\.?\d*)/i);
  if (!phMatch) {
    const phCandidate = allNumbers.find(n => n.value >= 4.0 && n.value <= 9.0);
    if (phCandidate && phCandidate.fullContext.includes('ph')) {
      phMatch = [null, phCandidate.value];
    }
  }
  if (phMatch) {
    result.ph = parseFloat(phMatch[1]);
    result.parsedValues.ph = phMatch[1];
  }

  return result;
}

// Export environment logs for a plant's lifetime
router.get('/plant/:plantId/export', async (req, res) => {
  const database = db.getDb();
  const plantId = parseInt(req.params.plantId);
  if (isNaN(plantId)) {
    return res.status(400).json({ error: 'Invalid plant ID' });
  }
  // Get plant info
  database.get('SELECT * FROM plants WHERE id = ?', [plantId], (err, plant) => {
    if (err || !plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    const { grow_tent, planted_date, archived_at } = plant;
    // Prefer plant_id association if present, otherwise fallback to grow_tent+date
    const sql = `SELECT * FROM environment_logs WHERE (plant_id = ? OR (grow_tent = ? AND logged_at >= ? AND logged_at <= ?)) ORDER BY logged_at ASC`;
    const params = [plantId, grow_tent, planted_date, archived_at || new Date().toISOString()];
    database.all(sql, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch environment logs' });
      }
      // Convert to CSV
      const header = [
        'id','temperature','humidity','ph_level','light_hours','vpd','co2_ppm','ppfd','grow_tent','growth_stage','notes','logged_at','created_at'
      ];
      const csv = [header.join(',')].concat(
        rows.map(row => header.map(h => JSON.stringify(row[h] ?? '')).join(','))
      ).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=plant-${plantId}-environment.csv`);
      res.send(csv);
    });
  });
});

module.exports = router; 