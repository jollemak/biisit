# Song Lyrics App

A simple web application for storing and viewing song lyrics, built with Node.js, Express, React, and SQLite.

## Features

- 📝 Add, edit, and delete song lyrics
- 🔍 Search songs by title
- 👀 Full-screen lyrics viewing mode
- 💾 Persistent SQLite database storage
- 🚀 Deployed as a single monolith app on Fly.io

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: SQLite with better-sqlite3
- **Frontend**: React + Tailwind CSS
- **Build Tool**: Vite
- **Deployment**: Fly.io with persistent volumes

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd song-lyrics-app

   # Install server dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

2. **Start development servers:**

   **Option A: Run both servers separately**
   ```bash
   # Terminal 1: Start the backend server
   npm start

   # Terminal 2: Start the frontend dev server
   cd client
   npm run dev
   ```

   **Option B: Use the development script**
   ```bash
   # Install concurrently (optional)
   npm install -g concurrently

   # Add to package.json scripts (optional):
   # "dev": "concurrently \"npm start\" \"cd client && npm run dev\""
   ```

3. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api/songs

## API Documentation

### Endpoints

- `GET /api/songs` - Fetch all songs (newest first)
- `POST /api/songs` - Create a new song
- `PUT /api/songs/:id` - Update an existing song
- `DELETE /api/songs/:id` - Delete a song

### Song Object

```json
{
  "id": 1,
  "title": "Amazing Grace",
  "lyrics": "Amazing grace, how sweet the sound...",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

## Deployment to Fly.io

### Prerequisites

- Fly.io account and CLI installed
- Docker

### Deploy

1. **Initialize Fly app:**
   ```bash
   fly launch
   ```
   Follow the prompts and choose your app name.

2. **Create persistent volume:**
   ```bash
   fly volumes create songs_data --size 1
   ```

3. **Deploy:**
   ```bash
   fly deploy
   ```

4. **Check deployment:**
   ```bash
   fly status
   fly open  # Opens your app in browser
   ```

### Database Location

- **Development**: `./database.db`
- **Production**: `/data/songs.db` (mounted persistent volume)

The app automatically detects the correct database location.

## Project Structure

```
song-lyrics-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main React app
│   │   └── index.css      # Tailwind styles
│   ├── vite.config.js     # Vite configuration
│   └── package.json
├── server.js              # Express server
├── package.json           # Server dependencies
├── Dockerfile             # Multi-stage build
├── fly.toml              # Fly.io configuration
├── .dockerignore
└── .gitignore
```

## Building for Production

```bash
# Build the React app
cd client
npm run build

# The built files will be in client/dist/
# The Express server serves these static files
```

## License

ISC