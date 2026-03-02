import express from 'express';
import { YouTubeService } from './youtube-service.js';
import ytdl from 'ytdl-core';

const router = express.Router();
const youtube = new YouTubeService();

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Search for music videos
router.get('/search', asyncHandler(async (req, res) => {
  const { q: query, limit = 20 } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const results = await youtube.searchVideos(query, parseInt(limit));
    res.json(results);
  } catch (error) {
    console.error('YouTube search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
}));

// Get video details
router.get('/video/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const video = await youtube.getVideoDetails(id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json(video);
  } catch (error) {
    console.error('YouTube details error:', error);
    res.status(500).json({ error: 'Failed to fetch video details', message: error.message });
  }
}));

// Search for track + artist (returns best match)
router.get('/search-track', asyncHandler(async (req, res) => {
  const { track, artist, limit = 5 } = req.query;
  
  if (!track) {
    return res.status(400).json({ error: 'Track parameter required' });
  }

  try {
    const query = artist ? `${track} ${artist}` : track;
    const results = await youtube.searchVideos(query, parseInt(limit));
    
    if (results.length === 0) {
      return res.json({ message: 'No videos found', results: [] });
    }
    
    res.json(results[0]); // Return best match
  } catch (error) {
    console.error('YouTube track search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
}));

// Get audio URL from YouTube video
router.get('/audio/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Validate video ID format
    if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) {
      return res.status(400).json({ error: 'Invalid YouTube video ID' });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${id}`;
    console.log('Extracting audio from:', videoUrl);

    // Get info with filters for audio-only formats
    const info = await ytdl.getInfo(videoUrl);
    
    // Find audio-only format with best quality
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly')
      .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));

    if (audioFormats.length === 0) {
      // Fallback: get audio from video+audio format
      const allFormats = ytdl.filterFormats(info.formats, 'audioandvideo')
        .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));
      
      if (allFormats.length === 0) {
        return res.status(404).json({ error: 'No audio formats found' });
      }

      const audioUrl = allFormats[0].url;
      return res.json({
        url: audioUrl,
        title: info.videoDetails.title,
        duration: parseInt(info.videoDetails.lengthSeconds),
        thumbnail: info.videoDetails.thumbnail.thumbnails[0]?.url || ''
      });
    }

    const audioUrl = audioFormats[0].url;
    console.log('Audio URL extracted:', audioUrl.substring(0, 100) + '...');

    res.json({
      url: audioUrl,
      title: info.videoDetails.title,
      duration: parseInt(info.videoDetails.lengthSeconds),
      thumbnail: info.videoDetails.thumbnail.thumbnails[0]?.url || ''
    });
  } catch (error) {
    console.error('Audio extraction error:', error.message);
    res.status(500).json({
      error: 'Failed to extract audio',
      message: error.message
    });
  }
}));

// Test YouTube connection
router.get('/test', asyncHandler(async (req, res) => {
  try {
    const result = await youtube.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'Failed to test YouTube connection',
      error: error.message
    });
  }
}));

export default router;
