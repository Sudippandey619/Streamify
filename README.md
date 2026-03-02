
# Spotify-like Music Streaming App

A full-stack music streaming application with React frontend and Express.js backend API.

## Features

### Frontend
- 🎵 Modern music player interface
- 🔍 Real-time search functionality
- 📱 Responsive design (mobile & desktop)
- 🎨 Dark theme with smooth animations
- 📋 Playlist management
- 🎧 Audio player controls
- ⚡ Fast loading with skeleton states
- 🎶 **Music upload system** - Add your own tracks!

### Backend API
- 🚀 RESTful API with Express.js
- 🔒 Security middleware (Helmet, CORS, Rate limiting)
- 📊 CRUD operations for playlists
- 🔍 Search across all content types
- ⚡ Error handling and validation
- 🏥 Health check endpoint
- 📁 **File upload support** - Upload audio files and cover art

## Quick Start

### Option 1: Run Everything Together (Recommended)

1. **Setup both frontend and backend:**
```bash
npm run setup
```

2. **Start both servers:**
```bash
npm run dev:full
```

This will start:
- Backend API server on `http://localhost:3001`
- Frontend development server on `http://localhost:5173`

### 🎵 Adding Your Own Music

1. **Access Music Manager:** Click "Music Manager" in the sidebar
2. **Upload tracks:** Support for MP3, WAV, M4A, FLAC, OGG files
3. **Add cover art:** Optional JPG, PNG, WebP images
4. **Fill track info:** Title, artist, album, duration
5. **Start streaming:** Your music appears alongside demo tracks

### 🎶 Real Music Included

The app comes with **multiple music sources**:

#### **Jamendo Free Music** 🎵 (Recommended!)
- **500,000+ FREE songs** - No authentication required!
- **FULL tracks** - Complete songs, not just previews
- **Legal & licensed** - Creative Commons music
- **Downloadable** - Users can download tracks
- **All genres** - Pop, Rock, Electronic, Jazz, Classical, Hip-Hop, Metal, Ambient
- **Works immediately** - No setup needed!

#### **Demo Content** 🎧
- **Daft Punk's "Discovery" album** - 14 tracks with previews
- **Professional metadata** and album artwork

#### **Your Own Music** 📁
- **Upload system** for personal music files
- **Mix with streaming content** seamlessly

### 🚀 Quick Start

```bash
# Install and start everything
npm run setup
npm run dev:full

# Open http://localhost:5173
# Go to Music Manager → Free Music (Jamendo)
# Search for any music and play FULL tracks!
```

See [JAMENDO_INTEGRATION.md](JAMENDO_INTEGRATION.md) for details about the free music integration.

See [MUSIC_SETUP.md](MUSIC_SETUP.md) for detailed instructions.

### Option 2: Run Separately

**Frontend only:**
```bash
npm install
npm run dev
```

**Backend only:**
```bash
cd backend
npm install
npm run dev
```

## Project Structure

```
├── src/                    # Frontend React application
│   ├── app/               # Main app components
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts
│   ├── services/          # API service layer
│   ├── types/             # TypeScript interfaces
│   └── styles/            # CSS and styling
├── backend/               # Express.js API server
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
└── package.json           # Frontend dependencies
```

## API Endpoints

The backend provides these REST endpoints:

- **Tracks:** `GET /api/tracks`, `GET /api/tracks/:id`
- **Albums:** `GET /api/albums`, `GET /api/albums/:id`
- **Playlists:** `GET /api/playlists`, `POST /api/playlists`, `PUT /api/playlists/:id`, `DELETE /api/playlists/:id`
- **Artists:** `GET /api/artists`, `GET /api/artists/:id`
- **Search:** `GET /api/search?q=query`
- **Health:** `GET /api/health`

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
VITE_API_URL=http://localhost:3001/api
NODE_ENV=development
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
- **Morgan** - HTTP logging
- **Express Rate Limit** - Rate limiting

## Development

### Adding New Features

1. **Frontend:** Add components in `src/app/components/`
2. **Backend:** Add routes in `backend/server.js`
3. **API Integration:** Update `src/services/api.ts`

### Error Handling

The app includes comprehensive error handling:
- React Error Boundaries for UI errors
- HTTP error handling in API client
- Backend error middleware
- User-friendly error messages

## Production Deployment

### Frontend
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend
```bash
cd backend
NODE_ENV=production npm start
```

Update CORS origins in `backend/server.js` for production domains.

## Original Design

This project is based on the Figma design: https://www.figma.com/design/65nug86AjBZkhgPkqLn1KH/Spotify-like-music-streaming-app
  