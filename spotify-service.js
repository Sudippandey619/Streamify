import fetch from 'node-fetch';

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get access token using client credentials flow
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env');
    }

    console.log(`🔐 Getting Spotify token with clientId: ${this.clientId.substring(0, 8)}...`);

    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Spotify auth failed: ${response.status}`, errorText.substring(0, 300));
        throw new Error(`Spotify auth failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute early
      console.log(`✅ Got Spotify token, expires in ${data.expires_in}s`);

      return this.accessToken;
    } catch (error) {
      console.error('Spotify authentication error:', error);
      throw error;
    }
  }

  // Make authenticated request to Spotify API
  async spotifyRequest(endpoint) {
    const token = await this.getAccessToken();
    
    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Spotify API error: ${response.status} ${response.statusText}`, errorText.substring(0, 200));
      throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Search for tracks, albums, artists
  async search(query, type = 'track,album,artist', limit = 20) {
    const encodedQuery = encodeURIComponent(query);
    const data = await this.spotifyRequest(`/search?q=${encodedQuery}&type=${type}&limit=${limit}`);
    
    return {
      tracks: data.tracks?.items?.map(this.formatTrack) || [],
      albums: data.albums?.items?.map(this.formatAlbum) || [],
      artists: data.artists?.items?.map(this.formatArtist) || [],
    };
  }

  // Get album details with tracks
  async getAlbum(albumId) {
    const data = await this.spotifyRequest(`/albums/${albumId}`);
    return this.formatAlbumWithTracks(data);
  }

  // Get artist details
  async getArtist(artistId) {
    const data = await this.spotifyRequest(`/artists/${artistId}`);
    return this.formatArtist(data);
  }

  // Get artist's top tracks
  async getArtistTopTracks(artistId, market = 'US') {
    const data = await this.spotifyRequest(`/artists/${artistId}/top-tracks?market=${market}`);
    return data.tracks.map(this.formatTrack);
  }

  // Get featured playlists
  async getFeaturedPlaylists(limit = 20) {
    const data = await this.spotifyRequest(`/browse/featured-playlists?limit=${limit}`);
    return data.playlists.items.map(this.formatPlaylist);
  }

  // Get new releases
  async getNewReleases(limit = 20) {
    const data = await this.spotifyRequest(`/browse/new-releases?limit=${limit}`);
    return data.albums.items.map(this.formatAlbum);
  }

  // Format track data to match our interface
  formatTrack(track) {
    return {
      id: track.id,
      title: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      artistId: track.artists[0]?.id || '',
      album: track.album?.name || 'Unknown Album',
      albumId: track.album?.id || '',
      duration: Math.floor(track.duration_ms / 1000),
      coverUrl: track.album?.images?.[0]?.url || track.images?.[0]?.url || '',
      audioUrl: track.preview_url || '', // 30-second preview
      releaseDate: track.album?.release_date || track.release_date || '',
      popularity: track.popularity || 0,
      explicit: track.explicit || false,
    };
  }

  // Format album data
  formatAlbum(album) {
    return {
      id: album.id,
      title: album.name,
      artist: album.artists[0]?.name || 'Unknown Artist',
      artistId: album.artists[0]?.id || '',
      coverUrl: album.images?.[0]?.url || '',
      releaseDate: album.release_date || '',
      totalTracks: album.total_tracks || 0,
      tracks: album.tracks?.items?.map(track => this.formatTrack({
        ...track,
        album: album // Add album info to track
      })) || [],
    };
  }

  // Format album with full track details
  formatAlbumWithTracks(album) {
    return {
      id: album.id,
      title: album.name,
      artist: album.artists[0]?.name || 'Unknown Artist',
      artistId: album.artists[0]?.id || '',
      coverUrl: album.images?.[0]?.url || '',
      releaseDate: album.release_date || '',
      totalTracks: album.total_tracks || 0,
      tracks: album.tracks.items.map(track => this.formatTrack({
        ...track,
        album: {
          id: album.id,
          name: album.name,
          images: album.images,
          release_date: album.release_date
        }
      })),
    };
  }

  // Format artist data
  formatArtist(artist) {
    return {
      id: artist.id,
      name: artist.name,
      imageUrl: artist.images?.[0]?.url || '',
      genres: artist.genres || [],
      followers: artist.followers?.total || 0,
      popularity: artist.popularity || 0,
      verified: artist.followers?.total > 100000, // Consider popular artists as "verified"
    };
  }

  // Format playlist data
  formatPlaylist(playlist) {
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description || '',
      coverUrl: playlist.images?.[0]?.url || '',
      tracks: [], // Would need separate call to get tracks
      isPublic: playlist.public || false,
      createdAt: playlist.created_at || new Date().toISOString(),
      owner: playlist.owner?.display_name || 'Spotify',
    };
  }

  // Get recommendations based on seed data
  async getRecommendations(seedArtists = [], seedTracks = [], seedGenres = [], limit = 20) {
    const params = new URLSearchParams();
    if (seedArtists.length) params.append('seed_artists', seedArtists.join(','));
    if (seedTracks.length) params.append('seed_tracks', seedTracks.join(','));
    if (seedGenres.length) params.append('seed_genres', seedGenres.join(','));
    params.append('limit', limit.toString());

    const data = await this.spotifyRequest(`/recommendations?${params.toString()}`);
    return data.tracks.map(this.formatTrack);
  }
}

export default SpotifyService;