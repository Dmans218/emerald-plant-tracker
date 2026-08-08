/**
 * Tent-focused API surface (first-class tent operations).
 * Plant archive export helpers remain under /api/plants for compatibility.
 */
const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/tents — list tents from plants + environment logs
router.get('/', (req, res) => {
  const database = db.getDb();
  const sql = `
    SELECT grow_tent as name,
           SUM(plant_count) as plant_count,
           SUM(reading_count) as reading_count,
           MAX(last_activity) as last_activity
    FROM (
      SELECT grow_tent,
             COUNT(*) as plant_count,
             0 as reading_count,
             MAX(updated_at) as last_activity
      FROM plants
      WHERE grow_tent IS NOT NULL AND grow_tent != '' AND (archived = 0 OR archived IS NULL)
      GROUP BY grow_tent
      UNION ALL
      SELECT grow_tent,
             0 as plant_count,
             COUNT(*) as reading_count,
             MAX(logged_at) as last_activity
      FROM environment_logs
      WHERE grow_tent IS NOT NULL AND grow_tent != ''
      GROUP BY grow_tent
    )
    GROUP BY grow_tent
    ORDER BY name
  `;

  database.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error listing tents:', err);
      return res.status(500).json({ error: 'Failed to list tents' });
    }
    res.json(rows);
  });
});

// GET /api/tents/:tentName/summary
router.get('/:tentName/summary', (req, res) => {
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
        return res.status(500).json({ error: 'Failed to fetch active plants' });
      }

      database.all(
        'SELECT * FROM archived_grows WHERE grow_tent = ? ORDER BY archived_at DESC',
        [tentName],
        (err, archivedGrows) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch archived grows' });
          }

          database.get(
            'SELECT COUNT(*) as count FROM environment_logs WHERE grow_tent = ?',
            [tentName],
            (err, envCount) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to count environment logs' });
              }

              res.json({
                tentName,
                activePlants: activePlants || [],
                archivedGrows: archivedGrows || [],
                environmentLogsCount: envCount.count,
                totalGrowCycles:
                  (archivedGrows || []).length + ((activePlants || []).length > 0 ? 1 : 0)
              });
            }
          );
        }
      );
    }
  );
});

// DELETE /api/tents/:tentName/environment
router.delete('/:tentName/environment', (req, res) => {
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
        return res.status(500).json({ error: 'Failed to check active plants' });
      }
      // Only block auto-clears when active plants exist unless client opts in with force
      if (result.count > 0 && !force) {
        return res.status(400).json({
          error:
            'This tent still has active plants. Re-confirm with force to clear climate readings only (plants stay).',
          active_plants: result.count
        });
      }

      database.run('DELETE FROM environment_logs WHERE grow_tent = ?', [tentName], function (deleteErr) {
        if (deleteErr) {
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

module.exports = router;
