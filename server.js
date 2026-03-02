import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { uploadRoutes, uploadedTracks, uploadedAlbums, uploadedArtists } from './upload-routes.js';
import youtubeApiRoutes from './youtube-api-routes.js';
import spotifyOAuthRoutes from './spotify-oauth-routes.js';
import spotifyRoutes from './spotify-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env FIRST, before anything else
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.warn('⚠️  Error loading .env:', result.error);
  } else {
    console.log('✅ Loaded .env from:', envPath);
  }
} else {
  console.warn('⚠️  .env file not found at:', envPath);
}

// Verify Spotify credentials are ready
if (!process.env.SPOTIFY_CLIENT_ID) {
  console.warn('⚠️  SPOTIFY_CLIENT_ID not set');
}
if (!process.env.SPOTIFY_CLIENT_SECRET) {
  console.warn('⚠️  SPOTIFY_CLIENT_SECRET not set');
}

// Import mock data (converted to JS format)
// Real Artists from Deezer API
const mockArtists = [
  {
    id: '27',
    name: 'Daft Punk',
    imageUrl: 'https://cdn-images.dzcdn.net/images/artist/638e69b9caaf9f9f3f8826febea7b543/500x500-000000-80-0-0.jpg',
    genres: ['Electronic', 'Dance', 'House'],
    followers: 8500000,
    verified: true,
  },
  {
    id: 'artist-2',
    name: 'The Midnight Riders',
    imageUrl: 'https://images.unsplash.com/photo-1684679106461-dae134df8da6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwYmFuZCUyMGNvbmNlcnR8ZW58MXx8fHwxNzY5OTczMTYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    genres: ['Rock', 'Alternative', 'Indie'],
    followers: 892450,
    verified: true,
  },
  {
    id: 'artist-3',
    name: 'Luna Jazz Collective',
    imageUrl: 'https://images.unsplash.com/photo-1613412140788-9ed674d57c41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXp6JTIwbXVzaWNpYW4lMjBzYXhvcGhvbmV8ZW58MXx8fHwxNzY5OTI1MTQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    genres: ['Jazz', 'Contemporary Jazz', 'Fusion'],
    followers: 456780,
    verified: true,
  },
  {
    id: 'artist-4',
    name: 'Nova',
    imageUrl: 'https://images.unsplash.com/photo-1718141765361-059d7337f5f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXAlMjBob3AlMjBhcnRpc3QlMjBwb3J0cmFpdHxlbnwxfHx8fDE3Njk5MTQwMjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    genres: ['Hip-Hop', 'Rap', 'Urban'],
    followers: 2134560,
    verified: true,
  },
  {
    id: 'artist-5',
    name: 'Echo Valley',
    imageUrl: 'https://images.unsplash.com/photo-1619378449400-cb8c5bd7b6f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMG11c2ljJTIwYmFuZHxlbnwxfHx8fDE3Njk5NDA5MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    genres: ['Indie', 'Folk', 'Alternative'],
    followers: 678920,
    verified: false,
  },
  {
    id: 'artist-6',
    name: 'Stella Ray',
    imageUrl: 'https://images.unsplash.com/photo-1600146698733-a339319d56e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3AlMjBtdXNpYyUyMGNvbmNlcnQlMjBsaWdodHN8ZW58MXx8fHwxNzY5OTczMTYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    genres: ['Pop', 'Dance', 'Electropop'],
    followers: 3456789,
    verified: true,
  },
];

