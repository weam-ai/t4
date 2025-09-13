import OpenAI from 'openai';
import { HttpStatus } from '../../enums';
import { ApiError } from '../../utils/ApiError';
import { OptimizedYouTubeService, YouTubeVideo } from './optimized-youtube.service';

export interface LLMResourceResponse {
  topic: string;
  summary: string;
  resources: {
    documentation: Array<{
      title: string;
      url: string;
      description: string;
      source: string;
    }>;
    youtube: Array<{
      title: string;
      url: string;
      description: string;
      channel: string;
      duration?: string;
      viewCount?: string;
      publishedAt?: string;
      thumbnail?: string;
    }>;
    googleLinks: Array<{
      title: string;
      url: string;
      description: string;
      searchQuery: string;
    }>;
  };
  learningPath: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
  };
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export class OpenAIService {
  private openai: OpenAI;
  private apiKey: string;
  private optimizedYouTubeService: OptimizedYouTubeService;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new ApiError(
        HttpStatus.SERVER_ERROR,
        'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.'
      );
    }
    this.openai = new OpenAI({
      apiKey: this.apiKey,
    });
    this.optimizedYouTubeService = new OptimizedYouTubeService();
  }

  /**
   * Generate comprehensive learning resources using OpenAI
   */
  async generateLearningResources(topic: string): Promise<LLMResourceResponse> {
    try {
      // Get real YouTube videos using optimized service
      console.log(`🚀 Using optimized service to fetch YouTube videos for topic: ${topic}`);
      const youtubeVideos = await this.optimizedYouTubeService.searchEducationalVideos(topic, 5);
      
      const prompt = this.createResourceGenerationPrompt(topic, youtubeVideos);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert educational content curator and learning path designer. Your task is to provide comprehensive, high-quality learning resources for any given topic. You should focus on:

1. **Accuracy**: Provide only real, existing, and high-quality resources
2. **Diversity**: Include various types of learning materials (documentation, videos, courses, etc.)
3. **Progression**: Structure resources from beginner to advanced levels
4. **Relevance**: Ensure all resources are directly related to the topic
5. **Quality**: Prioritize well-known, reputable sources

IMPORTANT: You must respond with ONLY valid JSON in the exact format specified. Do not include any text before or after the JSON.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500, // Reduced tokens for faster response
        temperature: 0.3 // Lower temperature for faster, more consistent responses
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new ApiError(HttpStatus.SERVER_ERROR, 'Failed to generate learning resources');
      }

      // Extract JSON from response (in case AI includes extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw response:', response);
        console.error('Extracted JSON:', jsonString);
        
        // Try to fix common JSON issues
        const fixedJson = this.fixCommonJsonIssues(jsonString);
        try {
          parsedResponse = JSON.parse(fixedJson);
        } catch (secondError) {
          console.error('Failed to fix JSON:', secondError);
          console.error('Attempting to create fallback response...');
          
          // Create a fallback response structure with real YouTube videos
          const fallbackResponse = {
            topic: topic,
            summary: `Learn about ${topic} with our comprehensive resources. This topic covers important concepts and practical applications that will help you build your skills and knowledge.`,
            resources: {
              documentation: [
                {
                  title: `${topic} Documentation`,
                  url: `https://developer.mozilla.org/en-US/docs/Web`,
                  description: `Official documentation for ${topic}`,
                  source: "Mozilla Developer Network"
                },
                {
                  title: `${topic} Guide`,
                  url: `https://www.google.com/search?q=${encodeURIComponent(topic + ' documentation')}`,
                  description: `Search for ${topic} documentation and guides`,
                  source: "Google Search"
                }
              ],
              youtube: youtubeVideos, // Use real YouTube videos
              googleLinks: [
                {
                  title: `${topic} Learning Resources`,
                  url: `https://www.google.com/search?q=${encodeURIComponent(topic + ' learn tutorial')}`,
                  description: `Find comprehensive learning resources for ${topic}`,
                  searchQuery: `${topic} learn tutorial`
                }
              ]
            },
            learningPath: {
              beginner: [`Learn ${topic} basics`, `Practice with simple examples`, `Build your first ${topic} project`],
              intermediate: [`Explore advanced ${topic} concepts`, `Work on real-world projects`, `Join ${topic} communities`],
              advanced: [`Master advanced ${topic} techniques`, `Contribute to open source`, `Teach others about ${topic}`]
            },
            estimatedTime: "2-4 weeks",
            difficulty: "Intermediate"
          };
          
          return this.validateAndEnhanceResponse(fallbackResponse, topic);
        }
      }
      
      // Replace AI-generated YouTube videos with real ones
      parsedResponse.resources.youtube = youtubeVideos;
      
      return this.validateAndEnhanceResponse(parsedResponse, topic);

    } catch (error) {
      console.error('OpenAI API Error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        HttpStatus.SERVER_ERROR,
        'Failed to generate learning resources using AI',
        [error instanceof Error ? error.message : 'Unknown error']
      );
    }
  }

  /**
   * Create a comprehensive prompt for resource generation
   */
  private createResourceGenerationPrompt(topic: string, youtubeVideos: YouTubeVideo[]): string {
    const youtubeInfo = youtubeVideos.length > 0 
      ? `\n\nNOTE: Real YouTube videos have been found for this topic:\n${youtubeVideos.map(v => `- ${v.title} by ${v.channel} (${v.duration})`).join('\n')}\nThese will be automatically included in the response.`
      : '';

    return `Generate comprehensive learning resources for the topic: "${topic}"${youtubeInfo}

CRITICAL: You must respond with ONLY valid JSON. No explanations, no markdown, no code blocks. Just pure JSON.

Required JSON structure:
{
  "topic": "${topic}",
  "summary": "A comprehensive 2-3 paragraph summary explaining what ${topic} is, why it's important, and what learners will gain from studying it.",
  "resources": {
    "documentation": [
      {
        "title": "Resource Title",
        "url": "https://example.com",
        "description": "Brief description of what this resource covers",
        "source": "Organization/Website name"
      }
    ],
    "youtube": [
      {
        "title": "Video Title",
        "url": "https://youtube.com/watch?v=...",
        "description": "What this video teaches",
        "channel": "Channel Name",
        "duration": "X:XX"
      }
    ],
    "googleLinks": [
      {
        "title": "Search Result Title",
        "url": "https://google.com/search?q=...",
        "description": "What this search will help find",
        "searchQuery": "specific search terms"
      }
    ]
  },
  "learningPath": {
    "beginner": ["Step 1", "Step 2", "Step 3"],
    "intermediate": ["Step 1", "Step 2", "Step 3"],
    "advanced": ["Step 1", "Step 2", "Step 3"]
  },
  "estimatedTime": "X weeks/months",
  "difficulty": "Beginner|Intermediate|Advanced"
}

Requirements:
1. Provide 5-8 documentation links from official sources, well-known educational sites, or reputable organizations
2. Focus on creating comprehensive documentation and Google search resources (YouTube videos will be provided automatically)
3. Create 5-8 Google search queries that would help learners find additional resources
4. Create a logical learning path with 3 steps each for beginner, intermediate, and advanced levels
5. Estimate realistic learning time
6. Assess the overall difficulty level
7. Ensure all URLs are properly formatted and realistic
8. Focus on current, up-to-date resources (2023-2024 when possible)
9. Use only double quotes for strings
10. Escape any quotes within string values
11. Ensure proper JSON syntax with no trailing commas

RESPOND WITH ONLY THE JSON OBJECT - NO OTHER TEXT.`;
  }

  /**
   * Validate and enhance the AI response
   */
  private validateAndEnhanceResponse(response: any, topic: string): LLMResourceResponse {
    // Basic validation
    if (!response.topic || !response.summary || !response.resources) {
      throw new ApiError(HttpStatus.SERVER_ERROR, 'Invalid response format from AI service');
    }

    // Ensure arrays exist and have minimum items
    const enhancedResponse: LLMResourceResponse = {
      topic: response.topic || topic,
      summary: response.summary || `Comprehensive learning resources for ${topic}`,
      resources: {
        documentation: this.enhanceDocumentationLinks(response.resources.documentation || []),
        youtube: this.enhanceYouTubeLinks(response.resources.youtube || []),
        googleLinks: this.enhanceGoogleLinks(response.resources.googleLinks || [], topic),
      },
      learningPath: response.learningPath || {
        beginner: ['Start with basics', 'Practice fundamentals', 'Build simple projects'],
        intermediate: ['Explore advanced concepts', 'Work on real projects', 'Join communities'],
        advanced: ['Master advanced topics', 'Contribute to open source', 'Teach others']
      },
      estimatedTime: response.estimatedTime || '2-4 weeks',
      difficulty: response.difficulty || 'Intermediate'
    };

    return enhancedResponse;
  }

  /**
   * Enhance documentation links with fallbacks
   */
  private enhanceDocumentationLinks(docs: any[]): Array<{title: string; url: string; description: string; source: string}> {
    const enhancedDocs = docs.slice(0, 8); // Limit to 8 items
    
    // Add fallback documentation if needed
    if (enhancedDocs.length < 3) {
      enhancedDocs.push(
        {
          title: "Official Documentation",
          url: "https://developer.mozilla.org",
          description: "Comprehensive web development documentation",
          source: "Mozilla Developer Network"
        },
        {
          title: "Stack Overflow",
          url: "https://stackoverflow.com",
          description: "Community-driven Q&A for developers",
          source: "Stack Overflow"
        }
      );
    }

    return enhancedDocs;
  }

  /**
   * Enhance YouTube links with fallbacks
   */
  private enhanceYouTubeLinks(videos: any[]): Array<{title: string; url: string; description: string; channel: string; duration?: string}> {
    const enhancedVideos = videos.slice(0, 8); // Limit to 8 items
    
    // Add fallback videos if needed
    if (enhancedVideos.length < 3) {
      enhancedVideos.push(
        {
          title: "Educational Content",
          url: "https://www.youtube.com/results?search_query=programming+tutorial",
          description: "Search for programming tutorials and courses",
          channel: "Various Educational Channels",
          duration: "Varies"
        }
      );
    }

    return enhancedVideos;
  }

  /**
   * Enhance Google search links
   */
  private enhanceGoogleLinks(links: any[], topic: string): Array<{title: string; url: string; description: string; searchQuery: string}> {
    const enhancedLinks = links.slice(0, 8); // Limit to 8 items
    
    // Add fallback searches if needed
    if (enhancedLinks.length < 3) {
      enhancedLinks.push(
        {
          title: `${topic} Tutorial`,
          url: `https://www.google.com/search?q=${encodeURIComponent(topic + ' tutorial')}`,
          description: `Find comprehensive tutorials about ${topic}`,
          searchQuery: `${topic} tutorial`
        },
        {
          title: `${topic} Best Practices`,
          url: `https://www.google.com/search?q=${encodeURIComponent(topic + ' best practices')}`,
          description: `Learn industry best practices for ${topic}`,
          searchQuery: `${topic} best practices`
        }
      );
    }

    return enhancedLinks;
  }

  /**
   * Fix common JSON formatting issues from AI responses
   */
  private fixCommonJsonIssues(jsonString: string): string {
    let fixed = jsonString;
    
    // Remove any text before the first {
    const firstBrace = fixed.indexOf('{');
    if (firstBrace > 0) {
      fixed = fixed.substring(firstBrace);
    }
    
    // Remove any text after the last }
    const lastBrace = fixed.lastIndexOf('}');
    if (lastBrace > 0 && lastBrace < fixed.length - 1) {
      fixed = fixed.substring(0, lastBrace + 1);
    }
    
    // Fix common issues:
    // 1. Remove trailing commas
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    
    // 2. Fix unescaped quotes in strings
    fixed = fixed.replace(/([^\\])"([^"]*)"([^,}\]:])/g, '$1\\"$2\\"$3');
    
    // 3. Fix missing quotes around property names
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    
    // 4. Fix single quotes to double quotes
    fixed = fixed.replace(/'/g, '"');
    
    // 5. Fix newlines in strings
    fixed = fixed.replace(/\n/g, '\\n');
    fixed = fixed.replace(/\r/g, '\\r');
    fixed = fixed.replace(/\t/g, '\\t');
    
    return fixed;
  }

  /**
   * Generate a learning summary using AI
   */
  async generateLearningSummary(topic: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator. Create concise, engaging summaries that explain complex topics in simple terms. Focus on practical value and real-world applications.'
          },
          {
            role: 'user',
            content: `Create a comprehensive 2-3 paragraph summary about "${topic}". Explain what it is, why it's important, and what learners will gain from studying it. Make it engaging and informative.`
          }
        ],
        max_tokens: 500,
        temperature: 0.3 // Lower temperature for faster, more consistent responses
      });

      return completion.choices[0]?.message?.content || `Learn about ${topic} with our comprehensive resources.`;
    } catch (error) {
      console.error('Error generating summary:', error);
      return `Learn about ${topic} with our comprehensive resources.`;
    }
  }
}
