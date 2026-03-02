# 🎵 SoundStream - MERN Music Streaming App Setup Guide

## Quick Start

```bash
# 1. Install frontend and backend dependencies
npm run setup

# 2. Start both frontend and backend
npm run dev:full

# 3. Open your browser
http://localhost:5173
```

## Environment Configuration

Your `.env` file has already been configured with the necessary API keys:

### YouTube API
- **Key**: `YOUTUBE_API_KEY` 
- **Used for**: Searching music videos on YouTube
- **Endpoint**: `/api/youtube/search`

### Spotify API
- **Client ID**: `SPOTIFY_CLIENT_ID` 
- **Client Secret**: `SPOTIFY_CLIENT_SECRET` 
- **Redirect URI**: `SPOTIFY_REDIRECT_URI`
- **Used for**: Track metadata (artist, album, duration, artwork)
- **Endpoints**: `/api/spotify/auth`, `/api/spotify/search`, `/api/spotify/track/:id`

## Backend Endpoints

### YouTube Search
```
GET /api/youtube/search?q=ed+sheeran&maxResults=10
```
Returns: Array of videos with id, title, thumbnail, channelTitle

### YouTube Video Details
```
GET /api/youtube/video/:videoId
```
Returns: Video details including duration, view count, likes

### Spotify OAuth (If needed for premium features)
```
POST /api/spotify/callback
Body: { code: "auth_code" }
```
Returns: accessToken, refreshToken, expiresIn

### Spotify Search (Requires accessToken)
GET /api/spotify/search?q=query&accessToken=token&type=track&limit=10
```
Returns: Track metadata with artwork and artist info

## Frontend Features

### MusicStreamingView
- Full-page music discovery interface
- Dark/light mode toggle
- Responsive grid layout

### SearchComponent
- Real-time YouTube search
- Display search results with artwork
- Click to expand and play in YouTube player

### SongCard
- Displays song title, artist, album art
- Play button overlay
- Expandable YouTube player
- Smooth animations with Framer Motion

### YouTubePlayer
- Embedded YouTube iframe
- Auto-play support
- Responsive sizing

### DarkModeToggle
- Toggle between dark/light mode
- Saves preference to localStorage
- Respects system preference on first visit
- Smooth animated transitions

## Project Structure

```
backend/
├── spotify-oauth-routes.js      # Spotify OAuth & metadata
├── youtube-api-routes.js        # YouTube search & video details
├── server.js                    # Express server
└── package.json

src/
├── app/
│   ├── components/
│   │   ├── YouTubePlayer.tsx    # Embedded player
│   │   ├── SongCard.tsx         # Song display card
│   │   ├── MusicSearch.tsx      # Search interface
│   │   ├── DarkModeToggle.tsx   # Theme switcher
│   │   └── Sidebar.tsx          # Navigation (updated)
│   ├── views/
│   │   └── MusicStreamingView.tsx # Main view
│   └── App.tsx                  # Updated with new view
```

## Styling & Animations

- **Tailwind CSS**: Responsive design with dark mode support
- **Framer Motion**: Smooth animations and transitions
- **Icons**: Lucide React icons throughout

## How It Works

1. **User searches** for a song/artist in the search box
2. **Backend queries YouTube API** and returns video results
3. **Frontend displays cards** with thumbnail and metadata
4. **User clicks play** → YouTube iframe expands and plays
5. **Dark mode toggle** switches theme site-wide

## Getting Your Own API Keys

### YouTube API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable YouTube Data API v3
4. Create an API key
5. Add to `.env`: `YOUTUBE_API_KEY=your_key`

### Spotify API
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create an app
3. Get Client ID and Client Secret
4. Set Redirect URI in app settings
5. Add to `.env`:
   ```
   SPOTIFY_CLIENT_ID=your_id
   SPOTIFY_CLIENT_SECRET=your_secret
   SPOTIFY_REDIRECT_URI=http://localhost:3001/api/spotify/callback
   ```

## Troubleshooting

### YouTube Search not working?
- Verify `YOUTUBE_API_KEY` is set in `.env`
- Check Google Cloud Console quotas
- Ensure API is enabled in Cloud Console

### Spotify features not working?
- Verify Spotify credentials in `.env`
- Check redirect URI matches exactly
- Test OAuth flow in browser

### Dark mode not persisting?
- Check browser localStorage is enabled
- Clear cache and try again
- Check browser console for errors

### Frontend not connecting to backend?
- Verify backend is running on port 3001
- Check `VITE_API_URL` in `.env` is correct
- Verify CORS is enabled on backend

## Next Steps

### Add More Features:
- Spotify Playlist Import
- User favorites/bookmarks
- Playlist creation
- Share functionality
- Download tracks

### Improve Performance:
- Add caching for search results
- Lazy load images
- Optimize bundle size

### Enhance UI:
- Add song details modal
- Implement mini player
- Add keyboard shortcuts
- Create playlist page

Enjoy your music! 🎵
