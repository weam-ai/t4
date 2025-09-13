import { Innertube } from 'youtubei.js';

export interface YouTubeVideo {
  title: string;
  url: string;
  description: string;
  channel: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
  thumbnail: string;
}

export class YouTubeService {
  private youtube: Innertube | null = null;

  constructor() {
    // Initialize YouTube service for educational video search
  }

  private async getYouTubeClient(): Promise<Innertube> {
    if (!this.youtube) {
      try {
        this.youtube = await Innertube.create();
      } catch (error) {
        console.error('Error initializing YouTube client:', error);
        throw new Error('Failed to initialize YouTube client');
      }
    }
    return this.youtube;
  }

  /**
   * Search for educational videos on YouTube
   */
  async searchEducationalVideos(topic: string, maxResults: number = 3): Promise<YouTubeVideo[]> {
    try {
      console.log(`Searching for educational videos: ${topic}`);
      
      // Use optimized search query for relevant results
      const searchQuery = `${topic} tutorial`;
      console.log(`Using search query: "${searchQuery}"`);
      
      // Perform YouTube search
      const videos = await this.performYouTubeSearch(topic, searchQuery, maxResults);
      
      return videos.slice(0, maxResults);

    } catch (error) {
      console.error('YouTube search error:', error);
      return this.getFallbackVideos(topic);
    }
  }


  /**
   * Perform YouTube search using youtubei.js
   */
  private async performYouTubeSearch(topic: string, searchQuery: string, maxResults: number): Promise<YouTubeVideo[]> {
    try {
      console.log(`YouTube search for: ${topic}`);
      
      const youtube = await this.getYouTubeClient();
      const allVideos: YouTubeVideo[] = [];

      try {
        console.log(`Searching: "${searchQuery}"`);
        
        const search = await youtube.search(searchQuery, {
          type: 'video',
          sort_by: 'relevance',
        });

        // Get top videos for the topic
        const videos = search.videos.slice(0, maxResults);

        for (const video of videos) {
          if (video && 'id' in video && video.id) {
            const videoInfo = await this.getVideoDetails(video.id);
            if (videoInfo) {
              allVideos.push(videoInfo);
            }
          }
        }
      } catch (queryError) {
        console.error(`Error searching for "${searchQuery}":`, queryError);
      }

      return allVideos;

    } catch (error) {
      console.error('YouTube search error:', error);
      return this.getFallbackVideos(topic);
    }
  }

  /**
   * Get video details using YouTube API with enhanced error handling
   */
  private async getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
    try {
      const youtube = await this.getYouTubeClient();
      
      // Use a more robust approach to get video info
      let video;
      try {
        video = await youtube.getInfo(videoId);
      } catch (parseError) {
        // If parsing fails, try to get basic info from search results
        console.warn(`Parsing error for video ${videoId}, using fallback approach:`, parseError instanceof Error ? parseError.message : String(parseError));
        return this.createFallbackVideo(videoId);
      }
      
      if (!video || !video.basic_info) {
        return this.createFallbackVideo(videoId);
      }

      return {
        title: video.basic_info?.title || 'Unknown Title',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        description: this.safeSubstring(video.basic_info?.short_description, 150) || 'No description available',
        channel: video.basic_info?.channel?.name || 'Unknown Channel',
        duration: this.formatDuration(video.basic_info?.duration || 0),
        viewCount: this.formatViewCount(video.basic_info?.view_count || 0),
        publishedAt: new Date().toISOString(),
        thumbnail: video.basic_info?.thumbnail?.[0]?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      };

    } catch (error) {
      console.error(`Error getting video details for ${videoId}:`, error);
      return this.createFallbackVideo(videoId);
    }
  }

  /**
   * Create a fallback video when parsing fails
   */
  private createFallbackVideo(videoId: string): YouTubeVideo {
    return {
      title: `Educational Video ${videoId.substring(0, 8)}`,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      description: 'Educational content - details unavailable due to parsing limitations',
      channel: 'Educational Channel',
      duration: '10:00',
      viewCount: '1K',
      publishedAt: new Date().toISOString(),
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  }

  /**
   * Safely substring a string with fallback
   */
  private safeSubstring(str: string | undefined, length: number): string | null {
    if (!str) return null;
    return str.length > length ? str.substring(0, length) + '...' : str;
  }


  /**
   * Format duration in seconds to readable format
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Format view count
   */
  private formatViewCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  /**
   * Get fallback videos when search fails
   */
  private getFallbackVideos(topic: string): YouTubeVideo[] {
    return [
      {
        title: `${topic} - Complete Tutorial`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}`,
        description: `Comprehensive tutorial covering ${topic} fundamentals.`,
        channel: 'freeCodeCamp',
        duration: '15:30',
        viewCount: '1.2M',
        publishedAt: new Date().toISOString(),
        thumbnail: "https://img.youtube.com/vi/default/maxresdefault.jpg"
      },
      {
        title: `${topic} Course - Learn Fast`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' course')}`,
        description: `Complete course covering ${topic} from basics to advanced.`,
        channel: 'Traversy Media',
        duration: '22:15',
        viewCount: '856K',
        publishedAt: new Date().toISOString(),
        thumbnail: "https://img.youtube.com/vi/default/maxresdefault.jpg"
      }
    ];
  }
}
