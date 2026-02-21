const express = require('express');
const { validateSongInput, validateSongId } = require('../config/validation');

/**
 * Song API routes
 * Handles all song CRUD operations
 * @param {Database} db - Database instance
 * @returns {Router} Express router
 */
module.exports = (db) => {
  const router = express.Router();

  // Prepare statements for better performance
  const insertSong = db.prepare('INSERT INTO songs (title, lyrics) VALUES (?, ?)');
  const selectAllSongs = db.prepare('SELECT * FROM songs ORDER BY created_at DESC');
  const selectSongById = db.prepare('SELECT * FROM songs WHERE id = ?');
  const updateSong = db.prepare('UPDATE songs SET title = ?, lyrics = ? WHERE id = ?');
  const deleteSong = db.prepare('DELETE FROM songs WHERE id = ?');

  // GET /api/songs - Fetch all songs
  router.get('/', (req, res) => {
    try {
      const songs = selectAllSongs.all();
      res.json(songs);
    } catch (error) {
      console.error('Error fetching songs:', error);
      res.status(500).json({ error: 'Failed to fetch songs' });
    }
  });

  // POST /api/songs - Create new song
  router.post('/', (req, res) => {
    try {
      const { title, lyrics } = req.body;

      const validation = validateSongInput(title, lyrics);
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      const result = insertSong.run(title.trim(), lyrics.trim());
      const newSong = selectSongById.get(result.lastInsertRowid);

      res.status(201).json(newSong);
    } catch (error) {
      console.error('Error creating song:', error);
      res.status(500).json({ error: 'Failed to create song' });
    }
  });

  // PUT /api/songs/:id - Update song
  router.put('/:id', (req, res) => {
    try {
      const idValidation = validateSongId(req.params.id);
      if (!idValidation.isValid) {
        return res.status(400).json({ error: idValidation.error });
      }
      const id = idValidation.id;

      const { title, lyrics } = req.body;
      const validation = validateSongInput(title, lyrics);
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      const existingSong = selectSongById.get(id);
      if (!existingSong) {
        return res.status(404).json({ error: 'Song not found' });
      }

      updateSong.run(title.trim(), lyrics.trim(), id);
      const updatedSong = selectSongById.get(id);

      res.json(updatedSong);
    } catch (error) {
      console.error('Error updating song:', error);
      res.status(500).json({ error: 'Failed to update song' });
    }
  });

  // DELETE /api/songs/:id - Delete song
  router.delete('/:id', (req, res) => {
    try {
      const idValidation = validateSongId(req.params.id);
      if (!idValidation.isValid) {
        return res.status(400).json({ error: idValidation.error });
      }
      const id = idValidation.id;

      const existingSong = selectSongById.get(id);
      if (!existingSong) {
        return res.status(404).json({ error: 'Song not found' });
      }

      deleteSong.run(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting song:', error);
      res.status(500).json({ error: 'Failed to delete song' });
    }
  });

  return router;
};