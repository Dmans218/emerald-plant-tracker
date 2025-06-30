const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Joi = require('joi');
const fs = require('fs');
const crypto = require('crypto');
const { query } = require('../config/database');

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
router.get('/', async (req, res) => {
  try {
    const { plant_id, type, limit = 100, offset = 0 } = req.query;
    
    let sql = `
      SELECT l.*, p.name as plant_name 
      FROM logs l 
      LEFT JOIN plants p ON l.plant_id = p.id 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    if (plant_id) {
      sql += ` AND l.plant_id = $${paramIndex++}`;
      params.push(parseInt(plant_id));
    }
    
    if (type) {
      sql += ` AND l.type = $${paramIndex++}`;
      params.push(type);
    }
    
    sql += ` ORDER BY l.logged_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// GET /api/logs/:id - Get specific log
router.get('/:id', async (req, res) => {
  try {
    const logId = parseInt(req.params.id);
    
    if (isNaN(logId)) {
      return res.status(400).json({ error: 'Invalid log ID' });
    }

    const sql = `
      SELECT l.*, p.name as plant_name 
      FROM logs l 
      LEFT JOIN plants p ON l.plant_id = p.id 
      WHERE l.id = $1
    `;
    
    const result = await query(sql, [logId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching log:', err);
    res.status(500).json({ error: 'Failed to fetch log' });
  }
});

// POST /api/logs - Create new log
router.post('/', async (req, res) => {
  try {
    const { error, value } = logSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { 
      plant_id, type, description, value: logValue, unit, notes,
      ph_level, ec_tds, temperature, humidity, light_intensity, 
      co2_level, water_amount, nutrient_info, height_cm, logged_at 
    } = value;
    
    // Verify plant exists
    const plantCheck = await query('SELECT id FROM plants WHERE id = $1', [plant_id]);
    
    if (plantCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    const sql = `
      INSERT INTO logs (
        plant_id, type, description, value, unit, notes,
        ph_level, ec_tds, temperature, humidity, light_intensity,
        co2_level, water_amount, nutrient_info, height_cm, logged_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    
    const result = await query(sql, [
      plant_id, type, description, logValue, unit, notes,
      ph_level, ec_tds, temperature, humidity, light_intensity,
      co2_level, water_amount, nutrient_info, height_cm, 
      logged_at || new Date().toISOString()
    ]);
    
    // Fetch the created log with plant name
    const fetchSql = `
      SELECT l.*, p.name as plant_name 
      FROM logs l 
      LEFT JOIN plants p ON l.plant_id = p.id 
      WHERE l.id = $1
    `;
    
    const fetchResult = await query(fetchSql, [result.rows[0].id]);
    res.status(201).json(fetchResult.rows[0]);
  } catch (err) {
    console.error('Error creating log:', err);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// POST /api/logs/photo - Upload photo log with content validation
router.post('/photo', upload.single('photo'), async (req, res) => {
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

  try {
    const photoUrl = `/uploads/${req.file.filename}`;
    
    // Verify plant exists
    const plantCheck = await query('SELECT id FROM plants WHERE id = $1', [parseInt(plant_id)]);
    
    if (plantCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    const sql = `
      INSERT INTO logs (plant_id, type, description, photo_url, logged_at)
      VALUES ($1, 'photo', $2, $3, $4)
      RETURNING *
    `;
    
    const result = await query(sql, [parseInt(plant_id), description || 'Photo upload', photoUrl, new Date().toISOString()]);
    
    // Fetch the created log with plant name
    const fetchSql = `
      SELECT l.*, p.name as plant_name 
      FROM logs l 
      LEFT JOIN plants p ON l.plant_id = p.id 
      WHERE l.id = $1
    `;
    
    const fetchResult = await query(fetchSql, [result.rows[0].id]);
    res.status(201).json(fetchResult.rows[0]);
  } catch (err) {
    console.error('Error creating photo log:', err);
    res.status(500).json({ error: 'Failed to create photo log' });
  }
});

// PUT /api/logs/:id - Update log
router.put('/:id', async (req, res) => {
  try {
    const logId = parseInt(req.params.id);
    
    if (isNaN(logId)) {
      return res.status(400).json({ error: 'Invalid log ID' });
    }

    const { error, value } = logSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { 
      plant_id, type, description, value: logValue, unit, notes,
      ph_level, ec_tds, temperature, humidity, light_intensity, 
      co2_level, water_amount, nutrient_info, height_cm, logged_at 
    } = value;
    
    // Verify plant exists
    const plantCheck = await query('SELECT id FROM plants WHERE id = $1', [plant_id]);
    
    if (plantCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    const sql = `
      UPDATE logs SET 
        plant_id = $1, type = $2, description = $3, value = $4, unit = $5, notes = $6,
        ph_level = $7, ec_tds = $8, temperature = $9, humidity = $10, light_intensity = $11,
        co2_level = $12, water_amount = $13, nutrient_info = $14, height_cm = $15, logged_at = $16
      WHERE id = $17
      RETURNING *
    `;
    
    const result = await query(sql, [
      plant_id, type, description, logValue, unit, notes,
      ph_level, ec_tds, temperature, humidity, light_intensity,
      co2_level, water_amount, nutrient_info, height_cm, 
      logged_at || new Date().toISOString(), logId
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }
    
    // Fetch the updated log with plant name
    const fetchSql = `
      SELECT l.*, p.name as plant_name 
      FROM logs l 
      LEFT JOIN plants p ON l.plant_id = p.id 
      WHERE l.id = $1
    `;
    
    const fetchResult = await query(fetchSql, [logId]);
    res.json(fetchResult.rows[0]);
  } catch (err) {
    console.error('Error updating log:', err);
    res.status(500).json({ error: 'Failed to update log' });
  }
});

// DELETE /api/logs/:id - Delete log
router.delete('/:id', async (req, res) => {
  try {
    const logId = parseInt(req.params.id);
    
    if (isNaN(logId)) {
      return res.status(400).json({ error: 'Invalid log ID' });
    }

    const sql = 'DELETE FROM logs WHERE id = $1 RETURNING id';
    const result = await query(sql, [logId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }
    
    res.json({ message: 'Log deleted successfully' });
  } catch (err) {
    console.error('Error deleting log:', err);
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

// GET /api/logs/stats/:plant_id - Get statistics for a plant
router.get('/stats/:plant_id', async (req, res) => {
  try {
    const plantId = parseInt(req.params.plant_id);
    
    if (isNaN(plantId)) {
      return res.status(400).json({ error: 'Invalid plant ID' });
    }

    const sql = `
      SELECT 
        type,
        COUNT(*) as count,
        MAX(logged_at) as last_logged,
        AVG(value) as avg_value
      FROM logs 
      WHERE plant_id = $1 
      GROUP BY type
      ORDER BY count DESC
    `;
    
    const result = await query(sql, [plantId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching log stats:', err);
    res.status(500).json({ error: 'Failed to fetch log statistics' });
  }
});

module.exports = router; 