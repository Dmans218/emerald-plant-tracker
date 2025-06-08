const express = require('express');
const router = express.Router();

// Get all tents
router.get('/', async (req, res) => {
  try {
    const { db } = req;
    const { status = 'active' } = req.query;
    
    const tents = await db.all(`
      SELECT t.*, COUNT(p.id) as plant_count
      FROM tents t
      LEFT JOIN plants p ON t.id = p.tent_id
      WHERE t.status = ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `, [status]);
    
    res.json(tents);
  } catch (error) {
    console.error('Error fetching tents:', error);
    res.status(500).json({ error: 'Failed to fetch tents' });
  }
});

// Get single tent
router.get('/:id', async (req, res) => {
  try {
    const { db } = req;
    const tentId = req.params.id;
    
    const tent = await db.get(`
      SELECT t.*, COUNT(p.id) as plant_count
      FROM tents t
      LEFT JOIN plants p ON t.id = p.tent_id
      WHERE t.id = ?
      GROUP BY t.id
    `, [tentId]);
    
    if (!tent) {
      return res.status(404).json({ error: 'Tent not found' });
    }
    
    res.json(tent);
  } catch (error) {
    console.error('Error fetching tent:', error);
    res.status(500).json({ error: 'Failed to fetch tent' });
  }
});

// Create new tent
router.post('/', async (req, res) => {
  try {
    const { db } = req;
    const { name, description, size, lighting, ventilation, notes } = req.body;
    
    if (!name || !size) {
      return res.status(400).json({ error: 'Name and size are required' });
    }
    
    const result = await db.run(`
      INSERT INTO tents (name, description, size, lighting, ventilation, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'active', datetime('now'))
    `, [name, description, size, lighting, ventilation, notes]);
    
    const newTent = await db.get('SELECT * FROM tents WHERE id = ?', [result.lastID]);
    res.status(201).json(newTent);
  } catch (error) {
    console.error('Error creating tent:', error);
    res.status(500).json({ error: 'Failed to create tent' });
  }
});

// Update tent
router.put('/:id', async (req, res) => {
  try {
    const { db } = req;
    const tentId = req.params.id;
    const { name, description, size, lighting, ventilation, notes, status } = req.body;
    
    // Check if tent exists
    const existingTent = await db.get('SELECT * FROM tents WHERE id = ?', [tentId]);
    if (!existingTent) {
      return res.status(404).json({ error: 'Tent not found' });
    }
    
    // Update tent
    await db.run(`
      UPDATE tents 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          size = COALESCE(?, size),
          lighting = COALESCE(?, lighting),
          ventilation = COALESCE(?, ventilation),
          notes = COALESCE(?, notes),
          status = COALESCE(?, status),
          updated_at = datetime('now')
      WHERE id = ?
    `, [name, description, size, lighting, ventilation, notes, status, tentId]);
    
    // If archiving, set archived_at timestamp
    if (status === 'archived') {
      await db.run(`
        UPDATE tents 
        SET archived_at = datetime('now')
        WHERE id = ?
      `, [tentId]);
    }
    
    const updatedTent = await db.get('SELECT * FROM tents WHERE id = ?', [tentId]);
    res.json(updatedTent);
  } catch (error) {
    console.error('Error updating tent:', error);
    res.status(500).json({ error: 'Failed to update tent' });
  }
});

// Delete tent
router.delete('/:id', async (req, res) => {
  try {
    const { db } = req;
    const tentId = req.params.id;
    
    // Check if tent exists
    const existingTent = await db.get('SELECT * FROM tents WHERE id = ?', [tentId]);
    if (!existingTent) {
      return res.status(404).json({ error: 'Tent not found' });
    }
    
    // Check if tent has plants
    const plantCount = await db.get('SELECT COUNT(*) as count FROM plants WHERE tent_id = ?', [tentId]);
    if (plantCount.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete tent with plants. Please move or delete plants first.' 
      });
    }
    
    await db.run('DELETE FROM tents WHERE id = ?', [tentId]);
    res.json({ message: 'Tent deleted successfully' });
  } catch (error) {
    console.error('Error deleting tent:', error);
    res.status(500).json({ error: 'Failed to delete tent' });
  }
});

module.exports = router;
