// services/openaiService.js (Final Version)
import axios from 'axios';

class OpenAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async generateLearningDocument(topic) {
    try {
      const prompt = `Create a comprehensive, well-structured learning document about "${topic}". 

Use the following format with proper markdown formatting:

# ${topic}: Complete Learning Guide

## 1. Introduction and Overview
- Brief introduction to ${topic}
- Why it's important to learn
- What you'll gain from this guide

## 2. Key Concepts and Definitions
- Essential terminology and definitions
- Core principles and fundamentals
- Important concepts to understand

## 3. Main Topics and Detailed Explanations
- Break down the subject into key areas
- Provide detailed explanations for each area
- Include practical insights and context

## 4. Practical Examples and Applications
- Real-world use cases and scenarios
- Step-by-step examples where applicable
- Common applications in different fields

## 5. Best Practices and Tips
- Industry best practices
- Common mistakes to avoid
- Professional recommendations and tips

## 6. Advanced Concepts (Optional)
- More complex aspects of ${topic}
- Advanced techniques or methods
- Cutting-edge developments

## 7. Summary and Key Takeaways
- Main points to remember
- Essential concepts recap
- Action items for continued learning

## 8. Further Learning Resources
- Recommended books and publications
- Online courses and certifications
- Communities and professional networks

Make it comprehensive (1200-1800 words), educational, and well-formatted with clear headings, bullet points, and proper structure. Focus on practical value and clear explanations.`;

      const response = await this.client.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator and technical writer. Create comprehensive, well-structured learning materials that are practical, engaging, and easy to understand. Use proper markdown formatting and maintain a professional yet accessible tone.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3500,
        temperature: 0.7,
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to generate document');
    }
  }

  async generateVideoRecommendations(topic) {
    try {
      // Create targeted search queries for educational videos
      const educationalQueries = [
        `${topic} tutorial complete course`,
        `${topic} explained crash course`, 
        `learn ${topic} step by step`,
        `${topic} fundamentals basics`,
        `advanced ${topic} techniques`
      ];

      const videos = educationalQueries.map((query, index) => {
        const educationalChannels = [
          'Khan Academy',
          'Crash Course', 
          'FreeCodeCamp',
          'edX',
          'MIT OpenCourseWare',
          'TED-Ed',
          'Coursera',
          '3Blue1Brown',
          'Traversy Media',
          'The Net Ninja'
        ];

        const descriptions = [
          `Comprehensive tutorial covering all aspects of ${topic} from beginner to advanced level.`,
          `Quick but thorough crash course explaining ${topic} concepts in an easy-to-understand way.`,
          `Step-by-step learning path for mastering ${topic} with practical examples and exercises.`,
          `Solid foundation in ${topic} fundamentals with clear explanations and visual aids.`,
          `Advanced techniques and best practices in ${topic} for experienced learners.`
        ];

        return {
          title: this.generateRealisticTitle(topic, index),
          channelName: educationalChannels[index % educationalChannels.length],
          summary: descriptions[index],
          link: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`, // Adds video filter
          searchQuery: query,
          isEducational: true
        };
      });

      return videos;
    } catch (error) {
      console.error('Video recommendations error:', error);
      return this.generateFallbackVideos(topic);
    }
  }

  generateRealisticTitle(topic, index) {
    const titleTemplates = [
      `${topic} - Complete Beginner's Guide`,
      `${topic} Crash Course - Everything You Need to Know`,
      `Learn ${topic} in 2024 - Full Tutorial`,
      `${topic} Fundamentals Explained`,
      `Mastering ${topic} - Advanced Concepts`
    ];

    return titleTemplates[index] || `${topic} - Educational Content`;
  }

  generateFallbackVideos(topic) {
    const fallbackVideos = [
      {
        title: `${topic} - Complete Tutorial for Beginners`,
        channelName: "Programming with Mosh",
        summary: `Comprehensive beginner-friendly tutorial covering all the essentials of ${topic}.`,
        link: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial beginner')}&sp=EgIQAQ%253D%253D`,
        isEducational: true
      },
      {
        title: `${topic} Crash Course - Learn Fast`,
        channelName: "Crash Course",
        summary: `Intensive crash course covering ${topic} fundamentals in a condensed format.`,
        link: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' crash course')}&sp=EgIQAQ%253D%253D`,
        isEducational: true
      },
      {
        title: `${topic} Explained - The Complete Guide`,
        channelName: "TED-Ed",
        summary: `Clear, comprehensive explanation of ${topic} with engaging visualizations.`,
        link: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' explained')}&sp=EgIQAQ%253D%253D`,
        isEducational: true
      },
      {
        title: `Learn ${topic} - Step by Step Course`,
        channelName: "Khan Academy",
        summary: `Structured learning path for ${topic} with step-by-step progression.`,
        link: `https://www.youtube.com/results?search_query=${encodeURIComponent('learn ' + topic)}&sp=EgIQAQ%253D%253D`,
        isEducational: true
      },
      {
        title: `${topic} - Advanced Concepts and Best Practices`,
        channelName: "MIT OpenCourseWare",
        summary: `Advanced level content covering complex ${topic} concepts and industry best practices.`,
        link: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' advanced')}&sp=EgIQAQ%253D%253D`,
        isEducational: true
      }
    ];

    return fallbackVideos;
  }
}

export default OpenAIService;