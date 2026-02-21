# AGENTS.md - Song Lyrics App Development Guide

This file contains operational guidelines for agentic coding agents working on the Song Lyrics app. Follow these conventions and commands to maintain consistency across the codebase.

## Project Overview

**Song Lyrics App** is a monolith web application with:
- **Backend**: Node.js + Express.js serving REST API
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **Deployment**: Fly.io with persistent volumes

## Build, Lint, and Test Commands

### Development Commands
```bash
# Start backend server (serves API + static React files)
npm start

# Start frontend dev server (hot reload, API proxy to localhost:3000)
cd client && npm run dev

# Build React app for production
npm run build:client

# Lint frontend code
cd client && npm run lint
```

### Testing
**Note**: No test framework is currently configured. To add tests:

1. **Install Vitest** (recommended for Vite projects):
   ```bash
   cd client
   npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
   ```

2. **Add test scripts to client/package.json**:
   ```json
   "scripts": {
     "test": "vitest",
     "test:run": "vitest run",
     "test:coverage": "vitest run --coverage"
   }
   ```

3. **Run a single test** (once configured):
   ```bash
   # Run all tests
   npm test

   # Run specific test file
   npm test App.test.jsx

   # Run tests in watch mode
   npm run test:watch
   ```

### Docker Commands
```bash
# Build Docker image
docker build -t song-lyrics-app .

# Run locally (development)
docker run -p 8080:8080 song-lyrics-app

# Run with development database
docker run -v $(pwd)/songs.db:/data/songs.db -p 8080:8080 song-lyrics-app
```

## Code Style Guidelines

### Backend (Node.js/Express)

#### File Structure
```
server.js              # Main server file
package.json           # Dependencies and scripts
songs.db              # SQLite database (development)
/data/songs.db        # SQLite database (production)
```

#### Module System
- Use **CommonJS** (`require()` / `module.exports`)
- One main server file (`server.js`)

#### Imports and Dependencies
```javascript
// Core Node.js modules first
const express = require('express');
const path = require('path');
const fs = require('fs');

// Third-party dependencies
const cors = require('cors');
const Database = require('better-sqlite3');
```

#### Database Patterns
- Use **prepared statements** for all SQL queries
- Auto-detect database path: `/data/songs.db` (production) or `./songs.db` (development)
- Initialize tables on startup with `IF NOT EXISTS`
- Use transactions for multi-statement operations

```javascript
// Database initialization
const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    lyrics TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Prepared statements for performance
const insertSong = db.prepare('INSERT INTO songs (title, lyrics) VALUES (?, ?)');
const selectAllSongs = db.prepare('SELECT * FROM songs ORDER BY created_at DESC');
```

#### API Design
- **RESTful endpoints** with proper HTTP methods
- **JSON responses** with consistent error format
- **Input validation** on all endpoints
- **Proper HTTP status codes**

```javascript
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
```

#### Error Handling
- Use `try/catch` blocks around all database operations
- Log errors with `console.error()` for debugging
- Return user-friendly error messages in responses
- Use appropriate HTTP status codes

#### Naming Conventions
- **Variables/Functions**: camelCase (`fetchSongs`, `createSong`)
- **Constants**: UPPER_SNAKE_CASE (`DB_FILE`, `PORT`)
- **Files**: kebab-case for multi-word (`server.js`, `package.json`)

### Frontend (React + Vite)

#### File Structure
```
client/
├── src/
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── package.json         # Frontend dependencies
└── vite.config.js       # Vite configuration
```

#### Component Patterns
- Use **functional components** with hooks
- **Single responsibility** per component
- **Early returns** for conditional rendering
- **Descriptive component names** (PascalCase)

