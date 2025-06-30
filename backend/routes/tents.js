const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/tents - Get all tent names from plants and environment data
router.get('/', async (req, res) => {
  try {
    // Get unique tent names from both plants and environment logs
    const sql = `
      SELECT tent_name, 
             plant_count, 
             environment_count,
             last_environment_reading,
             active_plants
      FROM (
        SELECT 
          COALESCE(p.grow_tent, e.grow_tent) as tent_name,
          COUNT(DISTINCT p.id) as plant_count,
          COUNT(DISTINCT e.id) as environment_count,
          MAX(e.logged_at) as last_environment_reading,
          COUNT(DISTINCT CASE WHEN p.archived_at IS NULL THEN p.id END) as active_plants
        FROM plants p 
        FULL OUTER JOIN environment_logs e ON p.grow_tent = e.grow_tent
        WHERE COALESCE(p.grow_tent, e.grow_tent) IS NOT NULL 
        AND COALESCE(p.grow_tent, e.grow_tent) != ''
        GROUP BY COALESCE(p.grow_tent, e.grow_tent)
      ) tent_summary
      ORDER BY tent_name
    `;
    
    const result = await query(sql, []);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tents:', err);
    res.status(500).json({ error: 'Failed to fetch tents' });
  }
});

// GET /api/tents/names - Get simple list of tent names for dropdowns
router.get('/names', async (req, res) => {
  try {
    const sql = `
      SELECT DISTINCT tent_name
      FROM (
        SELECT grow_tent as tent_name FROM plants WHERE grow_tent IS NOT NULL AND grow_tent != ''
        UNION
        SELECT grow_tent as tent_name FROM environment_logs WHERE grow_tent IS NOT NULL AND grow_tent != ''
      ) all_tents
      ORDER BY tent_name
    `;
    
    const result = await query(sql, []);
    const tentNames = result.rows.map(row => row.tent_name);
    res.json(tentNames);
  } catch (err) {
    console.error('Error fetching tent names:', err);
    res.status(500).json({ error: 'Failed to fetch tent names' });
  }
});

// POST /api/tents/validate - Validate tent name and suggest existing ones
router.post('/validate', async (req, res) => {
  try {
    const { tent_name } = req.body;
    
    if (!tent_name || tent_name.trim() === '') {
      return res.status(400).json({ error: 'Tent name is required' });
    }
    
    // Check if tent already exists
    const existingCheck = await query(`
      SELECT 'plants' as source, COUNT(*) as count FROM plants WHERE grow_tent = $1
      UNION ALL
      SELECT 'environment' as source, COUNT(*) as count FROM environment_logs WHERE grow_tent = $1
    `, [tent_name]);
    
    const exists = existingCheck.rows.some(row => parseInt(row.count) > 0);
    
    // Get similar tent names (fuzzy matching)
    const similarTents = await query(`
      SELECT DISTINCT tent_name, 
             SIMILARITY(tent_name, $1) as similarity
      FROM (
        SELECT grow_tent as tent_name FROM plants WHERE grow_tent IS NOT NULL AND grow_tent != ''
        UNION
        SELECT grow_tent as tent_name FROM environment_logs WHERE grow_tent IS NOT NULL AND grow_tent != ''
      ) all_tents
      WHERE SIMILARITY(tent_name, $1) > 0.3
      ORDER BY similarity DESC
      LIMIT 5
    `, [tent_name]);
    
    res.json({
      tent_name: tent_name,
      exists: exists,
      suggestions: similarTents.rows.map(row => row.tent_name),
      validation: {
        is_valid: tent_name.length >= 1 && tent_name.length <= 50,
        message: exists ? 'Tent exists' : 'New tent will be created'
      }
    });
  } catch (err) {
    console.error('Error validating tent name:', err);
    res.status(500).json({ error: 'Failed to validate tent name' });
  }
});

module.exports = router;