// Real Tracks from Deezer API - Daft Punk Discovery Album
const mockTracks = [
  {
    id: '3135553',
    title: 'One More Time',
    artist: 'Daft Punk',
    artistId: '27',
    album: 'Discovery',
    albumId: '302127',
    duration: 320,
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/f/8/c/0/f8c5dc3837912dba37c9a1ab3170cc3f.mp3',
    releaseDate: '2001-03-07',
  },
  {
    id: '3135554',
    title: 'Aerodynamic',
    artist: 'Daft Punk',
    artistId: '27',
    album: 'Discovery',
    albumId: '302127',
    duration: 212,
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/6/9/9/0/699d41611cf0280f0a55c8ba4a372c14.mp3',
    releaseDate: '2001-03-07',
  },
  {
    id: '3135555',
    title: 'Digital Love',
    artist: 'Daft Punk',
    artistId: '27',
    album: 'Discovery',
    albumId: '302127',
    duration: 301,
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/1/e/c/0/1ec8ff31f93acc81ebb93a45c191e219.mp3',
    releaseDate: '2001-03-07',
  },
  {
    id: '3135556',
    title: 'Harder, Better, Faster, Stronger',
    artist: 'Daft Punk',
    artistId: '27',
    album: 'Discovery',
    albumId: '302127',
    duration: 226,
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/6/a/2/0/6a2c0a5670afe821e08fc5154909534a.mp3',
    releaseDate: '2001-03-07',
  },
  {
    id: '3135557',
    title: 'Crescendolls',
    artist: 'Daft Punk',
    artistId: '27',
    album: 'Discovery',
    albumId: '302127',
    duration: 211,
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/1/f/6/0/1f65f58dc3cfa276ac6a1ee6f2ffac20.mp3',
    releaseDate: '2001-03-07',
  },
  {
    id: '3135558',
    title: 'Nightvision',
    artist: 'Daft Punk',
    artistId: '27',
    album: 'Discovery',
    albumId: '302127',
    duration: 104,
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/c/0/6/0/c063dbb3b8f2af8dac3e88950f2e38b0.mp3',
    releaseDate: '2001-03-07',
  },
  {
    id: '3135559',
    title: 'Superheroes',
    artist: 'Daft Punk',
    artistId: '27',
    album: 'Discovery',
    albumId: '302127',
    duration: 237,
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/1/b/c/0/1bc57c07bfaf6a265e06ce9574390e0e.mp3',
    releaseDate: '2001-03-07',
  },
  {
    id: '3135560',
    title: 'High Life',
    artist: 'Daft Punk',
    artistId: '27',
    album: 'Discovery',
    albumId: '302127',
    duration: 201,
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/e/e/a/0/eea4fd9467e697d503998dff44ceeaa3.mp3',
    releaseDate: '2001-03-07',
  },
  {
    id: '3135561',
    title: 'Something About Us',
    artist: 'Daft Punk',
    artistId: '27',
    album: 'Discovery',
    albumId: '302127',
    duration: 232,
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/c/f/f/0/cff7c95e11ba9f6ac3ff0401a81df4f5.mp3',
    releaseDate: '2001-03-07',
  },
  {
    id: '3135562',
    title: 'Voyager',
    artist: 'Daft Punk',
    artistId: '27',
    album: 'Discovery',
    albumId: '302127',
    duration: 227,
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/b/c/9/0/bc95bc4a6fdcf3e9b1672229f679eea1.mp3',
    releaseDate: '2001-03-07',
  },
  {
    id: '3135563',
    title: 'Veridis Quo',
    artist: 'Daft Punk',
    artistId: '27',
    album: 'Discovery',
    albumId: '302127',
    duration: 345,
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/6/4/5/0/6456b666c0b1d4537e34d71e5cbd098c.mp3',
    releaseDate: '2001-03-07',
  },
  {
    id: '3135564',
    title: 'Short Circuit',
    artist: 'Daft Punk',
    artistId: '27',
    album: 'Discovery',
    albumId: '302127',
    duration: 206,
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/4/1/3/0/413592fd246163564e5416fb72f8c831.mp3',
    releaseDate: '2001-03-07',
  },
  {
    id: '3135565',
    title: 'Face to Face',
    artist: 'Daft Punk',
    artistId: '27',
    album: 'Discovery',
    albumId: '302127',
    duration: 240,
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/b/c/5/0/bc5ffa003d9ccf020a633083738c6ae4.mp3',
    releaseDate: '2001-03-07',
  },
  {
    id: '3135566',
    title: 'Too Long',
    artist: 'Daft Punk',
    artistId: '27',
    album: 'Discovery',
    albumId: '302127',
    duration: 600,
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/8/f/e/0/8fe6827c48cc62fb82fe8e741b0534f4.mp3',
    releaseDate: '2001-03-07',
  },
  // Additional demo tracks from other artists
  {
    id: 'track-15',
    title: 'Highway to Nowhere',
    artist: 'The Midnight Riders',
    artistId: 'artist-2',
    album: 'Open Roads',
    albumId: 'album-2',
    duration: 312,
    coverUrl: 'https://images.unsplash.com/photo-1684679106461-dae134df8da6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwYmFuZCUyMGNvbmNlcnR8ZW58MXx8fHwxNzY5OTczMTYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    audioUrl: '',
    releaseDate: '2025-09-20',
  },
  {
    id: 'track-16',
    title: 'Blue Moon Serenade',
    artist: 'Luna Jazz Collective',
    artistId: 'artist-3',
    album: 'Moonlight Sessions',
    albumId: 'album-3',
    duration: 423,
    coverUrl: 'https://images.unsplash.com/photo-1613412140788-9ed674d57c41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXp6JTIwbXVzaWNpYW4lMjBzYXhvcGhvbmV8ZW58MXx8fHwxNzY5OTI1MTQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    audioUrl: '',
    releaseDate: '2025-08-10',
  },
];

