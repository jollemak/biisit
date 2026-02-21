const express = require('express');
const { validateSetlistInput, validateSetlistId } = require('../config/validation');

/**
 * Setlist API routes
 * Handles all setlist CRUD operations
 * @param {Database} db - Database instance
 * @returns {Router} Express router
 */
module.exports = (db) => {
  const router = express.Router();

  // Setlist prepared statements
  const insertSetlist = db.prepare('INSERT INTO setlists (name) VALUES (?)');
  const selectAllSetlists = db.prepare(`
    SELECT
      s.*,
      COUNT(ss.song_id) as song_count
    FROM setlists s
    LEFT JOIN setlist_songs ss ON s.id = ss.setlist_id
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `);
  const selectSetlistById = db.prepare('SELECT * FROM setlists WHERE id = ?');
  const updateSetlist = db.prepare('UPDATE setlists SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  const deleteSetlist = db.prepare('DELETE FROM setlists WHERE id = ?');

  // GET /api/setlists - Fetch all setlists
  router.get('/', (req, res) => {
    try {
      const setlists = selectAllSetlists.all();
      res.json(setlists);
    } catch (error) {
      console.error('Error fetching setlists:', error);
      res.status(500).json({ error: 'Failed to fetch setlists' });
    }
  });

  // POST /api/setlists - Create new setlist
  router.post('/', (req, res) => {
    try {
      const { name } = req.body;

      const validation = validateSetlistInput(name);
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      const result = insertSetlist.run(name.trim());
      const newSetlist = selectSetlistById.get(result.lastInsertRowid);

      res.status(201).json(newSetlist);
    } catch (error) {
      console.error('Error creating setlist:', error);
      res.status(500).json({ error: 'Failed to create setlist' });
    }
  });

  // PUT /api/setlists/:id - Update setlist
  router.put('/:id', (req, res) => {
    try {
      const idValidation = validateSetlistId(req.params.id);
      if (!idValidation.isValid) {
        return res.status(400).json({ error: idValidation.error });
      }
      const id = idValidation.id;

      const { name } = req.body;
      const validation = validateSetlistInput(name);
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      const existingSetlist = selectSetlistById.get(id);
      if (!existingSetlist) {
        return res.status(404).json({ error: 'Setlist not found' });
      }

      updateSetlist.run(name.trim(), id);
      const updatedSetlist = selectSetlistById.get(id);

      res.json(updatedSetlist);
    } catch (error) {
      console.error('Error updating setlist:', error);
      res.status(500).json({ error: 'Failed to update setlist' });
    }
  });

  // DELETE /api/setlists/:id - Delete setlist
  router.delete('/:id', (req, res) => {
    try {
      const idValidation = validateSetlistId(req.params.id);
      if (!idValidation.isValid) {
        return res.status(400).json({ error: idValidation.error });
      }
      const id = idValidation.id;

      const existingSetlist = selectSetlistById.get(id);
      if (!existingSetlist) {
        return res.status(404).json({ error: 'Setlist not found' });
      }

      deleteSetlist.run(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting setlist:', error);
      res.status(500).json({ error: 'Failed to delete setlist' });
    }
  });

  return router;
};