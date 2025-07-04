const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Joi = require('joi');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../database');

// File type validation using magic numbers (file signatures)
const allowedMimeTypes = new Map([
  ['image/jpeg', [0xFF, 0xD8, 0xFF]],
  ['image/png', [0x89, 0x50, 0x4E, 0x47]],
  ['image/gif', [0x47, 0x49, 0x46]]
]);

// Secure filename generation
const generateSecureFilename = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  const secureId = crypto.randomUUID();
  return `plant-${secureId}${ext}`;
};

// Validate file content by checking magic numbers
const validateFileContent = (buffer, mimetype) => {
  const signature = allowedMimeTypes.get(mimetype);
  if (!signature) return false;
  
  return signature.every((byte, index) => buffer[index] === byte);
};

// Configure multer for photo uploads with enhanced security
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    // Ensure the path doesn't escape the uploads directory
    const normalizedPath = path.normalize(uploadPath);
    if (!normalizedPath.startsWith(path.join(__dirname, '../uploads'))) {
      return cb(new Error('Invalid upload path'), null);
    }
    cb(null, normalizedPath);
  },
  filename: (req, file, cb) => {
    const secureFilename = generateSecureFilename(file.originalname);
    cb(null, secureFilename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // Reduced to 5MB limit for security
    files: 1 // Only allow 1 file per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.has(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and GIF image files are allowed'));
    }
  }
});

// Validation schemas
const logSchema = Joi.object({
  plant_id: Joi.number().integer().required(),
  type: Joi.string().valid(
    'watering', 'feeding', 'environmental', 'observation', 'training', 
    'transplant', 'pest_disease', 'deficiency', 'measurement', 'photo'
  ).required(),
  description: Joi.string().max(1000).allow(null, ''),
  value: Joi.number().allow(null, ''),
  unit: Joi.string().max(20).allow(null, ''),
  notes: Joi.string().max(2000).allow(null, ''),
  ph_level: Joi.number().min(0).max(14).allow(null, ''),
  ec_tds: Joi.number().min(0).allow(null, ''),
  temperature: Joi.number().allow(null, ''),
  humidity: Joi.number().min(0).max(100).allow(null, ''),
  light_intensity: Joi.number().min(0).allow(null, ''),
  co2_level: Joi.number().min(0).allow(null, ''),
  water_amount: Joi.number().min(0).allow(null, ''),
  nutrient_info: Joi.string().max(500).allow(null, ''),
  height_cm: Joi.number().min(0).allow(null, ''),
  logged_at: Joi.date().iso().allow(null, '')
});

// GET /api/logs - Get all logs with optional filtering
router.get('/', (req, res) => {
  const database = db.getDb();
  const { plant_id, type, limit = 100, offset = 0 } = req.query;
  
  let sql = `
    SELECT l.*, p.name as plant_name 
    FROM logs l 
    LEFT JOIN plants p ON l.plant_id = p.id 
    WHERE 1=1
  `;
  const params = [];
  
  if (plant_id) {
    sql += ' AND l.plant_id = ?';
    params.push(parseInt(plant_id));
  }
  
  if (type) {
    sql += ' AND l.type = ?';
    params.push(type);
  }
  
  sql += ' ORDER BY l.logged_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  database.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching logs:', err);
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }
    res.json(rows);
  });
});