// Create albums with tracks
const mockAlbums = [
  {
    id: '302127',
    title: 'Discovery',
    artist: 'Daft Punk',
    artistId: '27',
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    releaseDate: '2001-03-07',
    tracks: mockTracks.filter(t => t.albumId === '302127'),
  },
  {
    id: 'album-2',
    title: 'Open Roads',
    artist: 'The Midnight Riders',
    artistId: 'artist-2',
    coverUrl: 'https://images.unsplash.com/photo-1684679106461-dae134df8da6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwYmFuZCUyMGNvbmNlcnR8ZW58MXx8fHwxNzY5OTczMTYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    releaseDate: '2025-09-20',
    tracks: mockTracks.filter(t => t.albumId === 'album-2'),
  },
  {
    id: 'album-3',
    title: 'Moonlight Sessions',
    artist: 'Luna Jazz Collective',
    artistId: 'artist-3',
    coverUrl: 'https://images.unsplash.com/photo-1613412140788-9ed674d57c41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXp6JTIwbXVzaWNpYW4lMjBzYXhvcGhvbmV8ZW58MXx8fHwxNzY5OTI1MTQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    releaseDate: '2025-08-10',
    tracks: mockTracks.filter(t => t.albumId === 'album-3'),
  },
  {
    id: 'album-4',
    title: 'Urban Chronicles',
    artist: 'Nova',
    artistId: 'artist-4',
    coverUrl: 'https://images.unsplash.com/photo-1718141765361-059d7337f5f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXAlMjBob3AlMjBhcnRpc3QlMjBwb3J0cmFpdHxlbnwxfHx8fDE3Njk5MTQwMjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    releaseDate: '2025-12-01',
    tracks: mockTracks.filter(t => t.albumId === 'album-4'),
  },
  {
    id: 'album-5',
    title: 'Wanderlust',
    artist: 'Echo Valley',
    artistId: 'artist-5',
    coverUrl: 'https://images.unsplash.com/photo-1619378449400-cb8c5bd7b6f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMG11c2ljJTIwYmFuZHxlbnwxfHx8fDE3Njk5NDA5MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    releaseDate: '2025-10-05',
    tracks: mockTracks.filter(t => t.albumId === 'album-5'),
  },
  {
    id: 'album-6',
    title: 'Cosmic Love',
    artist: 'Stella Ray',
    artistId: 'artist-6',
    coverUrl: 'https://images.unsplash.com/photo-1600146698733-a339319d56e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3AlMjBtdXNpYyUyMGNvbmNlcnQlMjBsaWdodHN8ZW58MXx8fHwxNzY5OTczMTYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    releaseDate: '2026-01-15',
    tracks: mockTracks.filter(t => t.albumId === 'album-6'),
  },
];

const mockPlaylists = [
  {
    id: 'playlist-1',
    name: 'Daft Punk Essentials',
    description: 'The best tracks from the legendary electronic duo',
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    tracks: [mockTracks[0], mockTracks[1], mockTracks[2], mockTracks[3], mockTracks[4]],
    isPublic: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'playlist-2',
    name: 'Electronic Vibes',
    description: 'Chill electronic music for focus and relaxation',
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    tracks: [mockTracks[8], mockTracks[9], mockTracks[10], mockTracks[11]],
    isPublic: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'playlist-3',
    name: 'Discovery Complete',
    description: 'The full Discovery album by Daft Punk',
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    tracks: mockTracks.filter(t => t.albumId === '302127'),
    isPublic: true,
    createdAt: '2026-01-05',
  },
  {
    id: 'playlist-4',
    name: 'My Favorites',
    description: 'Your personal collection of liked songs',
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
    tracks: [mockTracks[0], mockTracks[3], mockTracks[8], mockTracks[14], mockTracks[15]],
    isPublic: false,
    createdAt: '2025-11-01',
  },
];

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(limiter);

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Upload routes
app.use('/api/upload', uploadRoutes);

// Spotify API routes (Search and metadata - uses client credentials flow)
app.use('/api/spotify', spotifyRoutes);

