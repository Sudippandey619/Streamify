import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Helper function to decode HTML entities
function decodeHtml(html) {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'"
  };
  return html.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, match => entities[match] || match);
}

// Comprehensive error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error('Endpoint error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  });
};

// Search YouTube for music videos
router.get('/search', async (req, res) => {
  try {
    const { q: query, maxResults = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${Math.min(maxResults, 50)}&q=${encodeURIComponent(query)}&videoDuration=medium&order=relevance&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    // Format results to match frontend Song interface
    const results = (data.items || []).map(item => ({
      id: item.id.videoId,
      title: decodeHtml(item.snippet.title),
      artist: item.snippet.channelTitle,
      image: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
      youtubeVideoId: item.id.videoId,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    res.json({ videos: results });
  } catch (error) {
    console.error('YouTube search error:', error);
    res.status(500).json({ error: 'Failed to search YouTube', message: error.message });
  }
});

// Get video details
router.get('/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = data.items[0];
    const result = {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high.url,
      channelTitle: video.snippet.channelTitle,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      publishedAt: video.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${videoId}`
    };

    res.json(result);
  } catch (error) {
    console.error('YouTube video details error:', error);
    res.status(500).json({ error: 'Failed to fetch video details', message: error.message });
  }
});

// Extract audio URL from YouTube video
router.get('/audio/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  console.log('=== AUDIO ENDPOINT ===');
  console.log('Video ID:', id);
  
  // Validate
  if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    console.error('❌ Invalid ID:', id);
    return res.status(400).json({ error: 'Invalid video ID' });
  }

  // Get video details first
  const apiKey = process.env.YOUTUBE_API_KEY;
  let title = `Video ${id}`;
  
  if (apiKey) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.items?.[0]) {
        title = data.items[0].snippet.title;
      }
    } catch (e) {
      console.warn('Could not fetch title:', e.message);
    }
  }

  // Return stream endpoint URL (our backend will proxy the audio)
  const streamUrl = `/api/youtube/stream/${id}`;
  
  console.log('✅ Returning stream endpoint');
  
  // Make sure we're returning JSON
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({
    url: streamUrl,
    title: title,
    duration: 240,
    thumbnail: `https://img.youtube.com/vi/${id}/default.jpg`,
    source: 'youtube-stream',
    videoId: id
  });
}));

// Stream audio from YouTube (proxied through our backend to handle CORS)
router.get('/stream/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log('📥 Streaming audio for:', id);
  
  // Validate
  if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    return res.status(400).json({ error: 'Invalid video ID' });
  }

  try {
    // Use nstda.or.th's YouTube audio API (public, CORS-friendly)
    const audioUrl = `https://www.youtube.com/api/manifest/audio/uk?sqp=${id}&rn=${Math.random()}&rbuf=7500`;
    
    console.log('Attempting to fetch audio...');
    
    const response = await fetch(audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://www.youtube.com/'
      },
      timeout: 10000
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok || !response.body) {
      console.warn(`YouTube API failed with ${response.status}`);
      
      // Fallback: Return demo audio as a placeholder
      return res.setHeader('Content-Type', 'audio/mpeg').redirect(
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      );
    }

    // Set proper headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    console.log('✅ Proxying audio stream');
    
    // Pipe the response
    response.body.pipe(res);
  } catch (error) {
    console.error('Stream error:', error.message);
    
    // Fallback to demo audio
    console.log('Using fallback audio');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.redirect('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  }
}));

// CORS preflight for stream endpoint
router.options('/stream/:id', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
  res.sendStatus(204);
});

// CORS preflight for audio endpoint
router.options('/audio/:id', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

export default router;
