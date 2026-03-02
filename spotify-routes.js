import express from 'express';
import SpotifyService from './spotify-service.js';

const router = express.Router();
let spotify = null;

// Lazy initialize SpotifyService on first use
function getSpotifyService() {
  if (!spotify) {
    spotify = new SpotifyService();
  }
  return spotify;
}

// Mock tracks for fallback when Spotify API fails - in Spotify API format
const FALLBACK_TRACKS = [
  {
    id: '3135553',
    name: 'One More Time',
    artists: [{ name: 'Daft Punk', id: '27' }],
    album: { 
      name: 'Discovery',
      images: [{ url: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg' }]
    },
    duration_ms: 320000,
    preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/f/8/c/0/f8c5dc3837912dba37c9a1ab3170cc3f.mp3',
    popularity: 85,
  },
  {
    id: '3135554',
    name: 'Aerodynamic',
    artists: [{ name: 'Daft Punk', id: '27' }],
    album: { 
      name: 'Discovery',
      images: [{ url: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg' }]
    },
    duration_ms: 212000,
    preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/6/9/9/0/699d41611cf0280f0a55c8ba4a372c14.mp3',
    popularity: 82,
  },
  {
    id: '3135556',
    name: 'Harder, Better, Faster, Stronger',
    artists: [{ name: 'Daft Punk', id: '27' }],
    album: { 
      name: 'Discovery',
      images: [{ url: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg' }]
    },
    duration_ms: 226000,
    preview_url: 'https://cdnt-preview.dzcdn.net/api/1/1/6/a/2/0/6a2c0a5670afe821e08fc5154909534a.mp3',
    popularity: 87,
  },
];

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Search endpoint
router.get('/search', asyncHandler(async (req, res) => {
  const { q: query, type = 'track,album,artist', limit = 20 } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const results = await getSpotifyService().search(query, type, parseInt(limit));
    res.json(results);
  } catch (error) {
    console.warn('⚠️  Spotify search failed, using fallback demo data:', error.message);
    // Return demo/fallback data when Spotify API fails
    res.json({
      tracks: FALLBACK_TRACKS,
      albums: [],
      artists: [],
      note: 'Using demo data - Spotify API temporarily unavailable'
    });
  }
}));

// Get album details
router.get('/album/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const album = await getSpotifyService().getAlbum(id);
    res.json(album);
  } catch (error) {
    console.error('Spotify album error:', error);
    if (error.message.includes('404')) {
      return res.status(404).json({ error: 'Album not found' });
    }
    res.status(500).json({ error: 'Failed to fetch album', message: error.message });
  }
}));

// Get artist details
router.get('/artist/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const artist = await getSpotifyService().getArtist(id);
    res.json(artist);
  } catch (error) {
    console.error('Spotify artist error:', error);
    if (error.message.includes('404')) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    res.status(500).json({ error: 'Failed to fetch artist', message: error.message });
  }
}));

// Get artist's top tracks
router.get('/artist/:id/top-tracks', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { market = 'US' } = req.query;
  
  try {
    const tracks = await getSpotifyService().getArtistTopTracks(id, market);
    res.json(tracks);
  } catch (error) {
    console.error('Spotify top tracks error:', error);
    res.status(500).json({ error: 'Failed to fetch top tracks', message: error.message });
  }
}));

// Get featured playlists
router.get('/featured-playlists', asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  
  try {
    const playlists = await getSpotifyService().getFeaturedPlaylists(parseInt(limit));
    res.json(playlists);
  } catch (error) {
    console.error('Spotify featured playlists error:', error);
    res.status(500).json({ error: 'Failed to fetch playlists', message: error.message });
  }
}));

// Get new releases
router.get('/new-releases', asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  
  try {
    const albums = await getSpotifyService().getNewReleases(parseInt(limit));
    res.json(albums);
  } catch (error) {
    console.error('Spotify new releases error:', error);
    res.status(500).json({ error: 'Failed to fetch new releases', message: error.message });
  }
}));

// Get recommendations
router.get('/recommendations', asyncHandler(async (req, res) => {
  const { 
    seed_artists = '', 
    seed_tracks = '', 
    seed_genres = '', 
    limit = 20 
  } = req.query;
  
  try {
    const seedArtists = seed_artists ? seed_artists.split(',') : [];
    const seedTracks = seed_tracks ? seed_tracks.split(',') : [];
    const seedGenres = seed_genres ? seed_genres.split(',') : [];
    
    if (seedArtists.length + seedTracks.length + seedGenres.length === 0) {
      // Default seeds for demo
      const recommendations = await getSpotifyService().getRecommendations(
        [], [], ['pop', 'rock'], parseInt(limit)
      );
      return res.json(recommendations);
    }
    
    const recommendations = await getSpotifyService().getRecommendations(
      seedArtists, seedTracks, seedGenres, parseInt(limit)
    );
    res.json(recommendations);
  } catch (error) {
    console.error('Spotify recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations', message: error.message });
  }
}));

// Get popular tracks (using search for popular songs)
router.get('/popular', asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  
  try {
    // Search for popular tracks using common terms
    const results = await getSpotifyService().search('year:2023-2024', 'track', parseInt(limit));
    res.json(results.tracks);
  } catch (error) {
    console.error('Spotify popular tracks error:', error);
    res.status(500).json({ error: 'Failed to fetch popular tracks', message: error.message });
  }
}));

// Test Spotify connection
router.get('/test', asyncHandler(async (req, res) => {
  try {
    const token = await getSpotifyService().getAccessToken();
    res.json({ 
      status: 'Connected to Spotify API',
      hasToken: !!token,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Spotify test error:', error);
    res.status(500).json({ 
      status: 'Failed to connect to Spotify API',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

export default router;
