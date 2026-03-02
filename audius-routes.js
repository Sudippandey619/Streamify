import express from 'express';
import { AudiusService } from './audius-service.js';

const router = express.Router();
const audius = new AudiusService();

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Test connection
router.get('/test', asyncHandler(async (req, res) => {
  const result = await audius.testConnection();
  res.json(result);
}));

// Search endpoint
router.get('/search', asyncHandler(async (req, res) => {
  const { q: query, limit = 20 } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const [tracks, artists] = await Promise.all([
      audius.searchTracks(query, Math.min(parseInt(limit), 20)).catch(e => { console.error('searchTracks error:', e); return []; }),
      audius.searchArtists(query, Math.min(parseInt(limit), 10)).catch(e => { console.error('searchArtists error:', e); return []; })
    ]);

    res.json({ tracks, albums: [], artists });
  } catch (error) {
    console.error('Audius combined search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
}));

// Get trending tracks
router.get('/trending', asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  
  try {
    const tracks = await audius.getTrendingTracks(parseInt(limit));
    res.json(tracks);
  } catch (error) {
    console.error('Audius trending error:', error);
    res.status(500).json({ error: 'Failed to fetch trending tracks', message: error.message });
  }
}));

// Get tracks by genre
router.get('/genre/:genre', asyncHandler(async (req, res) => {
  const { genre } = req.params;
  const { limit = 20 } = req.query;
  
  try {
    const tracks = await audius.getTracksByGenre(genre, parseInt(limit));
    res.json(tracks);
  } catch (error) {
    console.error('Audius genre error:', error);
    res.status(500).json({ error: 'Failed to fetch genre tracks', message: error.message });
  }
}));

// Similar tracks (using trending as fallback)
router.get('/similar', asyncHandler(async (req, res) => {
  try {
    const tracks = await audius.getTrendingTracks(20);
    res.json(tracks);
  } catch (error) {
    console.error('Audius similar error:', error);
    res.status(500).json({ error: 'Failed to fetch similar tracks', message: error.message });
  }
}));

export { router as audiusRoutes };
