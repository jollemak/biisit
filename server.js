const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup with auto-detection
const DB_DIR = '/data';
const DB_FILE = 'songs.db';
let dbPath;

if (fs.existsSync(DB_DIR)) {
  // Production: use /data directory
  dbPath = path.join(DB_DIR, DB_FILE);
} else {
  // Development: use current directory
  dbPath = path.join(__dirname, DB_FILE);
}

// Initialize database
const db = new Database(dbPath);

// Create songs table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    lyrics TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create setlists table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS setlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create setlist_songs junction table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS setlist_songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setlist_id INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (setlist_id) REFERENCES setlists(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
    UNIQUE(setlist_id, song_id)
  )
`);

// Prepare statements for better performance
const insertSong = db.prepare('INSERT INTO songs (title, lyrics) VALUES (?, ?)');
const selectAllSongs = db.prepare('SELECT * FROM songs ORDER BY created_at DESC');
const selectSongById = db.prepare('SELECT * FROM songs WHERE id = ?');
const updateSong = db.prepare('UPDATE songs SET title = ?, lyrics = ? WHERE id = ?');
const deleteSong = db.prepare('DELETE FROM songs WHERE id = ?');

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
const selectMaxPosition = db.prepare('SELECT MAX(position) as max_pos FROM setlist_songs WHERE setlist_id = ?');

// API Routes

// GET /api/songs - Fetch all songs
app.get('/api/songs', (req, res) => {
  try {
    const songs = selectAllSongs.all();
    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// POST /api/songs - Create new song
app.post('/api/songs', (req, res) => {
  try {
    const { title, lyrics } = req.body;

    if (!title || !lyrics) {
      return res.status(400).json({ error: 'Title and lyrics are required' });
    }

    const result = insertSong.run(title, lyrics);
    const newSong = selectSongById.get(result.lastInsertRowid);

    res.status(201).json(newSong);
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ error: 'Failed to create song' });
  }
});

// PUT /api/songs/:id - Update song
app.put('/api/songs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, lyrics } = req.body;

    if (!title || !lyrics) {
      return res.status(400).json({ error: 'Title and lyrics are required' });
    }

    const existingSong = selectSongById.get(id);
    if (!existingSong) {
      return res.status(404).json({ error: 'Song not found' });
    }

    updateSong.run(title, lyrics, id);
    const updatedSong = selectSongById.get(id);

    res.json(updatedSong);
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ error: 'Failed to update song' });
  }
});

// DELETE /api/songs/:id - Delete song
app.delete('/api/songs/:id', (req, res) => {
  try {
    const { id } = req.params;

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

// Setlist API Routes

// GET /api/setlists - Fetch all setlists
app.get('/api/setlists', (req, res) => {
  try {
    const setlists = selectAllSetlists.all();
    res.json(setlists);
  } catch (error) {
    console.error('Error fetching setlists:', error);
    res.status(500).json({ error: 'Failed to fetch setlists' });
  }
});

// POST /api/setlists - Create new setlist
app.post('/api/setlists', (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Setlist name is required' });
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
app.put('/api/setlists/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Setlist name is required' });
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
app.delete('/api/setlists/:id', (req, res) => {
  try {
    const { id } = req.params;

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

// Setlist Songs API Routes

// GET /api/setlists/:id/songs - Get all songs in a setlist
app.get('/api/setlists/:id/songs', (req, res) => {
  try {
    const { id } = req.params;

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
app.post('/api/setlists/:id/songs', (req, res) => {
  try {
    const { id: setlistId } = req.params;
    const { song_id: songId } = req.body;

    if (!songId) {
      return res.status(400).json({ error: 'Song ID is required' });
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
app.delete('/api/setlists/:setlistId/songs/:songId', (req, res) => {
  try {
    const { setlistId, songId } = req.params;

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
    const songInSetlist = setlistSongs.some(s => s.id === parseInt(songId));
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
app.put('/api/setlists/:id/reorder', (req, res) => {
  try {
    const { id: setlistId } = req.params;
    const { songs } = req.body;

    if (!songs || !Array.isArray(songs)) {
      return res.status(400).json({ error: 'Songs array is required' });
    }

    // Verify setlist exists
    const setlist = selectSetlistById.get(setlistId);
    if (!setlist) {
      return res.status(404).json({ error: 'Setlist not found' });
    }

    // Validate songs array format
    for (const song of songs) {
      if (!song.song_id || typeof song.position !== 'number') {
        return res.status(400).json({ error: 'Each song must have song_id and position' });
      }
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

// Serve static React files
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database path: ${dbPath}`);
});