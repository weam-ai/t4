import { OpenAIService } from '../../llms/openai.service';

export interface LearningResource {
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
  learningPath?: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
  };
  estimatedTime?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export class LearningContentService {
  private static openaiService: OpenAIService | null = null;

  /**
   * Generate learning resources for a given topic using AI
   * Falls back to placeholder data if AI service is unavailable
   */
  static async generateLearningResources(
    topic: string
  ): Promise<LearningResource> {
    try {
      // Try to use AI service first
      if (!this.openaiService) {
        this.openaiService = new OpenAIService();
      }

      const aiResponse = await this.openaiService.generateLearningResources(topic);
      
      // Convert AI response to our interface format
      return {
        topic: aiResponse.topic,
        summary: aiResponse.summary,
        resources: {
          documentation: aiResponse.resources.documentation,
          youtube: aiResponse.resources.youtube,
          googleLinks: aiResponse.resources.googleLinks,
        },
        learningPath: aiResponse.learningPath,
        estimatedTime: aiResponse.estimatedTime,
        difficulty: aiResponse.difficulty,
      };

    } catch (error) {
      console.warn('AI service unavailable, falling back to placeholder data:', error);
      
      // Fallback to placeholder data if AI service fails
      return this.generateFallbackResources(topic);
    }
  }

  /**
   * Fallback method that generates placeholder data
   * Used when AI service is unavailable
   */
  private static async generateFallbackResources(topic: string): Promise<LearningResource> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const topicLower = topic.toLowerCase();

    // Generate contextual resources based on topic keywords
    const documentation = this.generateDocumentation(topicLower);
    const youtube = this.generateYouTubeLinks(topicLower);
    const googleLinks = this.generateGoogleLinks(topicLower);

    return {
      topic,
      summary: this.generateSummary(topic),
      resources: {
        documentation: documentation.map(url => ({
          title: `${topic} Documentation`,
          url,
          description: `Official documentation for ${topic}`,
          source: 'Official Source'
        })),
        youtube: youtube.map(url => ({
          title: `${topic} Tutorial`,
          url,
          description: `Educational video about ${topic}`,
          channel: 'Educational Channel',
          duration: '10:00'
        })),
        googleLinks: googleLinks.map(url => ({
          title: `${topic} Search`,
          url,
          description: `Search for ${topic} resources`,
          searchQuery: topic
        })),
      },
      learningPath: {
        beginner: ['Learn basics', 'Practice fundamentals', 'Build simple projects'],
        intermediate: ['Explore advanced concepts', 'Work on real projects', 'Join communities'],
        advanced: ['Master advanced topics', 'Contribute to open source', 'Teach others']
      },
      estimatedTime: '2-4 weeks',
      difficulty: 'Intermediate'
    };
  }

  private static generateSummary(topic: string): string {
    const summaries = {
      javascript: `${topic} is a versatile programming language used for web development, both on the client and server side. It's essential for modern web applications and offers powerful features like asynchronous programming, object-oriented programming, and functional programming paradigms.`,
      react: `${topic} is a popular JavaScript library for building user interfaces, particularly web applications. It uses a component-based architecture and virtual DOM for efficient rendering and state management.`,
      nodejs: `${topic} is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows developers to run JavaScript on the server side, enabling full-stack JavaScript development.`,
      python: `${topic} is a high-level, interpreted programming language known for its simplicity and readability. It's widely used in web development, data science, artificial intelligence, and automation.`,
      typescript: `${topic} is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. It adds static type definitions to JavaScript, making code more maintainable and less error-prone.`,
      mongodb: `${topic} is a NoSQL document database that provides high performance, high availability, and easy scalability. It works on the concept of collections and documents, making it flexible for various data structures.`,
      default: `${topic} is an important topic in modern software development. Understanding this concept will help you build better applications and advance your programming skills. This comprehensive guide covers the fundamentals, best practices, and practical applications.`,
    };

    // Find matching summary or use default
    const matchingKey = Object.keys(summaries).find((key) =>
      topic.toLowerCase().includes(key)
    );

    return (
      summaries[matchingKey as keyof typeof summaries] || summaries.default
    );
  }

  private static generateDocumentation(topic: string): string[] {
    const baseDocs = [
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      "https://reactjs.org/docs/getting-started.html",
      "https://nodejs.org/en/docs/",
      "https://docs.python.org/3/",
      "https://www.typescriptlang.org/docs/",
      "https://docs.mongodb.com/",
    ];

    const topicSpecificDocs = {
      javascript: [
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
        "https://javascript.info/",
        "https://eloquentjavascript.net/",
      ],
      react: [
        "https://reactjs.org/tutorial/tutorial.html",
        "https://react.dev/learn",
        "https://legacy.reactjs.org/docs/hooks-intro.html",
      ],
      nodejs: [
        "https://nodejs.org/en/learn/",
        "https://expressjs.com/en/guide/routing.html",
        "https://www.freecodecamp.org/news/node-js-tutorial/",
      ],
      python: [
        "https://docs.python.org/3/tutorial/",
        "https://realpython.com/",
        "https://www.python.org/about/gettingstarted/",
      ],
      typescript: [
        "https://www.typescriptlang.org/docs/handbook/intro.html",
        "https://typescript-eslint.io/getting-started/",
        "https://basarat.gitbook.io/typescript/",
      ],
      mongodb: [
        "https://docs.mongodb.com/manual/",
        "https://university.mongodb.com/",
        "https://www.mongodb.com/developer/",
      ],
    };

    const matchingDocs = Object.entries(topicSpecificDocs).find(([key]) =>
      topic.includes(key)
    );

    return matchingDocs ? matchingDocs[1] : baseDocs.slice(0, 3);
  }

  private static generateYouTubeLinks(topic: string): string[] {
    const baseVideos = [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://www.youtube.com/watch?v=9bZkp7q19f0",
      "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
    ];

    const topicSpecificVideos = {
      javascript: [
        "https://www.youtube.com/watch?v=W6NZfCO5SIk",
        "https://www.youtube.com/watch?v=hdI2bqOjy3c",
        "https://www.youtube.com/watch?v=PFmuCDHHpwk",
      ],
      react: [
        "https://www.youtube.com/watch?v=DLX62G4lc44",
        "https://www.youtube.com/watch?v=Ke90Tje7VS0",
        "https://www.youtube.com/watch?v=4UZrsTqkcW4",
      ],
      nodejs: [
        "https://www.youtube.com/watch?v=TlB_eWDSMt4",
        "https://www.youtube.com/watch?v=Oe421EPjeBE",
        "https://www.youtube.com/watch?v=VShtPwEkDD0",
      ],
      python: [
        "https://www.youtube.com/watch?v=kqtD5dpn9C8",
        "https://www.youtube.com/watch?v=rfscVS0vtbw",
        "https://www.youtube.com/watch?v=Z1Yd7upQsXY",
      ],
      typescript: [
        "https://www.youtube.com/watch?v=BwuLxPH8IDs",
        "https://www.youtube.com/watch?v=ahCwqrYpIuM",
        "https://www.youtube.com/watch?v=1jMJDbq7ZX4",
      ],
      mongodb: [
        "https://www.youtube.com/watch?v=-56x56UppqQ",
        "https://www.youtube.com/watch?v=EE8ZTdZaD80",
        "https://www.youtube.com/watch?v=Www6cEymC2Y",
      ],
    };

    const matchingVideos = Object.entries(topicSpecificVideos).find(([key]) =>
      topic.includes(key)
    );

    return matchingVideos ? matchingVideos[1] : baseVideos;
  }

  private static generateGoogleLinks(topic: string): string[] {
    const baseLinks = [
      `https://www.google.com/search?q=${encodeURIComponent(
        topic + " tutorial"
      )}`,
      `https://www.google.com/search?q=${encodeURIComponent(
        topic + " best practices"
      )}`,
      `https://www.google.com/search?q=${encodeURIComponent(
        topic + " examples"
      )}`,
    ];

    const topicSpecificLinks = {
      javascript: [
        "https://www.google.com/search?q=javascript+es6+features",
        "https://www.google.com/search?q=javascript+async+await",
        "https://www.google.com/search?q=javascript+closures",
      ],
      react: [
        "https://www.google.com/search?q=react+hooks+tutorial",
        "https://www.google.com/search?q=react+state+management",
        "https://www.google.com/search?q=react+performance+optimization",
      ],
      nodejs: [
        "https://www.google.com/search?q=nodejs+express+tutorial",
        "https://www.google.com/search?q=nodejs+middleware",
        "https://www.google.com/search?q=nodejs+authentication",
      ],
      python: [
        "https://www.google.com/search?q=python+django+tutorial",
        "https://www.google.com/search?q=python+flask+web+development",
        "https://www.google.com/search?q=python+data+structures",
      ],
      typescript: [
        "https://www.google.com/search?q=typescript+interfaces",
        "https://www.google.com/search?q=typescript+generics",
        "https://www.google.com/search?q=typescript+decorators",
      ],
      mongodb: [
        "https://www.google.com/search?q=mongodb+aggregation",
        "https://www.google.com/search?q=mongodb+indexing",
        "https://www.google.com/search?q=mongodb+replication",
      ],
    };

    const matchingLinks = Object.entries(topicSpecificLinks).find(([key]) =>
      topic.includes(key)
    );

    return matchingLinks ? matchingLinks[1] : baseLinks;
  }
}
