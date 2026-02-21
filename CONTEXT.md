# Context.md - Song Lyrics App Current State

## Project Overview
**Song Lyrics App** is a fully functional web application for storing and viewing song lyrics. It features a Node.js/Express backend with SQLite database and a React frontend with Tailwind CSS styling. Users can create custom setlists to organize songs, similar to Spotify playlists, with drag-and-drop reordering and full CRUD operations.

## Current Implementation Status ✅

### Backend (Node.js/Express)
- ✅ **Server**: Express server running on port 3000 (configurable via PORT env var)
- ✅ **Database**: SQLite with better-sqlite3, auto-detecting `/data/songs.db` (prod) or `./songs.db` (dev)
- ✅ **API Endpoints**:
  - `GET /api/songs` - Fetch all songs (newest first)
  - `POST /api/songs` - Create new song
  - `PUT /api/songs/:id` - Update existing song
  - `DELETE /api/songs/:id` - Delete song
  - `GET /api/setlists` - Fetch all setlists
  - `POST /api/setlists` - Create new setlist
  - `PUT /api/setlists/:id` - Update setlist name
  - `DELETE /api/setlists/:id` - Delete setlist
  - `GET /api/setlists/:id/songs` - Fetch songs in a setlist
  - `POST /api/setlists/:id/songs` - Add song to setlist
  - `DELETE /api/setlists/:id/songs/:songId` - Remove song from setlist
  - `PUT /api/setlists/:id/reorder` - Reorder songs in setlist
- ✅ **Database Schema**: 
  - `songs` table with `id`, `title`, `lyrics`, `created_at`
  - `setlists` table with `id`, `name`, `created_at`
  - `setlist_songs` table with `id`, `setlist_id`, `song_id`, `position` (junction table with ordering)
- ✅ **Prepared Statements**: All SQL queries use prepared statements for security/performance
- ✅ **Static File Serving**: Serves built React app from `client/dist`
- ✅ **CORS**: Enabled for development

### Frontend (React + Vite)
- ✅ **Main Views**: List view, form view (add/edit), fullscreen lyrics view, setlists view, setlist detail view
- ✅ **Search/Filter**: Real-time search by song title
- ✅ **CRUD Operations**: Create, read, update, delete songs and setlists via UI
- ✅ **Setlist Management**: Create setlists, add/remove songs, drag-and-drop reordering
- ✅ **Navigation**: React Router with URL-based navigation (5 routes: songs, song-form, song-view, setlists, setlist-detail)
- ✅ **State Management**: Custom React hooks for API logic, proper state management with loading/error states
- ✅ **Styling**: Tailwind CSS with dark theme
- ✅ **API Integration**: Fetch API with proper error handling and success notifications
- ✅ **Development Proxy**: Vite proxies `/api` requests to Express server
- ✅ **Component Architecture**: Feature-based organization with granular, reusable components
- ✅ **Testing**: Vitest configured with 11 passing tests for shared components
- ✅ **Code Quality**: ESLint clean, production builds successful

### Deployment & Infrastructure
- ✅ **Docker**: Multi-stage build (React build + Node production)
- ✅ **Fly.io**: Configuration with persistent volume for `/data` directory
- ✅ **Environment Detection**: Auto-detects dev vs prod environments

## Recent Changes (Last Session)

### ✅ Completed Features
1. **Full CRUD API** - All endpoints implemented with proper error handling
2. **Complete React UI** - Three-view app with search, edit, delete functionality
3. **Database Auto-detection** - Smart path handling for dev/prod
4. **Deployment Configuration** - Docker + Fly.io setup
5. **Documentation** - AGENTS.md with comprehensive guidelines
6. **Setlist Feature** - Full Spotify-like playlist functionality with drag-and-drop, navigation, and real-time updates
7. **Client Refactoring** - Monolithic App.jsx split into 5 organized pages with React Router
8. **Component Architecture** - Feature-based organization with granular, reusable components (songs, setlists, shared, modals)
9. **Custom Hooks** - API logic extracted into 3 custom hooks (useSongs, useSetlists, useSetlistSongs)
10. **Modal Components** - Native prompt() dialogs replaced with proper React modal components
11. **Testing Setup** - Vitest configured with 11 passing tests for shared components
12. **Bug Fixes** - Race conditions fixed in setlist detail and song view pages

