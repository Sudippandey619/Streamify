# ⚡ Quick Reference Guide

## 🚀 Start the App

```bash
# One command to start everything
npm run dev:full

# Individual commands
npm run dev              # Frontend only
npm run dev:backend     # Backend only
npm start               # Backend (production)
```

## 🔍 Test the API

### YouTube Search
```bash
curl "http://localhost:3001/api/youtube/search?q=ed+sheeran&maxResults=10"
```

Response:
```json
[
  {
    "id": "VIDEO_ID",
    "title": "Song Title",
    "thumbnail": "https://...",
    "channelTitle": "Artist Name",
    "url": "https://youtu.be/..."
  }
]
```

### Spotify OAuth URL
```bash
curl "http://localhost:3001/api/spotify/auth"
```

## 📱 Frontend Routes

- **Home**: `http://localhost:5173` (HomeView)
- **Music Stream**: `http://localhost:5173` → Click "Music Stream" in sidebar
- **Search**: `http://localhost:5173` → Click "Search"
- **Library**: `http://localhost:5173` → Click "Your Library"

## 🎨 Component Usage Examples

### YouTubePlayer
```tsx
import { YouTubePlayer } from '@/app/components/YouTubePlayer';

<YouTubePlayer videoId="dQw4w9WgXcQ" title="Song Name" />
```

### SongCard
```tsx
import { SongCard } from '@/app/components/SongCard';

const song = {
  id: '1',
  title: 'Song',
  artist: 'Artist',
  image: 'url',
  youtubeVideoId: 'dQw4w9WgXcQ'
};

<SongCard song={song} onPlay={(s) => console.log(s)} />
```

### DarkModeToggle
```tsx
import { DarkModeToggle } from '@/app/components/DarkModeToggle';

<DarkModeToggle />
```

### SearchComponent
```tsx
import { SearchComponent } from '@/app/components/MusicSearch';

<SearchComponent apiBaseUrl="http://localhost:3001/api" />
```

## 🛠️ Environment Variables

```env
# Frontend URL
VITE_API_URL=http://localhost:3001/api

# YouTube
YOUTUBE_API_KEY=your_key_here

# Spotify
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
SPOTIFY_REDIRECT_URI=http://localhost:3001/api/spotify/callback
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/server.js` | Express server |
| `backend/youtube-api-routes.js` | YouTube API routes |
| `backend/spotify-oauth-routes.js` | Spotify routes |
| `src/app/views/MusicStreamingView.tsx` | Main music app |
| `src/app/components/MusicSearch.tsx` | Search interface |
| `src/app/components/SongCard.tsx` | Song display |
| `src/app/components/YouTubePlayer.tsx` | Player |
| `src/app/components/DarkModeToggle.tsx` | Theme toggle |

## 🔐 Getting API Keys

### YouTube
1. [Google Cloud Console](https://console.cloud.google.com)
2. Create project
3. Enable "YouTube Data API v3"
4. Create API Key
5. Add to `.env`

### Spotify
1. [Spotify Developer](https://developer.spotify.com/dashboard)
2. Create app
3. Get Client ID & Secret
4. Add redirect URI: `http://localhost:3001/api/spotify/callback`
5. Add to `.env`

## 🎯 Common Tasks

### Add a new song search endpoint
Edit `backend/youtube-api-routes.js`:
```js
router.get('/your-endpoint', async (req, res) => {
  // Your code here
  res.json(results);
});
```

### Modify card styling
Edit `src/app/components/SongCard.tsx`:
- Change Tailwind classes
- Add/remove animation props
- Customize icon usage

### Change search API endpoint
Edit `src/app/components/MusicSearch.tsx`:
```tsx
const youtubeRes = await fetch(
  `${apiBaseUrl}/youtube/search?q=${encodeURIComponent(query)}`
);
```

### Customize dark mode colors
Edit `src/styles/theme.css` or update Tailwind config:
```tsx
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      // Add custom colors
    }
  }
}
```

## 🐛 Debug Mode

### Check Backend Logs
Terminal running backend will show:
```
🎵 Music API server running on port 3001
::1 - - [01/Mar/2026:04:40:45 +0000] "GET /api/health HTTP/1.1" 200 54
```

### Check Frontend Errors
Browser DevTools → Console tab

### Test API Endpoints
Use Postman or curl:
```bash
curl -v "http://localhost:3001/api/youtube/search?q=test"
```

## 📦 Dependencies

### Backend
- express
- axios
- cors
- helmet
- morgan
- dotenv

### Frontend
- react
- typescript  
- tailwindcss
- framer-motion
- lucide-react
- radix-ui

## 🚦 Troubleshooting Checklist

- [ ] Backend running? `npm run dev:backend`
- [ ] Frontend running? `npm run dev`
- [ ] API keys in `.env`?
- [ ] Port 3001 available?
- [ ] Port 5173 available?
- [ ] Browser cache cleared?
- [ ] Console errors checked?

## 📚 Documentation Files

- `MERN_SETUP.md` - Complete setup guide
- `README_NEWAPP.md` - Full app documentation
- `MIGRATION_SUMMARY.md` - What changed
- `QUICK_START.md` - Original quick start

## 💡 Tips & Tricks

1. **Disable dark mode by default**: 
   ```tsx
   // In DarkModeToggle.tsx, change initial state
   const [isDark, setIsDark] = useState(false);
   ```

2. **Change card columns for mobile**:
   ```tsx
   // In MusicSearch.tsx
   className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
   ```

3. **Add more animations**:
   ```tsx
   // Use Framer Motion
   whileHover={{ y: -12, scale: 1.05 }}
   whileTap={{ scale: 0.98 }}
   ```

4. **Increase search results**:
   ```tsx
   // In search call
   maxResults=20  // Change from 10
   ```

## 🎉 You're Ready!

```bash
npm run dev:full
# Open http://localhost:5173
# Search for your favorite song!
```

---

For more details, see:
- [MERN_SETUP.md](MERN_SETUP.md)
- [README_NEWAPP.md](README_NEWAPP.md)
- [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)
