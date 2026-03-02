import express from 'express';
import axios from 'axios';
import { URLSearchParams } from 'url';

const router = express.Router();

// Spotify OAuth authorization endpoint
router.get('/auth', (req, res) => {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      return res.status(500).json({ error: 'Spotify credentials not configured' });
    }

    const scopes = 'user-read-private user-read-email';
    const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri
    }).toString()}`;

    res.json({ authUrl });
  } catch (error) {
    console.error('Spotify auth error:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Spotify OAuth callback handler
router.post('/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(500).json({ error: 'Spotify credentials not configured' });
    }

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    res.json({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in
    });
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.status(500).json({ error: 'Failed to exchange authorization code', message: error.message });
  }
});

// Search Spotify for tracks
router.get('/search', async (req, res) => {
  try {
    const { q: query, accessToken, type = 'track', limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        q: query,
        type,
        limit
      }
    });

    const results = response.data.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      artists: track.artists.map(a => ({ name: a.name, id: a.id })),
      album: track.album.name,
      albumId: track.album.id,
      image: track.album.images[0]?.url || '',
      duration: Math.floor(track.duration_ms / 1000),
      explicit: track.explicit,
      popularity: track.popularity,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
      uri: track.uri
    }));

    res.json(results);
  } catch (error) {
    console.error('Spotify search error:', error);
    res.status(500).json({ error: 'Failed to search Spotify', message: error.message });
  }
});

// Get current user profile (requires accessToken)
router.get('/me', async (req, res) => {
  try {
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    res.json({
      id: response.data.id,
      email: response.data.email,
      displayName: response.data.display_name,
      image: response.data.images[0]?.url || '',
      followers: response.data.followers.total
    });
  } catch (error) {
    console.error('Spotify user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile', message: error.message });
  }
});

// Get track metadata
router.get('/track/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const track = response.data;
    res.json({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      artists: track.artists.map(a => ({ name: a.name, id: a.id })),
      album: track.album.name,
      image: track.album.images[0]?.url || '',
      duration: Math.floor(track.duration_ms / 1000),
      explicit: track.explicit,
      popularity: track.popularity,
      previewUrl: track.preview_url,
      releaseDate: track.album.release_date
    });
  } catch (error) {
    console.error('Spotify track error:', error);
    res.status(500).json({ error: 'Failed to fetch track metadata', message: error.message });
  }
});

export default router;
