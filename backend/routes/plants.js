const express = require('express');
const router = express.Router();
const Joi = require('joi');
const db = require('../database');

// Validation schemas
const plantSchema = Joi.object({
  name: Joi.string().required().max(100),
  strain: Joi.string().max(100).allow(null, ''),
  stage: Joi.string().valid('seedling', 'vegetative', 'flowering', 'harvest', 'cured').default('seedling'),
  planted_date: Joi.date().iso().allow(null, ''),
  expected_harvest: Joi.date().iso().allow(null, ''),
  notes: Joi.string().max(1000).allow(null, ''),
  grow_tent: Joi.string().max(100).allow(null, '')
});

const updatePlantSchema = Joi.object({
  name: Joi.string().max(100).allow(null, ''),
  strain: Joi.string().max(100).allow(null, ''),
  stage: Joi.string().valid('seedling', 'vegetative', 'flowering', 'harvest', 'cured'),
  planted_date: Joi.date().iso().allow(null, ''),
  expected_harvest: Joi.date().iso().allow(null, ''),
  notes: Joi.string().max(1000).allow(null, ''),
  archived: Joi.boolean(),
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
  
  if (grow_tent) {
    whereClause += ` AND p.grow_tent = '${grow_tent}'`;
  }
  
  const sql = `
    SELECT p.*, 
           COUNT(l.id) as log_count,
           MAX(l.logged_at) as last_log_date
    FROM plants p 
    LEFT JOIN logs l ON p.id = l.plant_id 
    WHERE ${whereClause}
    GROUP BY p.id 
    ORDER BY p.created_at DESC
  `;
  
  database.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching plants:', err);
      return res.status(500).json({ error: 'Failed to fetch plants' });
    }
    res.json(rows);
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
    return res.status(400).json({ error: error.details[0].message });
  }

  const database = db.getDb();
  const { name, strain, stage, planted_date, expected_harvest, notes, grow_tent } = value;
  
  const sql = `
    INSERT INTO plants (name, strain, stage, planted_date, expected_harvest, notes, grow_tent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  database.run(sql, [name, strain, stage, planted_date, expected_harvest, notes, grow_tent], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'Plant name already exists' });
      }
      console.error('Error creating plant:', err);
      return res.status(500).json({ error: 'Failed to create plant' });
    }
    
    // Fetch the created plant
    database.get('SELECT * FROM plants WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        console.error('Error fetching created plant:', err);
        return res.status(500).json({ error: 'Plant created but failed to fetch' });
      }
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
  
  Object.keys(value).forEach(key => {
    if (value[key] !== undefined) {
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

module.exports = router; 