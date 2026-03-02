import { Track, Album, Playlist, Artist } from '@/types/music';

/**
 * API service layer for music streaming application
 * Makes HTTP requests to the backend API server
 */

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// HTTP client with error handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// Tracks API
export const fetchTracks = async (): Promise<Track[]> => {
  return apiClient.get<Track[]>('/tracks');
};

export const fetchTrackById = async (id: string): Promise<Track | null> => {
  try {
    return await apiClient.get<Track>(`/tracks/${id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
};

// Albums API
export const fetchAlbums = async (): Promise<Album[]> => {
  return apiClient.get<Album[]>('/albums');
};

export const fetchAlbumById = async (id: string): Promise<Album | null> => {
  try {
    return await apiClient.get<Album>(`/albums/${id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
};

// Playlists API
export const fetchPlaylists = async (): Promise<Playlist[]> => {
  return apiClient.get<Playlist[]>('/playlists');
};

export const fetchPlaylistById = async (id: string): Promise<Playlist | null> => {
  try {
    return await apiClient.get<Playlist>(`/playlists/${id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
};

export const createPlaylist = async (data: {
  name: string;
  description?: string;
  isPublic?: boolean;
}): Promise<Playlist> => {
  return apiClient.post<Playlist>('/playlists', data);
};

export const updatePlaylist = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    isPublic?: boolean;
  }
): Promise<Playlist> => {
  return apiClient.put<Playlist>(`/playlists/${id}`, data);
};

export const deletePlaylist = async (id: string): Promise<void> => {
  return apiClient.delete<void>(`/playlists/${id}`);
};

// Artists API
export const fetchArtists = async (): Promise<Artist[]> => {
  return apiClient.get<Artist[]>('/artists');
};

export const fetchArtistById = async (id: string): Promise<Artist | null> => {
  try {
    return await apiClient.get<Artist>(`/artists/${id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
};

// Search API
export interface SearchResults {
  tracks: Track[];
  albums: Album[];
  playlists: Playlist[];
  artists: Artist[];
}

export const searchContent = async (query: string): Promise<SearchResults> => {
  if (!query.trim()) {
    return {
      tracks: [],
      albums: [],
      playlists: [],
      artists: [],
    };
  }
  
  try {
    // Search via YouTube API for music videos
    const youtubeResults = await apiClient.get<{
      videos: any[];
    }>(`/youtube/search?q=${encodeURIComponent(query)}&maxResults=20`);
    
    // Convert YouTube videos to Track format
    const tracks: Track[] = (youtubeResults.videos || []).map((video: any) => ({
      id: video.id || video.youtubeVideoId,
      title: video.title,
      artist: video.artist,
      album: '',
      duration: 0,
      image: video.image,
      youtubeVideoId: video.youtubeVideoId,
      embedUrl: video.embedUrl,
      popularity: 0
    }));

    return {
      tracks,
      albums: [],
      playlists: [],
      artists: [],
    };
  } catch (error) {
    console.warn('YouTube search failed:', error);
    
    // Fallback to local search
    return apiClient.get<SearchResults>(`/search?q=${encodeURIComponent(query)}`);
  }
};

// Audius-specific API functions (FREE - Decentralized streaming!)
export const searchAudius = async (query: string, limit = 20) => {
  return apiClient.get(`/audius/search?q=${encodeURIComponent(query)}&limit=${limit}`);
};

export const getAudiusTrending = async (limit = 20) => {
  return apiClient.get(`/audius/trending?limit=${limit}`);
};

export const getAudiusByGenre = async (genre: string, limit = 20) => {
  return apiClient.get(`/audius/genre/${genre}?limit=${limit}`);
};

export const testAudiusConnection = async () => {
  return apiClient.get('/audius/test');
};

// Spotify-specific API functions (Premium music catalog with OAuth)
export const spotifySearch = async (query: string, type = 'track,album,artist', limit = 20) => {
  return apiClient.get(`/spotify/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
};

export const spotifySearchTracks = async (query: string, limit = 20) => {
  return apiClient.get(`/spotify/search/tracks?q=${encodeURIComponent(query)}&limit=${limit}`);
};

export const spotifySearchArtists = async (query: string, limit = 20) => {
  return apiClient.get(`/spotify/search/artists?q=${encodeURIComponent(query)}&limit=${limit}`);
};

export const getSpotifyAlbum = async (albumId: string) => {
  return apiClient.get(`/spotify/albums/${albumId}`);
};

export const getSpotifyArtist = async (artistId: string) => {
  return apiClient.get(`/spotify/artists/${artistId}`);
};

export const getSpotifyArtistTopTracks = async (artistId: string, market = 'US') => {
  return apiClient.get(`/spotify/artists/${artistId}/top-tracks?market=${market}`);
};

export const getSpotifyFeaturedPlaylists = async (limit = 20) => {
  return apiClient.get(`/spotify/browse/featured-playlists?limit=${limit}`);
};

export const getSpotifyNewReleases = async (limit = 20) => {
  return apiClient.get(`/spotify/browse/new-releases?limit=${limit}`);
};

export const getSpotifyRecommendations = async (
  seedArtists: string[] = [],
  seedTracks: string[] = [],
  seedGenres: string[] = [],
  limit = 20
) => {
  const params = new URLSearchParams();
  if (seedArtists.length) params.append('seed_artists', seedArtists.join(','));
  if (seedTracks.length) params.append('seed_tracks', seedTracks.join(','));
  if (seedGenres.length) params.append('seed_genres', seedGenres.join(','));
  params.append('limit', limit.toString());
  
  return apiClient.get(`/spotify/recommendations?${params.toString()}`);
};

// YouTube-specific API functions (Music video search & embedded playback)
export const youtubeSearchTrack = async (track: string, artist?: string, limit = 5) => {
  const query = artist ? `${track} ${artist}` : track;
  return apiClient.get(`/youtube/search?q=${encodeURIComponent(query)}&limit=${limit}`);
};

export const youtubeSearchVideos = async (query: string, limit = 20) => {
  return apiClient.get(`/youtube/search?q=${encodeURIComponent(query)}&limit=${limit}`);
};

export const getYoutubeVideoDetails = async (videoId: string) => {
  return apiClient.get(`/youtube/video/${videoId}`);
};

export const testSpotifyConnection = async () => {
  return apiClient.get('/spotify/test');
};

export const testYoutubeConnection = async () => {
  return apiClient.get('/youtube/test');
};