// GET /api/logs/:id - Get specific log
router.get('/:id(\\d+)', (req, res) => {
  const database = db.getDb();
  const logId = parseInt(req.params.id);
  
  if (isNaN(logId)) {
    return res.status(400).json({ error: 'Invalid log ID' });
  }

  const sql = `
    SELECT l.*, p.name as plant_name 
    FROM logs l 
    LEFT JOIN plants p ON l.plant_id = p.id 
    WHERE l.id = ?
  `;
  
  database.get(sql, [logId], (err, row) => {
    if (err) {
      console.error('Error fetching log:', err);
      return res.status(500).json({ error: 'Failed to fetch log' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Log not found' });
    }
    
    res.json(row);
  });
});

// POST /api/logs - Create new log
router.post('/', (req, res) => {
  const { error, value } = logSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const database = db.getDb();
  const { 
    plant_id, type, description, value: logValue, unit, notes,
    ph_level, ec_tds, temperature, humidity, light_intensity, 
    co2_level, water_amount, nutrient_info, height_cm, logged_at 
  } = value;
  
  // Verify plant exists
  database.get('SELECT id FROM plants WHERE id = ?', [plant_id], (err, plant) => {
    if (err) {
      console.error('Error checking plant:', err);
      return res.status(500).json({ error: 'Failed to verify plant' });
    }
    
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    const sql = `
      INSERT INTO logs (
        plant_id, type, description, value, unit, notes,
        ph_level, ec_tds, temperature, humidity, light_intensity,
        co2_level, water_amount, nutrient_info, height_cm, logged_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    database.run(sql, [
      plant_id, type, description, logValue, unit, notes,
      ph_level, ec_tds, temperature, humidity, light_intensity,
      co2_level, water_amount, nutrient_info, height_cm, 
      logged_at || new Date().toISOString()
    ], function(err) {
      if (err) {
        console.error('Error creating log:', err);
        return res.status(500).json({ error: 'Failed to create log' });
      }
      
      // Fetch the created log
      const fetchSql = `
        SELECT l.*, p.name as plant_name 
        FROM logs l 
        LEFT JOIN plants p ON l.plant_id = p.id 
        WHERE l.id = ?
      `;
      
      database.get(fetchSql, [this.lastID], (err, row) => {
        if (err) {
          console.error('Error fetching created log:', err);
          return res.status(500).json({ error: 'Log created but failed to fetch' });
        }
        res.status(201).json(row);
      });
    });
  });
});

// POST /api/logs/photo - Upload photo log with content validation
router.post('/photo', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No photo uploaded' });
  }

  // Validate and sanitize file path to prevent path traversal attacks
  const filePath = path.resolve(req.file.path);
  const uploadDir = path.resolve('./uploads');
  
  // Ensure the file is within the uploads directory
  if (!filePath.startsWith(uploadDir)) {
    return res.status(400).json({ error: 'Invalid file path' });
  }
  
  const buffer = fs.readFileSync(filePath);
  
  if (!validateFileContent(buffer, req.file.mimetype)) {
    // Remove the invalid file
    fs.unlinkSync(filePath);
    return res.status(400).json({ error: 'Invalid file content. File does not match expected image format.' });
  }

  const { plant_id, description } = req.body;
  
  if (!plant_id) {
    // Clean up uploaded file if validation fails
    fs.unlinkSync(filePath);
    return res.status(400).json({ error: 'Plant ID is required' });
  }

  const database = db.getDb();
  const photoUrl = `/uploads/${req.file.filename}`;
  
  // Verify plant exists
  database.get('SELECT id FROM plants WHERE id = ?', [parseInt(plant_id)], (err, plant) => {
    if (err) {
      console.error('Error checking plant:', err);
      return res.status(500).json({ error: 'Failed to verify plant' });
    }
    
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    const sql = `
      INSERT INTO logs (plant_id, type, description, photo_url, logged_at)
      VALUES (?, 'photo', ?, ?, ?)
    `;
    
    database.run(sql, [parseInt(plant_id), description || 'Photo upload', photoUrl, new Date().toISOString()], function(err) {
      if (err) {
        console.error('Error creating photo log:', err);
        return res.status(500).json({ error: 'Failed to create photo log' });
      }
      
      // Fetch the created log
      const fetchSql = `
        SELECT l.*, p.name as plant_name 
        FROM logs l 
        LEFT JOIN plants p ON l.plant_id = p.id 
        WHERE l.id = ?
      `;
      
      database.get(fetchSql, [this.lastID], (err, row) => {
        if (err) {
          console.error('Error fetching created photo log:', err);
          return res.status(500).json({ error: 'Photo log created but failed to fetch' });
        }
        res.status(201).json(row);
      });
    });
  });
});

// PUT /api/logs/:id - Update log
router.put('/:id(\\d+)', (req, res) => {
  const logId = parseInt(req.params.id);
  
  if (isNaN(logId)) {
    return res.status(400).json({ error: 'Invalid log ID' });
  }

  const { error, value } = logSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const database = db.getDb();
  const { 
    plant_id, type, description, value: logValue, unit, notes,
    ph_level, ec_tds, temperature, humidity, light_intensity, 
    co2_level, water_amount, nutrient_info, height_cm, logged_at 
  } = value;
  
  // Verify plant exists
  database.get('SELECT id FROM plants WHERE id = ?', [plant_id], (err, plant) => {
    if (err) {
      console.error('Error checking plant:', err);
      return res.status(500).json({ error: 'Failed to verify plant' });
    }
    
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    const sql = `
      UPDATE logs SET 
        plant_id = ?, type = ?, description = ?, value = ?, unit = ?, notes = ?,
        ph_level = ?, ec_tds = ?, temperature = ?, humidity = ?, light_intensity = ?,
        co2_level = ?, water_amount = ?, nutrient_info = ?, height_cm = ?, logged_at = ?
      WHERE id = ?
    `;
    
    database.run(sql, [
      plant_id, type, description, logValue, unit, notes,
      ph_level, ec_tds, temperature, humidity, light_intensity,
      co2_level, water_amount, nutrient_info, height_cm, 
      logged_at || new Date().toISOString(), logId
    ], function(err) {
      if (err) {
        console.error('Error updating log:', err);
        return res.status(500).json({ error: 'Failed to update log' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Log not found' });
      }
      
      // Fetch the updated log
      const fetchSql = `
        SELECT l.*, p.name as plant_name 
        FROM logs l 
        LEFT JOIN plants p ON l.plant_id = p.id 
        WHERE l.id = ?
      `;
      
      database.get(fetchSql, [logId], (err, row) => {
        if (err) {
          console.error('Error fetching updated log:', err);
          return res.status(500).json({ error: 'Log updated but failed to fetch' });
        }
        res.json(row);
      });
    });
  });
});

// DELETE /api/logs/:id - Delete log
router.delete('/:id(\\d+)', (req, res) => {
  const logId = parseInt(req.params.id);
  
  if (isNaN(logId)) {
    return res.status(400).json({ error: 'Invalid log ID' });
  }

  const database = db.getDb();
  
  database.run('DELETE FROM logs WHERE id = ?', [logId], function(err) {
    if (err) {
      console.error('Error deleting log:', err);
      return res.status(500).json({ error: 'Failed to delete log' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }
    
    res.json({ message: 'Log deleted successfully' });
  });
});

// GET /api/logs/stats/:plant_id - Get statistics for a plant
router.get('/stats/:plant_id', (req, res) => {
  const plantId = parseInt(req.params.plant_id);
  
  if (isNaN(plantId)) {
    return res.status(400).json({ error: 'Invalid plant ID' });
  }

  const database = db.getDb();
  
  const sql = `
    SELECT 
      type,
      COUNT(*) as count,
      MAX(logged_at) as last_logged,
      AVG(value) as avg_value
    FROM logs 
    WHERE plant_id = ? 
    GROUP BY type
    ORDER BY count DESC
  `;
  
  database.all(sql, [plantId], (err, rows) => {
    if (err) {
      console.error('Error fetching log stats:', err);
      return res.status(500).json({ error: 'Failed to fetch log statistics' });
    }
    res.json(rows);
  });
});

module.exports = router; 