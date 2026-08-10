const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Joi = require('joi');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../database');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const UPLOADS_ROOT = path.resolve(UPLOADS_DIR);

/**
 * Resolve a multer-stored upload to a path under UPLOADS_DIR only.
 * Never trust user-controlled path segments — basename + pattern check only.
 */
function resolveSafeUploadPath(filename) {
  if (!filename || typeof filename !== 'string') return null;
  const base = path.basename(filename);
  // Matches generateSecureFilename output: plant-<uuid>.jpg|jpeg|png|gif
  if (!/^plant-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpe?g|png|gif)$/i.test(base)) {
    return null;
  }
  const resolved = path.resolve(UPLOADS_DIR, base);
  const rel = path.relative(UPLOADS_ROOT, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    return null;
  }
  return resolved;
}

const allowedMimeTypes = new Map([
  ['image/jpeg', [0xff, 0xd8, 0xff]],
  ['image/png', [0x89, 0x50, 0x4e, 0x47]],
  ['image/gif', [0x47, 0x49, 0x46]]
]);

const generateSecureFilename = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  const allowedExt = ['.jpg', '.jpeg', '.png', '.gif'];
  const safeExt = allowedExt.includes(ext) ? ext : '.jpg';
  const secureId = crypto.randomUUID();
  return `plant-${secureId}${safeExt}`;
};

const validateFileContent = (buffer, mimetype) => {
  const signature = allowedMimeTypes.get(mimetype);
  if (!signature) return false;
  return signature.every((byte, index) => buffer[index] === byte);
};

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, generateSecureFilename(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.has(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG, and GIF image files are allowed'));
  }
});

const logSchema = Joi.object({
  plant_id: Joi.number().integer().required(),
  type: Joi.string()
    .valid(
      'watering',
      'feeding',
      'environmental',
      'observation',
      'training',
      'transplant',
      'pest_disease',
      'deficiency',
      'measurement',
      'photo'
    )
    .required(),
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

// GET /api/logs
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
    params.push(parseInt(plant_id, 10));
  }

  if (type) {
    sql += ' AND l.type = ?';
    params.push(type);
  }

  sql += ' ORDER BY l.logged_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  database.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching logs:', err);
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }
    res.json(rows);
  });
});

