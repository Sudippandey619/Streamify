# API Structure Guide

This Spotify-like music streaming app is built with a clean separation between the frontend and backend logic. Currently, it uses mock data, but the structure is designed to easily integrate with a real backend API.

## Current Mock API Service

The mock API service is located in `/src/services/api.ts` and simulates network delays to provide a realistic user experience.

## Expected Backend API Endpoints

When you're ready to connect to a real backend, replace the mock functions with actual API calls to these endpoints:

### Tracks
- `GET /api/tracks` - Fetch all tracks
- `GET /api/tracks/:id` - Fetch a specific track by ID

### Albums
- `GET /api/albums` - Fetch all albums
- `GET /api/albums/:id` - Fetch a specific album by ID (includes track list)

### Playlists
- `GET /api/playlists` - Fetch all playlists
- `GET /api/playlists/:id` - Fetch a specific playlist by ID (includes track list)
- `POST /api/playlists` - Create a new playlist
- `PUT /api/playlists/:id` - Update a playlist
- `DELETE /api/playlists/:id` - Delete a playlist

### Artists
- `GET /api/artists` - Fetch all artists
- `GET /api/artists/:id` - Fetch a specific artist by ID

### Search
- `GET /api/search?q=query` - Search across all content (tracks, albums, playlists, artists)

## Data Models

TypeScript interfaces are defined in `/src/types/music.ts`:

- `Track` - Individual song with metadata
- `Album` - Collection of tracks by an artist
- `Playlist` - User-created or curated collection of tracks
- `Artist` - Artist information and metadata

## Mock Data

Sample data is available in `/src/services/mockData.ts` for development and testing purposes.

## Integration Steps

1. Create your backend API with the endpoints listed above
2. Update `/src/services/api.ts` to make real HTTP requests using `fetch` or `axios`
3. Ensure response formats match the TypeScript interfaces
4. Handle authentication and authorization as needed
5. Update error handling for production use

## Example API Implementation

```typescript
// Replace mock function in /src/services/api.ts
export const fetchTracks = async (): Promise<Track[]> => {
  const response = await fetch('/api/tracks');
  if (!response.ok) throw new Error('Failed to fetch tracks');
  return response.json();
};
```

## Features Ready for Backend Integration

- ✅ Full CRUD operations structure
- ✅ Loading states with skeletons
- ✅ Error boundaries (can be enhanced)
- ✅ TypeScript type safety
- ✅ Search with debouncing
- ✅ Player state management
- ✅ Responsive design
