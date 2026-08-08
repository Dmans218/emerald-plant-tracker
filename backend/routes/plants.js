const express = require('express');
const router = express.Router();
const Joi = require('joi');
const db = require('../database');
const { csvRow } = require('../utils/csv');
const {
  withTransaction,
  addDaysToDateString,
  toDateOnlyString,
  normalizePlantDates
} = require('../utils/dbHelpers');

const PLANT_DATE_FIELDS = ['planted_date', 'expected_harvest', 'harvest_date'];

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

// Soft-archive fields removed from update API — use POST /:id/archive
const updatePlantSchema = Joi.object({
  name: Joi.string().max(100).allow(null, ''),
  strain: Joi.string().max(100).allow(null, ''),
  stage: Joi.string().valid('seedling', 'vegetative', 'flowering', 'harvest', 'drying', 'curing', 'cured'),
  planted_date: Joi.date().iso().allow(null, ''),
  expected_harvest: Joi.date().iso().allow(null, ''),
  harvest_date: Joi.date().iso().allow(null, ''),
  final_yield: Joi.number().min(0).allow(null, ''),
  notes: Joi.string().max(1000).allow(null, ''),
  grow_tent: Joi.string().max(100).allow(null, '')
});

// GET /api/plants/grow-tents
router.get('/grow-tents', (req, res) => {
  const database = db.getDb();
  const sql = `
    SELECT DISTINCT grow_tent, COUNT(*) as plant_count
    FROM plants
    WHERE grow_tent IS NOT NULL AND grow_tent != '' AND (archived = 0 OR archived IS NULL)
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

// GET /api/plants
router.get('/', (req, res) => {
  const database = db.getDb();
  const { grow_tent } = req.query;

  // Archive model: active plants live in plants; history in archived_grows
  let whereClause = '(p.archived = 0 OR p.archived IS NULL)';
  const params = [];
  let growTentCondition = '';

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
    res.json(rows.map((row) => normalizePlantDates(row, PLANT_DATE_FIELDS)));
  });
});

// --- Archived grows (must be before /:id) ---

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
    res.json(rows.map((row) => normalizePlantDates(row, PLANT_DATE_FIELDS)));
  });
});

router.get('/archived/tent/:tentName/export', (req, res) => {
  const tentName = req.params.tentName;
  if (!tentName) {
    return res.status(400).json({ error: 'Tent name is required' });
  }

  const database = db.getDb();

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

      const growIds = grows.map((g) => g.id);

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

              let csvContent = `Tent Archive Data Export - ${tentName}\n`;
              csvContent += `Export Date,${new Date().toISOString()}\n`;
              csvContent += `Total Grow Cycles,${grows.length}\n\n`;

              const growCycles = {};
              grows.forEach((grow) => {
                const cycleKey = grow.grow_cycle_id || `cycle_${grow.id}`;
                if (!growCycles[cycleKey]) growCycles[cycleKey] = [];
                growCycles[cycleKey].push(grow);
              });

              Object.keys(growCycles).forEach((cycleKey, index) => {
                const cycleGrows = growCycles[cycleKey];
                const cycleIds = cycleGrows.map((g) => g.id);

                csvContent += `=== GROW CYCLE ${index + 1}: ${cycleKey} ===\n\n`;
                csvContent += 'Plants in this Cycle\n';
                csvContent += 'Plant Name,Strain,Planted Date,Harvest Date,Final Yield,Final Stage,Archive Reason,Total Logs,Archived At\n';
                cycleGrows.forEach((grow) => {
                  csvContent +=
                    csvRow([
                      grow.plant_name,
                      grow.strain,
                      grow.planted_date,
                      grow.harvest_date,
                      grow.final_yield,
                      grow.final_stage,
                      grow.archive_reason,
                      grow.total_logs,
                      grow.archived_at
                    ]) + '\n';
                });
                csvContent += '\n';

                const cycleEnvironmentData = environmentData.filter((env) =>
                  cycleIds.includes(env.archived_grow_id)
                );

                if (cycleEnvironmentData.length > 0) {
                  csvContent += 'Environment Data for this Cycle\n';
                  csvContent += 'Date,Temperature,Humidity,pH Level,Light Hours,VPD,CO2 PPM,PPFD\n';
                  cycleEnvironmentData.forEach((env) => {
                    csvContent +=
                      csvRow([
                        env.logged_at,
                        env.temperature,
                        env.humidity,
                        env.ph_level,
                        env.light_hours,
                        env.vpd,
                        env.co2_ppm,
                        env.ppfd
                      ]) + '\n';
                  });
                  csvContent += '\n';
                }

                const cyclePlantLogs = plantLogs.filter((log) =>
                  cycleIds.includes(log.archived_grow_id)
                );

                if (cyclePlantLogs.length > 0) {
                  csvContent += 'Plant Activity Logs for this Cycle\n';
                  csvContent += 'Plant Name,Date,Activity Type,Description,Value,Notes\n';
                  cyclePlantLogs.forEach((log) => {
                    csvContent +=
                      csvRow([
                        log.plant_name,
                        log.logged_at,
                        log.type,
                        log.description,
                        log.value,
                        log.notes
                      ]) + '\n';
                  });
                  csvContent += '\n';
                }

                csvContent += '\n';
              });

              res.setHeader('Content-Type', 'text/csv; charset=utf-8');
              res.setHeader(
                'Content-Disposition',
                `attachment; filename="${encodeURIComponent(tentName)}_complete_grow_data.csv"`
              );
              res.send(csvContent);
            }
          );
        }
      );
    }
  );
});

// Export single archived grow (before /archived/:id detail if ambiguous — more specific path first)
router.get('/archived/:id/export', (req, res) => {
  const archivedGrowId = parseInt(req.params.id, 10);
  if (isNaN(archivedGrowId)) {
    return res.status(400).json({ error: 'Invalid archived grow ID' });
  }

  const database = db.getDb();

  database.get('SELECT * FROM archived_grows WHERE id = ?', [archivedGrowId], (err, grow) => {
    if (err) {
      console.error('Error fetching archived grow:', err);
      return res.status(500).json({ error: 'Failed to fetch archived grow' });
    }
    if (!grow) {
      return res.status(404).json({ error: 'Archived grow not found' });
    }

    database.all(
      'SELECT * FROM archived_environment_data WHERE archived_grow_id = ? ORDER BY logged_at ASC',
      [archivedGrowId],
      (err, environmentData) => {
        if (err) {
          console.error('Error fetching archived environment data:', err);
          return res.status(500).json({ error: 'Failed to fetch environment data' });
        }

        database.all(
          'SELECT * FROM archived_logs WHERE archived_grow_id = ? ORDER BY logged_at ASC',
          [archivedGrowId],
          (err, plantLogs) => {
            if (err) {
              console.error('Error fetching archived logs:', err);
              return res.status(500).json({ error: 'Failed to fetch plant logs' });
            }

            let csvContent = 'Plant Information\n';
            csvContent += csvRow(['Plant Name', grow.plant_name]) + '\n';
            csvContent += csvRow(['Strain', grow.strain || 'N/A']) + '\n';
            csvContent += csvRow(['Grow Tent', grow.grow_tent || 'N/A']) + '\n';
            csvContent += csvRow(['Planted Date', grow.planted_date || 'N/A']) + '\n';
            csvContent += csvRow(['Harvest Date', grow.harvest_date || 'N/A']) + '\n';
            csvContent += csvRow(['Final Yield', grow.final_yield || 'N/A']) + '\n';
            csvContent += csvRow(['Final Stage', grow.final_stage || 'N/A']) + '\n';
            csvContent += csvRow(['Archive Reason', grow.archive_reason || 'N/A']) + '\n';
            csvContent += csvRow(['Total Logs', grow.total_logs]) + '\n';
            csvContent += csvRow(['Archived At', grow.archived_at]) + '\n\n';

            if (environmentData && environmentData.length > 0) {
              csvContent += 'Environment Data\n';
              csvContent += 'Date,Temperature,Humidity,pH Level,Light Hours,VPD,CO2 PPM,PPFD\n';
              environmentData.forEach((env) => {
                csvContent +=
                  csvRow([
                    env.logged_at,
                    env.temperature,
                    env.humidity,
                    env.ph_level,
                    env.light_hours,
                    env.vpd,
                    env.co2_ppm,
                    env.ppfd
                  ]) + '\n';
              });
              csvContent += '\n';
            }

            if (plantLogs && plantLogs.length > 0) {
              csvContent += 'Plant Activity Logs\n';
              csvContent += 'Date,Activity Type,Description,Value,Notes\n';
              plantLogs.forEach((log) => {
                csvContent +=
                  csvRow([log.logged_at, log.type, log.description, log.value, log.notes]) + '\n';
              });
            }

            const filename = `${(grow.plant_name || 'grow').replace(/[^a-zA-Z0-9_-]/g, '_')}_grow_data.csv`;
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(csvContent);
          }
        );
      }
    );
  });
});

router.get('/archived/:id', (req, res) => {
  const archivedGrowId = parseInt(req.params.id, 10);
  if (isNaN(archivedGrowId)) {
    return res.status(400).json({ error: 'Invalid archived grow ID' });
  }

  const database = db.getDb();

  database.get('SELECT * FROM archived_grows WHERE id = ?', [archivedGrowId], (err, grow) => {
    if (err) {
      console.error('Error fetching archived grow:', err);
      return res.status(500).json({ error: 'Failed to fetch archived grow' });
    }
    if (!grow) {
      return res.status(404).json({ error: 'Archived grow not found' });
    }

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

// Tent management (before /:id)
router.delete('/tent/:tentName/environment', (req, res) => {
  const tentName = req.params.tentName;
  const { confirm, force } = req.body || {};

  if (!tentName) {
    return res.status(400).json({ error: 'Tent name is required' });
  }
  if (!confirm) {
    return res.status(400).json({ error: 'Confirmation required to clear environment data' });
  }

  const database = db.getDb();

  database.get(
    'SELECT COUNT(*) as count FROM plants WHERE grow_tent = ? AND (archived = 0 OR archived IS NULL)',
    [tentName],
    (err, result) => {
      if (err) {
        console.error('Error checking active plants:', err);
        return res.status(500).json({ error: 'Failed to check active plants' });
      }
      if (result.count > 0 && !force) {
        return res.status(400).json({
          error:
            'This tent still has active plants. Re-confirm with force to clear climate readings only (plants stay).',
          active_plants: result.count
        });
      }

      database.run('DELETE FROM environment_logs WHERE grow_tent = ?', [tentName], function (deleteErr) {
        if (deleteErr) {
          console.error('Error clearing environment data:', deleteErr);
          return res.status(500).json({ error: 'Failed to clear environment data' });
        }
        res.json({
          message: `Environment data cleared for tent ${tentName}`,
          deletedRows: this.changes,
          active_plants_remaining: result.count
        });
      });
    }
  );
});

router.get('/tent/:tentName/summary', (req, res) => {
  const tentName = req.params.tentName;
  if (!tentName) {
    return res.status(400).json({ error: 'Tent name is required' });
  }

  const database = db.getDb();

  database.all(
    'SELECT * FROM plants WHERE grow_tent = ? AND (archived = 0 OR archived IS NULL)',
    [tentName],
    (err, activePlants) => {
      if (err) {
        console.error('Error fetching active plants:', err);
        return res.status(500).json({ error: 'Failed to fetch active plants' });
      }

      database.all(
        'SELECT * FROM archived_grows WHERE grow_tent = ? ORDER BY archived_at DESC',
        [tentName],
        (err, archivedGrows) => {
          if (err) {
            console.error('Error fetching archived grows:', err);
            return res.status(500).json({ error: 'Failed to fetch archived grows' });
          }

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

// GET /api/plants/:id
router.get('/:id', (req, res) => {
  const database = db.getDb();
  const plantId = parseInt(req.params.id, 10);

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
    res.json(normalizePlantDates(row, PLANT_DATE_FIELDS));
  });
});

// POST /api/plants
router.post('/', (req, res) => {
  const { error, value } = plantSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const database = db.getDb();
  if (!database) {
    return res.status(500).json({ error: 'Database not available' });
  }

  const { name, strain, stage, notes, grow_tent } = value;
  const planted_date = toDateOnlyString(value.planted_date);
  const expected_harvest = toDateOnlyString(value.expected_harvest);
  const sql = `
    INSERT INTO plants (name, strain, stage, planted_date, expected_harvest, notes, grow_tent, archived)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  `;

  database.run(
    sql,
    [name, strain, stage, planted_date, expected_harvest, notes, grow_tent],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.message?.includes('UNIQUE')) {
          return res.status(409).json({ error: 'Plant name already exists' });
        }
        console.error('Error creating plant:', err);
        return res.status(500).json({ error: 'Failed to create plant' });
      }

      database.get('SELECT * FROM plants WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Plant created but failed to fetch' });
        }
        res.status(201).json(normalizePlantDates(row, PLANT_DATE_FIELDS));
      });
    }
  );
});

// PUT /api/plants/:id — no soft-archive fields
router.put('/:id', (req, res) => {
  const plantId = parseInt(req.params.id, 10);
  if (isNaN(plantId)) {
    return res.status(400).json({ error: 'Invalid plant ID' });
  }

  const { error, value } = updatePlantSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  if (req.body.archived !== undefined) {
    return res.status(400).json({
      error: 'Use POST /api/plants/:id/archive to archive plants (moves data to archived_grows)'
    });
  }

  const database = db.getDb();
  const updates = [];
  const values = [];
  const allowedFields = [
    'name',
    'strain',
    'planted_date',
    'expected_harvest',
    'stage',
    'grow_tent',
    'notes',
    'harvest_date',
    'final_yield'
  ];

  Object.keys(value).forEach((key) => {
    if (value[key] !== undefined && allowedFields.includes(key)) {
      updates.push(`${key} = ?`);
      let next = value[key] === '' ? null : value[key];
      if (PLANT_DATE_FIELDS.includes(key)) {
        next = toDateOnlyString(next);
      }
      values.push(next);
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(plantId);

  const sql = `UPDATE plants SET ${updates.join(', ')} WHERE id = ?`;

  database.run(sql, values, function (err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.message?.includes('UNIQUE')) {
        return res.status(409).json({ error: 'Plant name already exists' });
      }
      console.error('Error updating plant:', err);
      return res.status(500).json({ error: 'Failed to update plant' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    database.get('SELECT * FROM plants WHERE id = ?', [plantId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Plant updated but failed to fetch' });
      }
      res.json(normalizePlantDates(row, PLANT_DATE_FIELDS));
    });
  });
});

// DELETE /api/plants/:id
router.delete('/:id', (req, res) => {
  const plantId = parseInt(req.params.id, 10);
  if (isNaN(plantId)) {
    return res.status(400).json({ error: 'Invalid plant ID' });
  }

  const database = db.getDb();
  database.run('DELETE FROM plants WHERE id = ?', [plantId], function (err) {
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

// POST /api/plants/:id/archive — copy to archived_grows, remove from plants
router.post('/:id/archive', async (req, res) => {
  const plantId = parseInt(req.params.id, 10);
  const { reason, archive_reason, final_yield, harvest_date } = req.body || {};
  const archiveReason = reason || archive_reason;

  if (isNaN(plantId)) {
    return res.status(400).json({ error: 'Invalid plant ID' });
  }

  const database = db.getDb();

  try {
    const archivedGrowId = await withTransaction(database, async ({ run, get, all }) => {
      const plant = await get(
        'SELECT * FROM plants WHERE id = ? AND (archived = 0 OR archived IS NULL)',
        [plantId]
      );
      if (!plant) {
        throw Object.assign(new Error('Plant not found or already archived'), { status: 404 });
      }

      const logCountRow = await get('SELECT COUNT(*) as count FROM logs WHERE plant_id = ?', [
        plantId
      ]);
      const logCount = logCountRow.count;

      const growCycleId = `${plant.grow_tent || 'unknown'}_${plant.planted_date || 'unknown'}_${plant.name}`.replace(
        /[^a-zA-Z0-9_]/g,
        '_'
      );

      const insertResult = await run(
        `INSERT INTO archived_grows (
          plant_id, plant_name, strain, grow_tent, grow_cycle_id, planted_date,
          harvest_date, final_yield, archive_reason, total_logs, final_stage, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          plant.id,
          plant.name,
          plant.strain,
          plant.grow_tent,
          growCycleId,
          plant.planted_date,
          harvest_date || null,
          final_yield ?? null,
          archiveReason || null,
          logCount,
          plant.stage,
          plant.notes
        ]
      );
      const newArchivedId = insertResult.lastID;

      if (plant.grow_tent && plant.planted_date) {
        const endDate = harvest_date || new Date().toISOString();
        const environmentLogs = await all(
          `SELECT * FROM environment_logs
           WHERE grow_tent = ? AND logged_at >= ? AND logged_at <= ?
           ORDER BY logged_at DESC`,
          [plant.grow_tent, plant.planted_date, endDate]
        );

        for (const envLog of environmentLogs) {
          await run(
            `INSERT INTO archived_environment_data (
              archived_grow_id, original_log_id, temperature, humidity,
              ph_level, light_hours, vpd, co2_ppm, ppfd, grow_tent, logged_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              newArchivedId,
              envLog.id,
              envLog.temperature,
              envLog.humidity,
              envLog.ph_level,
              envLog.light_hours,
              envLog.vpd,
              envLog.co2_ppm,
              envLog.ppfd,
              envLog.grow_tent,
              envLog.logged_at
            ]
          );
        }
      }

      const plantLogs = await all(
        'SELECT * FROM logs WHERE plant_id = ? ORDER BY logged_at ASC',
        [plantId]
      );

      for (const log of plantLogs) {
        await run(
          `INSERT INTO archived_logs (
            archived_grow_id, original_log_id, plant_id, type,
            description, value, notes, logged_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newArchivedId,
            log.id,
            log.plant_id,
            log.type,
            log.description,
            log.value,
            log.notes,
            log.logged_at
          ]
        );
      }

      await run('DELETE FROM logs WHERE plant_id = ?', [plantId]);
      await run('DELETE FROM plants WHERE id = ?', [plantId]);

      return newArchivedId;
    });

    res.json({
      message: 'Plant archived successfully',
      archivedGrowId,
      environmentLogsArchived: true
    });
  } catch (error) {
    console.error('Error archiving plant:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Failed to archive plant' });
  }
});

