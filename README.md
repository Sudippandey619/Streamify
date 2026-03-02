# Music Streaming API

A RESTful API backend for the music streaming application.

## Features

- ✅ RESTful API endpoints for tracks, albums, playlists, and artists
- ✅ Search functionality across all content types
- ✅ CRUD operations for playlists
- ✅ Rate limiting and security middleware
- ✅ Error handling and validation
- ✅ CORS support for frontend integration
- ✅ Health check endpoint

## Quick Start

1. Install dependencies:
```bash
cd backend
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The API will be available at `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Tracks
- `GET /api/tracks` - Get all tracks
- `GET /api/tracks/:id` - Get track by ID

### Albums
- `GET /api/albums` - Get all albums
- `GET /api/albums/:id` - Get album by ID (includes tracks)

### Playlists
- `GET /api/playlists` - Get all playlists
- `GET /api/playlists/:id` - Get playlist by ID (includes tracks)
- `POST /api/playlists` - Create new playlist
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist

### Artists
- `GET /api/artists` - Get all artists
- `GET /api/artists/:id` - Get artist by ID

### Search
- `GET /api/search?q=query` - Search across all content

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
NODE_ENV=development
```

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes per IP)
- Input validation
- Error handling

## Production Deployment

1. Set environment variables:
```env
NODE_ENV=production
PORT=3001
```

2. Update CORS origins in `server.js` to match your frontend domain

3. Start the server:
```bash
npm start
```

## API Response Format

All endpoints return JSON responses with consistent error handling:

```json
// Success response
{
  "id": "track-1",
  "title": "Midnight Drive",
  "artist": "Neon Dreams"
}

// Error response
{
  "error": "Track not found"
}
```