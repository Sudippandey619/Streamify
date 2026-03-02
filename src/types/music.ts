export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
  // Optional YouTube integration
  youtubeVideoId?: string;
  embedUrl?: string;
  releaseDate: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverUrl: string;
  releaseDate: string;
  tracks: Track[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  tracks: Track[];
  isPublic: boolean;
  createdAt: string;
}

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  genres: string[];
  followers: number;
  verified: boolean;
}
