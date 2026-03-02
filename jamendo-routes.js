import express from 'express';
import JamendoService from './jamendo-service.js';

const router = express.Router();
const jamendo = new JamendoService();

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Search tracks
router.get('/search/tracks', asyncHandler(async (req, res) => {
  const { q: query, limit = 20 } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const tracks = await jamendo.searchTracks(query, parseInt(limit));
    res.json(tracks);
  } catch (error) {
    console.error('Jamendo search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
}));

// Search albums
router.get('/search/albums', asyncHandler(async (req, res) => {
  const { q: query, limit = 20 } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const albums = await jamendo.searchAlbums(query, parseInt(limit));
    res.json(albums);
  } catch (error) {
    console.error('Jamendo album search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
}));

// Search artists
router.get('/search/artists', asyncHandler(async (req, res) => {
  const { q: query, limit = 20 } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const artists = await jamendo.searchArtists(query, parseInt(limit));
    res.json(artists);
  } catch (error) {
    console.error('Jamendo artist search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
}));

// Combined search
router.get('/search', asyncHandler(async (req, res) => {
  const { q: query, limit = 20 } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const [tracks, albums, artists] = await Promise.all([
      jamendo.searchTracks(query, Math.min(parseInt(limit), 10)).catch(e => { console.error('[search] searchTracks error:', e); return []; }),
      jamendo.searchAlbums(query, Math.min(parseInt(limit), 10)).catch(e => { console.error('[search] searchAlbums error:', e); return []; }),
      jamendo.searchArtists(query, Math.min(parseInt(limit), 10)).catch(e => { console.error('[search] searchArtists error:', e); return []; })
    ]);

    res.json({ tracks, albums, artists });
  } catch (error) {
    console.error('Jamendo combined search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
}));

// Get popular tracks
router.get('/popular', asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  
  try {
    const tracks = await jamendo.getPopularTracks(parseInt(limit));
    res.json(tracks);
  } catch (error) {
    console.error('Jamendo popular tracks error:', error);
    res.status(500).json({ error: 'Failed to fetch popular tracks', message: error.message });
  }
}));

// Get new releases
router.get('/new-releases', asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  
  try {
    const tracks = await jamendo.getNewReleases(parseInt(limit));
    res.json(tracks);
  } catch (error) {
    console.error('Jamendo new releases error:', error);
    res.status(500).json({ error: 'Failed to fetch new releases', message: error.message });
  }
}));

// Get tracks by genre
router.get('/genre/:genre', asyncHandler(async (req, res) => {
  const { genre } = req.params;
  const { limit = 20 } = req.query;
  
  try {
    const tracks = await jamendo.getTracksByGenre(genre, parseInt(limit));
    res.json(tracks);
  } catch (error) {
    console.error('Jamendo genre tracks error:', error);
    res.status(500).json({ error: 'Failed to fetch tracks', message: error.message });
  }
}));

// Get album details
router.get('/album/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const album = await jamendo.getAlbum(id);
    res.json(album);
  } catch (error) {
    console.error('Jamendo album error:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Album not found' });
    }
    res.status(500).json({ error: 'Failed to fetch album', message: error.message });
  }
}));

// Get artist details
router.get('/artist/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const artist = await jamendo.getArtist(id);
    res.json(artist);
  } catch (error) {
    console.error('Jamendo artist error:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    res.status(500).json({ error: 'Failed to fetch artist', message: error.message });
  }
}));

// Get artist's tracks
router.get('/artist/:id/tracks', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 20 } = req.query;
  
  try {
    const tracks = await jamendo.getArtistTracks(id, parseInt(limit));
    res.json(tracks);
  } catch (error) {
    console.error('Jamendo artist tracks error:', error);
    res.status(500).json({ error: 'Failed to fetch artist tracks', message: error.message });
  }
}));

// Get radio/playlist tracks
router.get('/radio/:genre', asyncHandler(async (req, res) => {
  const { genre } = req.params;
  const { limit = 20 } = req.query;
  
  try {
    const tracks = await jamendo.getRadioTracks(genre, parseInt(limit));
    res.json(tracks);
  } catch (error) {
    console.error('Jamendo radio error:', error);
    res.status(500).json({ error: 'Failed to fetch radio tracks', message: error.message });
  }
}));

// Test endpoint
router.get('/test', asyncHandler(async (req, res) => {
  try {
    const tracks = await jamendo.getPopularTracks(1);
    res.json({ 
      status: 'Connected to Jamendo API',
      hasData: tracks.length > 0,
      sampleTrack: tracks[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Jamendo test error:', error);
    res.status(500).json({ 
      status: 'Failed to connect to Jamendo API',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

export { router as jamendoRoutes };