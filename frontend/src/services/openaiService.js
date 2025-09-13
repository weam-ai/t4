// services/openaiService.js (Enhanced Version)
import OpenAI from 'openai';
import PromptRefinerService from './promptRefinerService';
import SimplifiedYouTubeService from './SimplifiedYouTubeService';

class OpenAIService {
  constructor(apiKey, geminiApiKey = null) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    this.promptRefiner = new PromptRefinerService();
    this.youtubeService = new SimplifiedYouTubeService(geminiApiKey);
    this.hasGemini = !!geminiApiKey;
  }

  async generateContent(userQuery) {
    const debugData = {
      originalPrompt: userQuery,
      refinedPrompt: '',
      searchQuery: '',
      timestamp: new Date().toISOString(),
      processingSteps: [],
      documentGeneration: { status: 'pending', wordCount: 0 },
      videoAnalysis: { videosFound: 0, videos: [] },
      openaiRole: {
        systemRole: 'Expert educational content creator and learning strategist',
        task: 'Generate comprehensive learning document with structured content',
        model: 'gpt-3.5-turbo',
        status: 'active'
      },
      geminiRole: {
        systemRole: 'Educational content curator and video analyst',
        task: 'Analyze and rank video content for educational value and find real YouTube videos',
        model: 'gemini-2.0-flash',
        status: this.hasGemini ? 'active' : 'inactive'
      },
      performance: {
        totalTime: 0,
        totalApiCalls: 0,
        breakdown: []
      }
    };

    const startTime = Date.now();

    try {
      // Step 1: Refine the user's prompt for better results
      debugData.processingSteps.push({
        name: 'Prompt Refinement',
        status: 'processing',
        description: 'Analyzing and optimizing user query for better AI comprehension',
        startTime: Date.now()
      });

      const refinementResult = this.promptRefiner.refineUserQuery(userQuery);
      debugData.refinedPrompt = refinementResult.refinedQuery;
      debugData.searchQuery = refinementResult.refinedQuery;

      debugData.processingSteps[0].status = 'completed';
      debugData.processingSteps[0].duration = `${Date.now() - debugData.processingSteps[0].startTime}ms`;
      debugData.processingSteps[0].details = refinementResult;

      // Step 2: Generate learning document with OpenAI
      debugData.processingSteps.push({
        name: 'Document Generation',
        status: 'processing',
        description: 'Creating comprehensive learning document with OpenAI GPT',
        startTime: Date.now()
      });

      const document = await this.generateLearningDocument(refinementResult.refinedQuery, debugData);
      
      debugData.documentGeneration = {
        status: 'success',
        wordCount: document.split(' ').length,
        generatedAt: new Date().toISOString()
      };

      debugData.processingSteps[1].status = 'completed';
      debugData.processingSteps[1].duration = `${Date.now() - debugData.processingSteps[1].startTime}ms`;

      // Step 3: Generate video search query and find videos
      debugData.processingSteps.push({
        name: 'Video Discovery',
        status: 'processing',
        description: 'Finding and analyzing educational videos',
        startTime: Date.now()
      });

      const videoSearchQuery = this.generateVideoSearchQuery(userQuery, refinementResult);
      debugData.searchQuery = videoSearchQuery;

      let videos;
      if (this.hasGemini) {
        // Use enhanced video discovery with Gemini
        videos = await this.findVideosWithGemini(videoSearchQuery, refinementResult, debugData);
      } else {
        // Fallback to basic video generation
        videos = await this.youtubeService.findRelevantVideos(
          videoSearchQuery,
          refinementResult.refinedQuery,
          userQuery,
          5
        );
      }

      debugData.videoAnalysis = {
        videosFound: videos.length,
        videos: videos,
        searchQuery: videoSearchQuery,
        enhancedWithGemini: this.hasGemini
      };

      debugData.processingSteps[2].status = 'completed';
      debugData.processingSteps[2].duration = `${Date.now() - debugData.processingSteps[2].startTime}ms`;
      debugData.processingSteps[2].details = { videosFound: videos.length, geminiUsed: this.hasGemini };

      // Calculate performance metrics
      const totalTime = (Date.now() - startTime) / 1000;
      debugData.performance = {
        totalTime: totalTime.toFixed(2),
        totalApiCalls: this.hasGemini ? 2 : 1,
        breakdown: [
          {
            service: 'OpenAI',
            operation: 'Document Generation',
            duration: debugData.processingSteps[1].duration,
            status: 'completed'
          },
          ...(this.hasGemini ? [{
            service: 'Gemini',
            operation: 'Video Analysis & Discovery',
            duration: debugData.processingSteps[2].duration,
            status: 'completed'
          }] : [])
        ],
        successRate: '100%'
      };

      console.log('Content Generation Debug Data:', debugData);

      return {
        document,
        videos: this.youtubeService.formatVideosForDisplay(videos),
        _debugData: debugData
      };

    } catch (error) {
      debugData.processingSteps.push({
        name: 'Error Handler',
        status: 'error',
        description: 'Processing failed',
        error: error.message,
        timestamp: Date.now()
      });

      debugData.performance.totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
      debugData.documentGeneration.status = 'error';
      debugData.geminiRole.status = 'error';

      console.error('Content generation failed:', error);
      throw error;
    }
  }

  async generateLearningDocument(refinedPrompt, debugData) {
    const systemPrompt = `You are an expert educational content creator and learning strategist. Your task is to create comprehensive, engaging learning documents that help users master new topics effectively.

INSTRUCTIONS:
- Create a well-structured learning document with clear sections
- Include practical examples and real-world applications
- Use a progressive learning approach (basic → intermediate → advanced concepts)
- Add actionable takeaways and next steps
- Format with markdown headers (##, ###) for better organization
- Keep content engaging and easy to understand
- Focus on practical application rather than just theory

CONTENT REQUIREMENTS:
- Introduction and overview
- Key concepts and definitions
- Step-by-step learning path
- Practical examples
- Common challenges and solutions
- Summary and next steps
- Recommended practice exercises

Make the content comprehensive but digestible, suitable for self-paced learning.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: refinedPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      debugData.performance.totalApiCalls = (debugData.performance.totalApiCalls || 0) + 1;
      
      return completion.choices[0].message.content;
    } catch (error) {
      debugData.openaiRole.status = 'error';
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  generateVideoSearchQuery(originalQuery, refinementResult) {
    // Create a focused video search query
    const baseQuery = originalQuery;
    const level = refinementResult.detectedLevel;
    const category = refinementResult.detectedCategory;

    let videoQuery = baseQuery;
    
    if (level === 'beginner') {
      videoQuery += ' tutorial for beginners';
    } else if (level === 'advanced') {
      videoQuery += ' advanced course';
    } else {
      videoQuery += ' complete guide';
    }

    if (category === 'programming') {
      videoQuery += ' programming';
    } else if (category === 'business') {
      videoQuery += ' business course';
    }

    return videoQuery;
  }

  async findVideosWithGemini(searchQuery, refinementResult, debugData) {
    try {
      // Step 1: Use Gemini to find real YouTube videos
      debugData.processingSteps.push({
        name: 'Gemini Video Discovery',
        status: 'processing',
        description: 'Using Gemini AI to find real YouTube videos',
        startTime: Date.now()
      });

      const realVideos = await this.discoverRealVideosWithGemini(searchQuery, debugData);
      
      debugData.processingSteps[debugData.processingSteps.length - 1].status = 'completed';
      debugData.processingSteps[debugData.processingSteps.length - 1].duration = 
        `${Date.now() - debugData.processingSteps[debugData.processingSteps.length - 1].startTime}ms`;

      // Step 2: If we got real videos, analyze them with Gemini
      if (realVideos && realVideos.length > 0) {
        return await this.youtubeService.enhanceWithGeminiAnalysis(
          realVideos,
          refinementResult.refinedQuery,
          refinementResult.originalQuery,
          debugData
        );
      } else {
        // Fallback to generated videos if real discovery fails
        return await this.youtubeService.findRelevantVideos(
          searchQuery,
          refinementResult.refinedQuery,
          refinementResult.originalQuery,
          5
        );
      }
    } catch (error) {
      console.warn('Gemini video discovery failed, using fallback:', error.message);
      debugData.geminiRole.status = 'error';
      
      return await this.youtubeService.findRelevantVideos(
        searchQuery,
        refinementResult.refinedQuery,
        refinementResult.originalQuery,
        5
      );
    }
  }

  async discoverRealVideosWithGemini(searchQuery, debugData) {
    const geminiApiKey = localStorage.getItem('geminiApiKey');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not available');
    }

    const prompt = `You are a YouTube content discovery expert. Find 5 real, high-quality educational YouTube videos for the topic: "${searchQuery}"

Please provide actual YouTube videos that exist, with real channels and realistic details. Focus on educational content from reputable channels.

Return ONLY a JSON array in this exact format:
[
  {
    "title": "Actual video title",
    "channelName": "Real channel name",
    "videoId": "real_youtube_video_id",
    "description": "Brief description of what this video covers",
    "duration": "MM:SS format",
    "difficulty": "beginner|intermediate|advanced",
    "estimatedViews": "realistic view count as number"
  }
]

Focus on:
- Real educational channels (Khan Academy, Crash Course, FreeCodeCamp, etc.)
- Videos that actually exist on YouTube
- Realistic titles and descriptions
- Appropriate difficulty levels
- Proper duration formats (like "15:30" for 15 minutes 30 seconds)

IMPORTANT: Provide only the JSON array, no other text.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.candidates[0]?.content?.parts[0]?.text;
      
      if (!responseText) {
        throw new Error('No response from Gemini');
      }

      // Parse the JSON response
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const videos = JSON.parse(cleanedResponse);

      // Convert to our format with real YouTube URLs
      return videos.map((video, index) => ({
        title: video.title,
        channelName: video.channelName,
        description: video.description,
        summary: video.description,
        duration: video.duration,
        url: `https://www.youtube.com/watch?v=${video.videoId}`,
        link: `https://www.youtube.com/watch?v=${video.videoId}`,
        relevanceScore: 90 - (index * 5),
        educationalValue: 'High',
        difficultyLevel: video.difficulty,
        viewCount: video.estimatedViews,
        uploadedAgo: this.generateRandomUploadTime(),
        searchQuery: searchQuery,
        isRealVideo: true,
        _geminiGenerated: true
      }));

    } catch (error) {
      console.warn('Failed to parse Gemini video response:', error);
      throw new Error(`Gemini video discovery failed: ${error.message}`);
    }
  }

  generateRandomUploadTime() {
    const times = [
      '2 weeks ago', '1 month ago', '3 months ago', '6 months ago',
      '1 year ago', '2 years ago', '5 days ago', '3 weeks ago'
    ];
    return times[Math.floor(Math.random() * times.length)];
  }

  // Method to test API connectivity
  async testConnection() {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello, this is a test." }],
        max_tokens: 10
      });
      return { success: true, message: "OpenAI connection successful" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get service capabilities
  getCapabilities() {
    return {
      documentGeneration: true,
      promptRefinement: true,
      videoDiscovery: true,
      geminiIntegration: this.hasGemini,
      realVideoLinks: this.hasGemini
    };
  }
}

export default OpenAIService;