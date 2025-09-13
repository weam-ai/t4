import { google } from 'googleapis';

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
  private youtube: any;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('YouTube API key not configured. YouTube integration will use fallback data.');
    }
    
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.apiKey,
    });
  }

  /**
   * Search for educational videos on YouTube
   */
  async searchEducationalVideos(topic: string, maxResults: number = 8): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      return this.getFallbackVideos(topic);
    }

    try {
      const searchQueries = this.generateSearchQueries(topic);
      const allVideos: YouTubeVideo[] = [];

      // Search with multiple queries to get diverse results
      for (const query of searchQueries.slice(0, 3)) { // Limit to 3 queries to avoid rate limits
        const videos = await this.searchVideos(query, Math.ceil(maxResults / 3));
        allVideos.push(...videos);
      }

      // Remove duplicates and sort by relevance
      const uniqueVideos = this.removeDuplicateVideos(allVideos);
      return uniqueVideos.slice(0, maxResults);

    } catch (error) {
      console.error('YouTube API Error:', error);
      return this.getFallbackVideos(topic);
    }
  }

  /**
   * Search for videos with a specific query
   */
  private async searchVideos(query: string, maxResults: number): Promise<YouTubeVideo[]> {
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        maxResults: maxResults,
        order: 'relevance',
        videoDuration: 'medium', // 4-20 minutes
        videoDefinition: 'high',
        videoEmbeddable: true,
        safeSearch: 'moderate',
      });

      if (!response.data.items || response.data.items.length === 0) {
        return [];
      }

      // Get video details for duration and view count
      const videoIds = response.data.items.map((item: any) => item.id.videoId).join(',');
      const videoDetails = await this.youtube.videos.list({
        part: ['contentDetails', 'statistics'],
        id: videoIds,
      });

      return response.data.items.map((item: any, index: number) => {
        const details = videoDetails.data.items?.[index];
        return {
          title: item.snippet.title,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          description: item.snippet.description.substring(0, 200) + '...',
          channel: item.snippet.channelTitle,
          duration: this.formatDuration(details?.contentDetails?.duration || 'PT0S'),
          viewCount: this.formatViewCount(details?.statistics?.viewCount || '0'),
          publishedAt: item.snippet.publishedAt,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        };
      });

    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  }

  /**
   * Generate multiple search queries for better results
   */
  private generateSearchQueries(topic: string): string[] {
    const baseQueries = [
      `${topic} tutorial`,
      `${topic} course`,
      `${topic} explained`,
      `learn ${topic}`,
      `${topic} for beginners`,
      `${topic} crash course`,
      `${topic} complete guide`,
      `${topic} fundamentals`,
    ];

    // Add educational channel specific queries
    const educationalChannels = [
      'freeCodeCamp',
      'Traversy Media',
      'The Net Ninja',
      'Programming with Mosh',
      'Academind',
      'Coding Tech',
      'TechWorld with Nana',
      'Web Dev Simplified',
    ];

    const channelQueries = educationalChannels.map(channel => 
      `${topic} ${channel}`
    );

    return [...baseQueries, ...channelQueries];
  }

  /**
   * Remove duplicate videos based on video ID
   */
  private removeDuplicateVideos(videos: YouTubeVideo[]): YouTubeVideo[] {
    const seen = new Set();
    return videos.filter(video => {
      const videoId = video.url.split('v=')[1]?.split('&')[0];
      if (seen.has(videoId)) {
        return false;
      }
      seen.add(videoId);
      return true;
    });
  }

  /**
   * Format YouTube duration (PT4M13S -> 4:13)
   */
  private formatDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format view count (1234567 -> 1.2M)
   */
  private formatViewCount(viewCount: string): string {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  /**
   * Get fallback videos when YouTube API is not available
   */
  private getFallbackVideos(topic: string): YouTubeVideo[] {
    const fallbackVideos: YouTubeVideo[] = [
      {
        title: `${topic} - Complete Tutorial for Beginners`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial beginner')}`,
        description: `Comprehensive beginner-friendly tutorial covering all the essentials of ${topic}.`,
        channel: "Educational Channels",
        duration: "Varies",
        viewCount: "High",
        publishedAt: new Date().toISOString(),
        thumbnail: "https://img.youtube.com/vi/default/maxresdefault.jpg"
      },
      {
        title: `${topic} Crash Course - Learn Fast`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' crash course')}`,
        description: `Intensive crash course covering ${topic} fundamentals in a condensed format.`,
        channel: "Educational Channels",
        duration: "Varies",
        viewCount: "High",
        publishedAt: new Date().toISOString(),
        thumbnail: "https://img.youtube.com/vi/default/maxresdefault.jpg"
      },
      {
        title: `${topic} Explained - The Complete Guide`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' explained')}`,
        description: `Clear, comprehensive explanation of ${topic} with engaging visualizations.`,
        channel: "Educational Channels",
        duration: "Varies",
        viewCount: "High",
        publishedAt: new Date().toISOString(),
        thumbnail: "https://img.youtube.com/vi/default/maxresdefault.jpg"
      },
      {
        title: `Learn ${topic} - Step by Step Course`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent('learn ' + topic)}`,
        description: `Structured learning path for ${topic} with step-by-step progression.`,
        channel: "Educational Channels",
        duration: "Varies",
        viewCount: "High",
        publishedAt: new Date().toISOString(),
        thumbnail: "https://img.youtube.com/vi/default/maxresdefault.jpg"
      },
      {
        title: `${topic} - Advanced Concepts and Best Practices`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' advanced')}`,
        description: `Advanced level content covering complex ${topic} concepts and industry best practices.`,
        channel: "Educational Channels",
        duration: "Varies",
        viewCount: "High",
        publishedAt: new Date().toISOString(),
        thumbnail: "https://img.youtube.com/vi/default/maxresdefault.jpg"
      }
    ];

    return fallbackVideos;
  }
}
