import fetch from 'node-fetch';

class YouTubeService {
  constructor() {
    this.baseURL = 'https://www.googleapis.com/youtube/v3';
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
  }

  // Search for videos
  async searchVideos(query, limit = 20) {
    if (!this.apiKey) {
      console.warn('YouTube API key not configured');
      return [];
    }

    try {
      const url = new URL(`${this.baseURL}/search`);
      url.searchParams.append('q', query);
      url.searchParams.append('type', 'video');
      url.searchParams.append('maxResults', Math.min(limit, 50));
      url.searchParams.append('key', this.apiKey);
      url.searchParams.append('part', 'snippet');
      url.searchParams.append('videoDuration', 'medium'); // 4-20 minutes songs typically

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        console.error('YouTube search error:', response.status);
        return [];
      }

      const data = await response.json();

      return (data.items || [])
        .filter(item => this.isValidMusicVideo(item))
        .map(item => ({
          id: item.id.videoId,
          title: this.decodeHtml(item.snippet.title),
          artist: this.extractArtist(item.snippet.title),
          thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
        }));
    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  }

  // Check if video is likely a music video
  isValidMusicVideo(item) {
    const title = item.snippet.title.toLowerCase();
    const channel = item.snippet.channelTitle.toLowerCase();
    
    // Filter out non-music content
    const badKeywords = ['tutorial', 'review', 'gameplay', 'vlog', 'podcast', 'podcast', 'live stream'];
    const goodKeywords = ['music', 'official', 'lyrics', 'audio', 'full'];
    
    if (badKeywords.some(k => title.includes(k) || channel.includes(k))) {
      return false;
    }
    
    return true;
  }

  // Decode HTML entities
  decodeHtml(html) {
    const entities = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'"
    };
    
    return html.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, match => entities[match] || match);
  }

  // Extract artist from title (common pattern: "Artist - Song")
  extractArtist(title) {
    const match = title.match(/^(.+?)\s*[-–]\s*(.+)/);
    if (match) {
      return match[1].trim();
    }
    return 'Unknown Artist';
  }

  // Get video details
  async getVideoDetails(videoId) {
    if (!this.apiKey) {
      return null;
    }

    try {
      const url = new URL(`${this.baseURL}/videos`);
      url.searchParams.append('id', videoId);
      url.searchParams.append('part', 'snippet,statistics,contentDetails');
      url.searchParams.append('key', this.apiKey);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const video = data.items?.[0];

      if (!video) return null;

      return {
        id: videoId,
        title: this.decodeHtml(video.snippet.title),
        description: video.snippet.description,
        duration: this.parseDuration(video.contentDetails.duration),
        viewCount: video.statistics.viewCount,
        likeCount: video.statistics.likeCount,
        thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url || '',
        embedUrl: `https://www.youtube.com/embed/${videoId}`
      };
    } catch (error) {
      console.error('YouTube details error:', error);
      return null;
    }
  }

  // Parse ISO 8601 duration to seconds
  parseDuration(duration) {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(regex);
    
    const hours = parseInt(matches?.[1] || 0, 10);
    const minutes = parseInt(matches?.[2] || 0, 10);
    const seconds = parseInt(matches?.[3] || 0, 10);
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Test connection
  async testConnection() {
    if (!this.apiKey) {
      return {
        status: 'YouTube API key not configured',
        hasData: false
      };
    }

    try {
      const results = await this.searchVideos('music', 1);
      return {
        status: 'Connected to YouTube API',
        hasData: results.length > 0
      };
    } catch (error) {
      return {
        status: 'Failed to connect to YouTube API',
        hasData: false
      };
    }
  }
}

export { YouTubeService };
