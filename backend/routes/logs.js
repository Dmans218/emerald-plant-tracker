const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Joi = require('joi');
const db = require('../database');

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'plant-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Validation schemas
const logSchema = Joi.object({
  plant_id: Joi.number().integer().required(),
  type: Joi.string().valid('watering', 'feeding', 'pruning', 'training', 'observation', 'photo', 'harvest', 'environment').required(),
  description: Joi.string().max(1000).allow(null, ''),
  value: Joi.number().allow(null, ''),
  unit: Joi.string().max(20).allow(null, ''),
  growth_stage: Joi.string().valid('seedling', 'vegetative', 'flowering', 'harvest', 'cured').allow(null, ''),
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
  
  sql += ' ORDER BY l.logged_at ASC LIMIT ? OFFSET ?';
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
router.get('/:id', (req, res) => {
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
  const { plant_id, type, description, value: logValue, unit, growth_stage, logged_at } = value;
  
  // Verify plant exists and get current stage if growth_stage not provided
  database.get('SELECT id, stage FROM plants WHERE id = ?', [plant_id], (err, plant) => {
    if (err) {
      console.error('Error checking plant:', err);
      return res.status(500).json({ error: 'Failed to verify plant' });
    }
    
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    // Use provided growth_stage or default to plant's current stage
    const logGrowthStage = growth_stage || plant.stage;
    
    const sql = `
      INSERT INTO logs (plant_id, type, description, value, unit, growth_stage, logged_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    database.run(sql, [plant_id, type, description, logValue, unit, logGrowthStage, logged_at || new Date().toISOString()], function(err) {
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

// POST /api/logs/photo - Upload photo log
router.post('/photo', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No photo uploaded' });
  }

  const { plant_id, description } = req.body;
  
  if (!plant_id) {
    return res.status(400).json({ error: 'Plant ID is required' });
  }

  const database = db.getDb();
  const photoUrl = `/uploads/${req.file.filename}`;
  
  // Verify plant exists and get current stage
  database.get('SELECT id, stage FROM plants WHERE id = ?', [parseInt(plant_id)], (err, plant) => {
    if (err) {
      console.error('Error checking plant:', err);
      return res.status(500).json({ error: 'Failed to verify plant' });
    }
    
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    const sql = `
      INSERT INTO logs (plant_id, type, description, photo_url, growth_stage, logged_at)
      VALUES (?, 'photo', ?, ?, ?, ?)
    `;
    
    database.run(sql, [parseInt(plant_id), description || 'Photo upload', photoUrl, plant.stage, new Date().toISOString()], function(err) {
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

// DELETE /api/logs/:id - Delete log
router.delete('/:id', (req, res) => {
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