### 🔧 Technical Improvements
- Fixed Express version compatibility (4.x for stability)
- Configured Vite proxy for seamless API development
- Implemented prepared statements for SQL security
- Added comprehensive error handling throughout
- Fixed JSX syntax errors and verified build process
- Implemented drag-and-drop with @dnd-kit library
- Added navigation history tracking for proper back button behavior
- Refactored client codebase with React Router and custom hooks
- Resolved import path issues with absolute imports from /src/
- Fixed race conditions in navigation effects with data loading state flags
- Configured ESLint rules for underscore-prefixed variables

## Current State Assessment

### ✅ Working Features
- **Server Startup**: `npm start` launches successfully
- **Database**: Auto-initializes on first run
- **API**: All endpoints respond correctly
- **Frontend Build**: `npm run build:client` completes successfully
- **Development**: Both servers run without conflicts
- **Linting**: ESLint configured and working
- **Testing**: Vitest configured with passing tests

### ⚠️ Known Issues/Limitations
1. **No Authentication**: Public access to all songs
2. **No Pagination**: All songs loaded at once (fine for small datasets)
3. **No Input Sanitization**: Basic validation only
4. **Single Database File**: No backup/recovery mechanisms

### 🚧 Technical Debt
- **Error Messages**: Could be more user-friendly in UI
- **Loading States**: Basic loading indicators (could be enhanced)
- **Form Validation**: Client-side validation could be more robust
- **Database Migrations**: No migration system for schema changes

## Development Environment Status

### ✅ Ready for Development
```bash
# Backend server (with API)
npm start

# Frontend dev server (with hot reload)
cd client && npm run dev

# Build React app for production
npm run build:client

# Lint frontend code
cd client && npm run lint

# Run tests
cd client && npm run test
```

### 📦 Dependencies
- **Backend**: express@4.19.2, better-sqlite3@12.6.2, cors@2.8.6
- **Frontend**: react@19.2.0, vite@7.3.1, tailwindcss@4.2.0, eslint configured

## Deployment Status

### ✅ Production Ready
- **Docker Image**: Multi-stage build working
- **Fly.io Config**: `fly.toml` with volume mount configured
- **Database Path**: Correctly mounts to `/data/songs.db` in production

### 🚀 Deployment Commands
```bash
# Build and deploy
fly launch    # Initialize (if not done)
fly deploy    # Deploy updates
fly open      # Open live app
```

## Future Development Considerations

### 🔄 Immediate Priorities
1. **Add Authentication**: User accounts and song ownership
2. **Improve UX**: Better loading states, confirmations, notifications
3. **Database Backup**: Automated backups for Fly.io volumes
4. **Setlist Enhancements**: Advanced features like setlist sharing, export, or duplicate detection

### 🎯 Medium-term Goals
1. **Advanced Search**: Search within lyrics, tags, artists
2. **Song Categories**: Organize songs by genre/artist
3. **Import/Export**: CSV/JSON import, PDF export
4. **Mobile Optimization**: PWA features, responsive improvements

### 🏗️ Architecture Considerations
1. **Database Scaling**: Consider PostgreSQL if user base grows
2. **Caching**: Redis for frequently accessed songs
3. **CDN**: Static asset optimization
4. **Monitoring**: Error tracking, performance monitoring

## Current Database State
- **File**: `./songs.db` (dev) or `/data/songs.db` (prod)
- **Tables**: 
  - `songs` (id, title, lyrics, created_at)
  - `setlists` (id, name, created_at)
  - `setlist_songs` (id, setlist_id, song_id, position)
- **Sample Data**: None (fresh database)
- **Size**: Minimal (~12KB with schema only)

## Quick Development Workflow

### For New Features
1. **Backend**: Add endpoint to `server.js`, test with curl/Postman
2. **Frontend**: Update `App.jsx` or add components, test with dev server
3. **Database**: Add prepared statements for new queries
4. **Build**: Run `npm run build:client` before deploying

### For Bug Fixes
1. **Reproduce**: Use dev servers to replicate issue
2. **Fix**: Make changes to appropriate files
3. **Test**: Manual testing with UI and API calls
4. **Deploy**: Build and deploy to verify fix

## Session Notes
- **Last Updated**: February 21, 2026
- **Working Directory**: `/home/jmak/biisit`
- **Git Status**: Not a git repository (consider initializing)
- **Node Version**: v24.13.0 (compatible with project)
- **Recent Work**: Major client refactoring completed - modular architecture, React Router, custom hooks, Vitest testing, race condition fixes
- **All Systems Operational**: ✅ Ready for development

---

*This context file should be updated after each development session to maintain accurate project state for future work.*