// POST /api/plants/archived/:id/unarchive
router.post('/archived/:id/unarchive', async (req, res) => {
  const archivedGrowId = parseInt(req.params.id, 10);
  if (isNaN(archivedGrowId)) {
    return res.status(400).json({ error: 'Invalid archived grow ID' });
  }

  const database = db.getDb();

  try {
    const result = await withTransaction(database, async ({ run, get }) => {
      const archivedGrow = await get('SELECT * FROM archived_grows WHERE id = ?', [archivedGrowId]);
      if (!archivedGrow) {
        throw Object.assign(new Error('Archived grow not found'), { status: 404 });
      }

      const expectedHarvest = addDaysToDateString(archivedGrow.planted_date, 120);

      const insertPlant = await run(
        `INSERT INTO plants (
          name, strain, stage, planted_date, expected_harvest, notes,
          grow_tent, archived, harvest_date, final_yield
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, NULL)`,
        [
          archivedGrow.plant_name,
          archivedGrow.strain,
          archivedGrow.final_stage || 'vegetative',
          archivedGrow.planted_date,
          expectedHarvest,
          archivedGrow.notes,
          archivedGrow.grow_tent
        ]
      );
      const newPlantId = insertPlant.lastID;

      await run(
        `INSERT INTO logs (plant_id, type, description, value, notes, logged_at)
         SELECT ?, type, description, value, notes, logged_at
         FROM archived_logs
         WHERE archived_grow_id = ?`,
        [newPlantId, archivedGrowId]
      );

      await run('DELETE FROM archived_environment_data WHERE archived_grow_id = ?', [
        archivedGrowId
      ]);
      await run('DELETE FROM archived_logs WHERE archived_grow_id = ?', [archivedGrowId]);
      await run('DELETE FROM archived_grows WHERE id = ?', [archivedGrowId]);

      return { newPlantId, plantName: archivedGrow.plant_name };
    });

    res.json({
      message: 'Plant unarchived successfully',
      newPlantId: result.newPlantId,
      plantName: result.plantName
    });
  } catch (error) {
    console.error('Error unarchiving plant:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Failed to unarchive plant' });
  }
});

module.exports = router;
