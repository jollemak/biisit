const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./config/database');
const songsRouter = require('./routes/songs');
const setlistsRouter = require('./routes/setlists');
const setlistSongsRouter = require('./routes/setlist-songs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
const db = initDatabase();

// Mount API routes
app.use('/api/songs', songsRouter(db));
app.use('/api/setlists', setlistsRouter(db));
app.use('/api/setlists', setlistSongsRouter(db));

// Serve static React files
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});