// Spotify OAuth routes (User profile -Alternative OAuth implementation)
// app.use('/api/spotify/oauth', spotifyOAuthRoutes);

// YouTube API routes (Music video search and playback)
app.use('/api/youtube', youtubeApiRoutes);

// Helper function to merge mock and uploaded data
const getAllTracks = () => [...mockTracks, ...uploadedTracks];
const getAllAlbums = () => [...mockAlbums, ...uploadedAlbums];
const getAllArtists = () => [...mockArtists, ...uploadedArtists];

// Tracks endpoints
app.get('/api/tracks', asyncHandler(async (req, res) => {
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 100));
  const allTracks = getAllTracks();
  res.json(allTracks);
}));

app.get('/api/tracks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allTracks = getAllTracks();
  const track = allTracks.find(t => t.id === id);
  
  if (!track) {
    return res.status(404).json({ error: 'Track not found' });
  }
  
  res.json(track);
}));

// Albums endpoints
app.get('/api/albums', asyncHandler(async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const allAlbums = getAllAlbums();
  res.json(allAlbums);
}));

app.get('/api/albums/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allAlbums = getAllAlbums();
  const album = allAlbums.find(a => a.id === id);
  
  if (!album) {
    return res.status(404).json({ error: 'Album not found' });
  }
  
  res.json(album);
}));

// Playlists endpoints
app.get('/api/playlists', asyncHandler(async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  res.json(mockPlaylists);
}));

app.get('/api/playlists/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const playlist = mockPlaylists.find(p => p.id === id);
  
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }
  
  res.json(playlist);
}));

// Create playlist
app.post('/api/playlists', asyncHandler(async (req, res) => {
  const { name, description, isPublic = true } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Playlist name is required' });
  }
  
  const newPlaylist = {
    id: `playlist-${Date.now()}`,
    name,
    description: description || '',
    coverUrl: 'https://images.unsplash.com/photo-1616663395403-2e0052b8e595?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbGJ1bSUyMGNvdmVyJTIwbXVzaWMlMjB2aW55bHxlbnwxfHx8fDE3Njk5NzMxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tracks: [],
    isPublic,
    createdAt: new Date().toISOString(),
  };
  
  mockPlaylists.push(newPlaylist);
  res.status(201).json(newPlaylist);
}));

// Update playlist
app.put('/api/playlists/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, isPublic } = req.body;
  
  const playlistIndex = mockPlaylists.findIndex(p => p.id === id);
  
  if (playlistIndex === -1) {
    return res.status(404).json({ error: 'Playlist not found' });
  }
  
  const updatedPlaylist = {
    ...mockPlaylists[playlistIndex],
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(isPublic !== undefined && { isPublic }),
  };
  
  mockPlaylists[playlistIndex] = updatedPlaylist;
  res.json(updatedPlaylist);
}));

// Delete playlist
app.delete('/api/playlists/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const playlistIndex = mockPlaylists.findIndex(p => p.id === id);
  
  if (playlistIndex === -1) {
    return res.status(404).json({ error: 'Playlist not found' });
  }
  
  mockPlaylists.splice(playlistIndex, 1);
  res.status(204).send();
}));

// Artists endpoints
app.get('/api/artists', asyncHandler(async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const allArtists = getAllArtists();
  res.json(allArtists);
}));

app.get('/api/artists/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allArtists = getAllArtists();
  const artist = allArtists.find(a => a.id === id);
  
  if (!artist) {
    return res.status(404).json({ error: 'Artist not found' });
  }
  
  res.json(artist);
}));

// Search endpoint
app.get('/api/search', asyncHandler(async (req, res) => {
  const { q: query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  const lowerQuery = query.toLowerCase();
  const allTracks = getAllTracks();
  const allAlbums = getAllAlbums();
  const allArtists = getAllArtists();
  
  const results = {
    tracks: allTracks.filter(t => 
      t.title.toLowerCase().includes(lowerQuery) ||
      t.artist.toLowerCase().includes(lowerQuery) ||
      t.album.toLowerCase().includes(lowerQuery)
    ),
    albums: allAlbums.filter(a => 
      a.title.toLowerCase().includes(lowerQuery) ||
      a.artist.toLowerCase().includes(lowerQuery)
    ),
    playlists: mockPlaylists.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    ),
    artists: allArtists.filter(a => 
      a.name.toLowerCase().includes(lowerQuery) ||
      a.genres.some(g => g.toLowerCase().includes(lowerQuery))
    ),
  };
  
  res.json(results);
}));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🎵 Music API server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});