import fetch from 'node-fetch';

class AudiusService {
  constructor() {
    this.baseURL = 'https://api.audius.co/v1';
    this.bearerToken = process.env.AUDIUS_BEARER_TOKEN || '';
  }

  async audiusRequest(endpoint, params = {}) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.baseURL}${endpoint}?${queryParams.toString()}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Audius API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Audius API error:', error);
      throw error;
    }
  }

  // Search for tracks
  async searchTracks(query, limit = 20) {
    try {
      const data = await this.audiusRequest('/tracks/search', {
        query: query,
        limit: limit
      });

      return (data.data || []).map(track => this.formatTrack(track));
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  // Get trending tracks
  async getTrendingTracks(limit = 20) {
    try {
      const data = await this.audiusRequest('/tracks/trending', {
        limit: limit,
        time: 'week'
      });

      return (data.data || []).map(track => this.formatTrack(track));
    } catch (error) {
      console.error('Trending error:', error);
      return [];
    }
  }

  // Get tracks by genre/mood
  async getTracksByGenre(genre, limit = 20) {
    try {
      const data = await this.audiusRequest('/tracks/search', {
        query: genre,
        limit: limit
      });

      return (data.data || []).map(track => this.formatTrack(track));
    } catch (error) {
      console.error('Genre error:', error);
      return [];
    }
  }

  // Search for artists
  async searchArtists(query, limit = 20) {
    try {
      const data = await this.audiusRequest('/users/search', {
        query: query,
        limit: limit
      });

      return (data.data || []).map(artist => ({
        id: artist.id,
        name: artist.name,
        imageUrl: artist.profile_picture_sizes ? artist.profile_picture_sizes[0] : '',
        verified: artist.is_verified,
        followers: artist.follower_count || 0
      }));
    } catch (error) {
      console.error('Artist search error:', error);
      return [];
    }
  }

  // Format track response
  formatTrack(track) {
    return {
      id: track.id,
      title: track.title,
      artist: track.user?.name || 'Unknown Artist',
      artistId: track.user?.id || '',
      album: track.album_name || track.title,
      albumId: track.id,
      duration: Math.floor((track.duration || 0) / 1000), // Convert ms to seconds
      coverUrl: track.artwork?.['480x480'] || track.artwork?.['150x150'] || '',
      audioUrl: track.preview_url || '',
      releaseDate: track.created_at?.split('T')[0] || '',
      popularity: track.play_count || 0,
      license: 'Audius Artist License',
      downloadUrl: track.download?.cid ? `https://audius.co/artist/${track.user?.handle}/${track.slug}` : ''
    };
  }

  async testConnection() {
    try {
      const data = await this.audiusRequest('/tracks/trending', { limit: 1 });
      return {
        status: 'Connected to Audius API',
        hasData: data.data && data.data.length > 0
      };
    } catch (error) {
      return {
        status: 'Failed to connect to Audius API',
        hasData: false
      };
    }
  }
}

export { AudiusService };