```javascript
export default function SongList({ songs, onSelect, onDelete }) {
  if (songs.length === 0) {
    return <div>No songs found.</div>;
  }

  return (
    <div className="space-y-4">
      {songs.map(song => (
        <div key={song.id} className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">{song.title}</h3>
          <button onClick={() => onSelect(song)}>View</button>
          <button onClick={() => onDelete(song.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

#### State Management
- Use `useState` for local component state
- Use `useEffect` for side effects (API calls, event listeners)
- **Colocate state** near where it's used
- **Lift state up** when needed by multiple components

```javascript
export default function App() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/songs');
      if (!response.ok) throw new Error('Failed to fetch songs');
      const data = await response.json();
      setSongs(data);
    } catch (error) {
      setError('Failed to load songs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
}
```

#### API Integration
- Use **fetch API** for HTTP requests
- Handle loading and error states
- Use async/await for readability
- Refresh data after mutations

```javascript
const createSong = async (songData) => {
  try {
    const response = await fetch('/api/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(songData)
    });

    if (!response.ok) throw new Error('Failed to create song');

    await fetchSongs(); // Refresh the list
    return true;
  } catch (error) {
    setError('Failed to save song');
    console.error(error);
    return false;
  }
};
```

#### Styling (Tailwind CSS)
- Use **utility-first approach** with Tailwind classes
- **Responsive design** with breakpoint prefixes (`sm:`, `md:`, `lg:`)
- **Consistent color scheme** (dark theme with gray-900 background)
- **Semantic spacing** and sizing

```javascript
// Good: Semantic and responsive
<div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
  <h1 className="text-2xl font-bold mb-4 text-white">Song Lyrics</h1>
  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
    Add Song
  </button>
</div>

// Avoid: Inline styles or inconsistent spacing
<div style={{maxWidth: '56rem', margin: '0 auto'}}>
  <h1 style={{fontSize: '1.5rem'}}>Song Lyrics</h1>
</div>
```

#### Imports and Exports
- Use **ES6 imports/exports**
- Group imports by type (React, third-party, local)
- Use **default exports** for components
- Use **named exports** for utilities

```javascript
// App.jsx
import { useState, useEffect } from 'react';

// Third-party libraries
import { format } from 'date-fns';

// Local components/utilities
import SongList from './components/SongList';
import { apiClient } from './utils/api';

export default function App() {
  // Component logic
}
```

#### Naming Conventions
- **Components**: PascalCase (`SongList`, `LyricsView`)
- **Functions/Variables**: camelCase (`fetchSongs`, `handleSubmit`)
- **Files**: PascalCase for components (`SongList.jsx`), camelCase for utilities (`apiClient.js`)
- **CSS Classes**: kebab-case in Tailwind (`bg-gray-800`, `hover:bg-blue-700`)

### Linting Rules (ESLint)

Current ESLint configuration:
- **React Hooks**: Enforces rules of hooks
- **React Refresh**: Hot reload compatibility
- **Unused variables**: Allowed for variables starting with uppercase (constants)
- **Browser globals**: Available in browser environment

```javascript
// eslint.config.js
export default defineConfig([
  {
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
```

### Commit Message Conventions

Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat: add search functionality to song list
fix: handle empty lyrics in fullscreen view
docs: update API documentation
```

### Deployment Guidelines

#### Fly.io Configuration
- **Persistent volume**: Mounts `/data` directory for SQLite database
- **Port**: Uses 8080 (Fly.io default)
- **Environment**: Set `PORT=8080` in fly.toml

#### Docker Best Practices
- **Multi-stage build**: Separate build and production stages
- **Minimal image**: Use alpine Node.js image
- **Security**: Non-root user, minimal attack surface
- **Caching**: Proper layer ordering for build cache

### Security Considerations

- **Input validation**: Validate all API inputs
- **SQL injection**: Use prepared statements (already implemented)
- **CORS**: Properly configured for development
- **Environment variables**: Never commit secrets
- **Dependencies**: Keep packages updated, audit regularly

### Performance Optimization

- **Database**: Use prepared statements, indexes on frequently queried columns
- **Frontend**: Code splitting, lazy loading, optimize bundle size
- **API**: Pagination for large datasets, caching headers
- **Images**: Optimize static assets, use appropriate formats

## Quick Start for New Agents

1. **Clone and setup**:
   ```bash
   git clone <repo-url>
   cd song-lyrics-app
   npm install
   cd client && npm install && cd ..
   ```

2. **Start development**:
   ```bash
   npm start              # Terminal 1: Backend
   cd client && npm run dev  # Terminal 2: Frontend
   ```

3. **Make changes**:
   - Backend: Edit `server.js`
   - Frontend: Edit `client/src/App.jsx`
   - Styles: Edit `client/src/index.css`

4. **Test changes**:
   ```bash
   npm run build:client    # Verify build works
   cd client && npm run lint  # Check code quality
   ```

5. **Deploy**:
   ```bash
   fly deploy
   ```

Remember: This is a monolith app where the Express server serves both the API and the built React static files.