// Stats BEFORE /:id so "stats" is not parsed as an id
router.get('/stats/:plant_id', (req, res) => {
  const plantId = parseInt(req.params.plant_id, 10);
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

// GET /api/logs/:id
router.get('/:id', (req, res) => {
  const database = db.getDb();
  const logId = parseInt(req.params.id, 10);

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

// POST /api/logs
router.post('/', (req, res) => {
  const { error, value } = logSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const database = db.getDb();
  const {
    plant_id,
    type,
    description,
    value: logValue,
    unit,
    notes,
    ph_level,
    ec_tds,
    temperature,
    humidity,
    light_intensity,
    co2_level,
    water_amount,
    nutrient_info,
    height_cm,
    logged_at
  } = value;

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

    database.run(
      sql,
      [
        plant_id,
        type,
        description,
        logValue,
        unit,
        notes,
        ph_level,
        ec_tds,
        temperature,
        humidity,
        light_intensity,
        co2_level,
        water_amount,
        nutrient_info,
        height_cm,
        logged_at || new Date().toISOString()
      ],
      function (err) {
        if (err) {
          console.error('Error creating log:', err);
          return res.status(500).json({ error: 'Failed to create log' });
        }

        const fetchSql = `
          SELECT l.*, p.name as plant_name
          FROM logs l
          LEFT JOIN plants p ON l.plant_id = p.id
          WHERE l.id = ?
        `;

        database.get(fetchSql, [this.lastID], (err, row) => {
          if (err) {
            return res.status(500).json({ error: 'Log created but failed to fetch' });
          }
          res.status(201).json(row);
        });
      }
    );
  });
});

// POST /api/logs/photo
router.post('/photo', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No photo uploaded' });
  }

  // Only open files under uploads/ using the server-generated basename
  const filePath = resolveSafeUploadPath(req.file.filename);
  if (!filePath) {
    return res.status(400).json({ error: 'Invalid file path' });
  }

  let buffer;
  try {
    buffer = fs.readFileSync(filePath);
  } catch {
    return res.status(500).json({ error: 'Failed to read uploaded file' });
  }

  if (!validateFileContent(buffer, req.file.mimetype)) {
    try {
      fs.unlinkSync(filePath);
    } catch {
      /* ignore */
    }
    return res.status(400).json({
      error: 'Invalid file content. File does not match expected image format.'
    });
  }

  const { plant_id, description } = req.body;
  if (!plant_id) {
    try {
      fs.unlinkSync(filePath);
    } catch {
      /* ignore */
    }
    return res.status(400).json({ error: 'Plant ID is required' });
  }

  const database = db.getDb();
  const photoUrl = `/uploads/${path.basename(filePath)}`;

  database.get('SELECT id FROM plants WHERE id = ?', [parseInt(plant_id, 10)], (err, plant) => {
    if (err) {
      console.error('Error checking plant:', err);
      return res.status(500).json({ error: 'Failed to verify plant' });
    }
    if (!plant) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        /* ignore */
      }
      return res.status(404).json({ error: 'Plant not found' });
    }

    const sql = `
      INSERT INTO logs (plant_id, type, description, photo_url, logged_at)
      VALUES (?, 'photo', ?, ?, ?)
    `;

    database.run(
      sql,
      [parseInt(plant_id, 10), description || 'Photo upload', photoUrl, new Date().toISOString()],
      function (err) {
        if (err) {
          console.error('Error creating photo log:', err);
          return res.status(500).json({ error: 'Failed to create photo log' });
        }

        const fetchSql = `
          SELECT l.*, p.name as plant_name
          FROM logs l
          LEFT JOIN plants p ON l.plant_id = p.id
          WHERE l.id = ?
        `;

        database.get(fetchSql, [this.lastID], (err, row) => {
          if (err) {
            return res.status(500).json({ error: 'Photo log created but failed to fetch' });
          }
          res.status(201).json(row);
        });
      }
    );
  });
});

// PUT /api/logs/:id
router.put('/:id', (req, res) => {
  const logId = parseInt(req.params.id, 10);
  if (isNaN(logId)) {
    return res.status(400).json({ error: 'Invalid log ID' });
  }

  const { error, value } = logSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const database = db.getDb();
  const {
    plant_id,
    type,
    description,
    value: logValue,
    unit,
    notes,
    ph_level,
    ec_tds,
    temperature,
    humidity,
    light_intensity,
    co2_level,
    water_amount,
    nutrient_info,
    height_cm,
    logged_at
  } = value;

  database.get('SELECT id FROM plants WHERE id = ?', [plant_id], (err, plant) => {
    if (err) {
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

    database.run(
      sql,
      [
        plant_id,
        type,
        description,
        logValue,
        unit,
        notes,
        ph_level,
        ec_tds,
        temperature,
        humidity,
        light_intensity,
        co2_level,
        water_amount,
        nutrient_info,
        height_cm,
        logged_at || new Date().toISOString(),
        logId
      ],
      function (err) {
        if (err) {
          console.error('Error updating log:', err);
          return res.status(500).json({ error: 'Failed to update log' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Log not found' });
        }

        const fetchSql = `
          SELECT l.*, p.name as plant_name
          FROM logs l
          LEFT JOIN plants p ON l.plant_id = p.id
          WHERE l.id = ?
        `;

        database.get(fetchSql, [logId], (err, row) => {
          if (err) {
            return res.status(500).json({ error: 'Log updated but failed to fetch' });
          }
          res.json(row);
        });
      }
    );
  });
});

// DELETE /api/logs/:id
router.delete('/:id', (req, res) => {
  const logId = parseInt(req.params.id, 10);
  if (isNaN(logId)) {
    return res.status(400).json({ error: 'Invalid log ID' });
  }

  const database = db.getDb();
  database.run('DELETE FROM logs WHERE id = ?', [logId], function (err) {
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

module.exports = router;
