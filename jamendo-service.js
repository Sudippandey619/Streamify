import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables immediately
dotenv.config({ path: '../.env' });

class JamendoService {
  constructor() {
    this.baseURL = 'https://api.jamendo.com/v3.0';
    // Use JAMENDO_API_KEY or JAMENDO_CLIENT_ID from environment when available.
    // Fallback to the public test client id if not provided.
    this.clientId = process.env.JAMENDO_API_KEY || process.env.JAMENDO_CLIENT_ID || '56d30c95';
  }

  // Make request to Jamendo API
  async jamendoRequest(endpoint, params = {}) {
    const queryParams = new URLSearchParams({
      client_id: this.clientId,
      format: 'json',
      ...params
    });

    const url = `${this.baseURL}${endpoint}?${queryParams.toString()}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Jamendo API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Jamendo API error:', error);
      throw error;
    }
  }

  // Search for tracks
  async searchTracks(query, limit = 20) {
    const data = await this.jamendoRequest('/tracks', {
      search: query,
      limit: limit,
      include: 'musicinfo',
      audioformat: 'mp32', // High quality MP3
      imagesize: 500
    });

    return data.results.map(track => this.formatTrack(track));
  }

  // Get popular tracks
  async getPopularTracks(limit = 20) {
    const data = await this.jamendoRequest('/tracks', {
      order: 'popularity_total',
      limit: limit,
      include: 'musicinfo',
      audioformat: 'mp32',
      imagesize: 500
    });

    return data.results.map(track => this.formatTrack(track));
  }

  // Get tracks by genre
  async getTracksByGenre(genre, limit = 20) {
    const data = await this.jamendoRequest('/tracks', {
      tags: genre,
      limit: limit,
      include: 'musicinfo',
      audioformat: 'mp32',
      imagesize: 500
    });

    return data.results.map(this.formatTrack);
  }

  // Get new releases
  async getNewReleases(limit = 20) {
    const data = await this.jamendoRequest('/tracks', {
      order: 'releasedate_desc',
      limit: limit,
      include: 'musicinfo',
      audioformat: 'mp32',
      imagesize: 500
    });

    return data.results.map(this.formatTrack);
  }

  // Get album details
  async getAlbum(albumId) {
    const albumData = await this.jamendoRequest('/albums', {
      id: albumId,
      include: 'musicinfo',
      imagesize: 500
    });

    if (!albumData.results || albumData.results.length === 0) {
      throw new Error('Album not found');
    }

    const album = albumData.results[0];

    // Get tracks for this album
    const tracksData = await this.jamendoRequest('/tracks', {
      album_id: albumId,
      include: 'musicinfo',
      audioformat: 'mp32',
      imagesize: 500,
      limit: 50
    });

    return this.formatAlbumWithTracks(album, tracksData.results);
  }

  // Get artist details
  async getArtist(artistId) {
    const data = await this.jamendoRequest('/artists', {
      id: artistId,
      imagesize: 500
    });

    if (!data.results || data.results.length === 0) {
      throw new Error('Artist not found');
    }

    return this.formatArtist(data.results[0]);
  }

  // Get artist's tracks
  async getArtistTracks(artistId, limit = 20) {
    const data = await this.jamendoRequest('/tracks', {
      artist_id: artistId,
      limit: limit,
      include: 'musicinfo',
      audioformat: 'mp32',
      imagesize: 500
    });

    return data.results.map(this.formatTrack);
  }

  // Search albums
  async searchAlbums(query, limit = 20) {
    const data = await this.jamendoRequest('/albums', {
      search: query,
      limit: limit,
      imagesize: 500
    });

    return data.results.map(this.formatAlbum);
  }

  // Search artists
  async searchArtists(query, limit = 20) {
    const data = await this.jamendoRequest('/artists', {
      search: query,
      limit: limit,
      imagesize: 500
    });

    return data.results.map(this.formatArtist);
  }

  // Get radio tracks (curated playlists)
  async getRadioTracks(radioId = 'pop', limit = 20) {
    const data = await this.jamendoRequest('/tracks', {
      tags: radioId,
      limit: limit,
      include: 'musicinfo',
      audioformat: 'mp32',
      imagesize: 500,
      order: 'popularity_week'
    });

    return data.results.map(this.formatTrack);
  }

  // Format track data to match our interface
  formatTrack(track) {
    return {
      id: track.id.toString(),
      title: track.name,
      artist: track.artist_name,
      artistId: track.artist_id.toString(),
      album: track.album_name || 'Single',
      albumId: track.album_id?.toString() || '',
      duration: track.duration || 0,
      coverUrl: track.album_image || track.image || '',
      audioUrl: track.audio || track.audiodownload || '', // FULL TRACK, not preview!
      releaseDate: track.releasedate || '',
      popularity: track.popularity || 0,
      license: track.license_ccurl || 'Creative Commons',
      downloadUrl: track.audiodownload || '',
    };
  }

  // Format album data
  formatAlbum(album) {
    return {
      id: album.id.toString(),
      title: album.name,
      artist: album.artist_name,
      artistId: album.artist_id.toString(),
      coverUrl: album.image || '',
      releaseDate: album.releasedate || '',
      totalTracks: album.tracks?.length || 0,
      tracks: [],
    };
  }

  // Format album with tracks
  formatAlbumWithTracks(album, tracks) {
    return {
      id: album.id.toString(),
      title: album.name,
      artist: album.artist_name,
      artistId: album.artist_id.toString(),
      coverUrl: album.image || '',
      releaseDate: album.releasedate || '',
      totalTracks: tracks.length,
      tracks: tracks.map(this.formatTrack),
    };
  }

  // Format artist data
  formatArtist(artist) {
    return {
      id: artist.id.toString(),
      name: artist.name,
      imageUrl: artist.image || '',
      genres: [], // Jamendo doesn't provide genres in artist endpoint
      followers: 0, // Not available
      verified: true, // All Jamendo artists are verified
      website: artist.website || '',
      joindate: artist.joindate || '',
    };
  }
}

export default JamendoService;