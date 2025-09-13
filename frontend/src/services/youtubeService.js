// services/youtubeService.js
// Optional: YouTube API integration for real video search
// Note: This requires YouTube Data API key from Google Cloud Console

class YouTubeService {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.baseURL = 'https://www.googleapis.com/youtube/v3';
  }

  async searchVideos(query, maxResults = 5) {
    if (!this.apiKey) {
      // Fallback to search URLs if no YouTube API key
      return this.generateSearchUrls(query, maxResults);
    }

    try {
      const response = await fetch(
        `${this.baseURL}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${this.apiKey}&relevanceLanguage=en&safeSearch=strict&videoDuration=medium&order=relevance`
      );

      if (!response.ok) {
        throw new Error('YouTube API request failed');
      }

      const data = await response.json();
      
      return data.items.map(item => ({
        title: item.snippet.title,
        channelName: item.snippet.channelTitle,
        summary: item.snippet.description.substring(0, 150) + '...',
        link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        videoId: item.id.videoId,
        thumbnail: item.snippet.thumbnails.medium?.url,
        publishedAt: item.snippet.publishedAt
      }));
    } catch (error) {
      console.error('YouTube API Error:', error);
      return this.generateSearchUrls(query, maxResults);
    }
  }

  generateSearchUrls(topic, count = 5) {
    const educationalChannels = [
      'Khan Academy',
      'Crash Course', 
      'TED-Ed',
      'MIT OpenCourseWare',
      'edX',
      'Coursera',
      'FreeCodeCamp',
      '3Blue1Brown',
      'Veritasium',
      'Kurzgesagt'
    ];

    const searchTerms = [
      `${topic} tutorial`,
      `${topic} explained`,
      `learn ${topic}`,
      `${topic} course`,
      `${topic} basics`,
      `${topic} crash course`,
      `${topic} for beginners`,
      `advanced ${topic}`
    ];

    return searchTerms.slice(0, count).map((term, index) => ({
      title: `${topic} - ${['Complete Tutorial', 'Explained Simply', 'Full Course', 'Crash Course', 'Beginner\'s Guide'][index] || 'Educational Content'}`,
      channelName: educationalChannels[index % educationalChannels.length],
      summary: `High-quality educational content about ${topic} from reputable educational sources.`,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`,
      isSearch: true
    }));
  }

  // Get popular educational channels for a topic
  getEducationalChannelSearch(topic) {
    const channels = [
      { name: 'Khan Academy', query: `${topic} site:youtube.com/user/khanacademy` },
      { name: 'Crash Course', query: `${topic} site:youtube.com/user/crashcourse` },
      { name: 'TED-Ed', query: `${topic} site:youtube.com/user/TEDEducation` },
      { name: 'MIT OpenCourseWare', query: `${topic} site:youtube.com/user/MIT` },
      { name: 'edX', query: `${topic} site:youtube.com/user/edXOnline` }
    ];

    return channels.map((channel, index) => ({
      title: `${topic} by ${channel.name}`,
      channelName: channel.name,
      summary: `Educational content about ${topic} from ${channel.name}.`,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(channel.query)}`,
      isSearch: true
    }));
  }
}

export default YouTubeService;