const express = require('express');
const { validateSetlistId, validateSongId, validateReorderInput } = require('../config/validation');

/**
 * Setlist-Songs API routes
 * Handles setlist-song relationship operations (add, remove, reorder)
 * @param {Database} db - Database instance
 * @returns {Router} Express router
 */
module.exports = (db) => {
  const router = express.Router();

  // Setlist songs prepared statements
  const insertSetlistSong = db.prepare(`
    INSERT INTO setlist_songs (setlist_id, song_id, position)
    VALUES (?, ?, COALESCE((SELECT MAX(position) + 1 FROM setlist_songs WHERE setlist_id = ?), 0))
  `);
  const selectSetlistSongs = db.prepare(`
    SELECT
      ss.position,
      s.id, s.title, s.lyrics, s.created_at,
      ss.added_at as added_to_setlist_at
    FROM setlist_songs ss
    JOIN songs s ON ss.song_id = s.id
    WHERE ss.setlist_id = ?
    ORDER BY ss.position ASC
  `);
  const deleteSetlistSong = db.prepare('DELETE FROM setlist_songs WHERE setlist_id = ? AND song_id = ?');
  const updateSetlistSongPositions = db.prepare('UPDATE setlist_songs SET position = ? WHERE setlist_id = ? AND song_id = ?');
  const selectSongById = db.prepare('SELECT * FROM songs WHERE id = ?');
  const selectSetlistById = db.prepare('SELECT * FROM setlists WHERE id = ?');

  // GET /api/setlists/:id/songs - Get all songs in a setlist
  router.get('/:id/songs', (req, res) => {
    try {
      const idValidation = validateSetlistId(req.params.id);
      if (!idValidation.isValid) {
        return res.status(400).json({ error: idValidation.error });
      }
      const id = idValidation.id;

      // Verify setlist exists
      const setlist = selectSetlistById.get(id);
      if (!setlist) {
        return res.status(404).json({ error: 'Setlist not found' });
      }

      const songs = selectSetlistSongs.all(id);
      res.json(songs);
    } catch (error) {
      console.error('Error fetching setlist songs:', error);
      res.status(500).json({ error: 'Failed to fetch setlist songs' });
    }
  });

  // POST /api/setlists/:id/songs - Add song to setlist
  router.post('/:id/songs', (req, res) => {
    try {
      const setlistIdValidation = validateSetlistId(req.params.id);
      if (!setlistIdValidation.isValid) {
        return res.status(400).json({ error: setlistIdValidation.error });
      }
      const setlistId = setlistIdValidation.id;

      const { song_id: songId } = req.body;
      const songIdValidation = validateSongId(songId);
      if (!songIdValidation.isValid) {
        return res.status(400).json({ error: songIdValidation.error });
      }

      // Verify setlist exists
      const setlist = selectSetlistById.get(setlistId);
      if (!setlist) {
        return res.status(404).json({ error: 'Setlist not found' });
      }

      // Verify song exists
      const song = selectSongById.get(songId);
      if (!song) {
        return res.status(404).json({ error: 'Song not found' });
      }

      // Check if song is already in setlist
      const existingSongs = selectSetlistSongs.all(setlistId);
      const alreadyInSetlist = existingSongs.some(s => s.id === songId);
      if (alreadyInSetlist) {
        return res.status(409).json({ error: 'Song already in setlist' });
      }

      // Add song to setlist
      insertSetlistSong.run(setlistId, songId, setlistId);

      // Return the added song with position
      const updatedSongs = selectSetlistSongs.all(setlistId);
      const addedSong = updatedSongs.find(s => s.id === songId);

      res.status(201).json(addedSong);
    } catch (error) {
      console.error('Error adding song to setlist:', error);
      res.status(500).json({ error: 'Failed to add song to setlist' });
    }
  });

  // DELETE /api/setlists/:setlistId/songs/:songId - Remove song from setlist
  router.delete('/:setlistId/songs/:songId', (req, res) => {
    try {
      const setlistIdValidation = validateSetlistId(req.params.setlistId);
      if (!setlistIdValidation.isValid) {
        return res.status(400).json({ error: setlistIdValidation.error });
      }
      const setlistId = setlistIdValidation.id;

      const songIdValidation = validateSongId(req.params.songId);
      if (!songIdValidation.isValid) {
        return res.status(400).json({ error: songIdValidation.error });
      }
      const songId = songIdValidation.id;

      // Verify setlist exists
      const setlist = selectSetlistById.get(setlistId);
      if (!setlist) {
        return res.status(404).json({ error: 'Setlist not found' });
      }

      // Verify song exists
      const song = selectSongById.get(songId);
      if (!song) {
        return res.status(404).json({ error: 'Song not found' });
      }

      // Check if song is in setlist
      const setlistSongs = selectSetlistSongs.all(setlistId);
      const songInSetlist = setlistSongs.some(s => s.id === songId);
      if (!songInSetlist) {
        return res.status(404).json({ error: 'Song not found in setlist' });
      }

      deleteSetlistSong.run(setlistId, songId);
      res.status(204).send();
    } catch (error) {
      console.error('Error removing song from setlist:', error);
      res.status(500).json({ error: 'Failed to remove song from setlist' });
    }
  });

  // PUT /api/setlists/:id/reorder - Reorder songs in setlist
  router.put('/:id/reorder', (req, res) => {
    try {
      const idValidation = validateSetlistId(req.params.id);
      if (!idValidation.isValid) {
        return res.status(400).json({ error: idValidation.error });
      }
      const setlistId = idValidation.id;

      const { songs } = req.body;
      const validation = validateReorderInput(songs);
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      // Verify setlist exists
      const setlist = selectSetlistById.get(setlistId);
      if (!setlist) {
        return res.status(404).json({ error: 'Setlist not found' });
      }

      // Use transaction for atomic updates
      const transaction = db.transaction(() => {
        for (const song of songs) {
          updateSetlistSongPositions.run(song.position, setlistId, song.song_id);
        }
      });

      transaction();

      // Return updated songs
      const updatedSongs = selectSetlistSongs.all(setlistId);
      res.json(updatedSongs);
    } catch (error) {
      console.error('Error reordering setlist songs:', error);
      res.status(500).json({ error: 'Failed to reorder songs' });
    }
  });

  return router;
};