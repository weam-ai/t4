// services/promptRefinerService.js
class PromptRefinerService {
  constructor() {
    // Keywords that indicate different learning levels
    this.levelKeywords = {
      beginner: ['beginner', 'basic', 'intro', 'introduction', 'start', 'new', 'simple'],
      intermediate: ['intermediate', 'moderate', 'standard', 'regular'],
      advanced: ['advanced', 'expert', 'complex', 'deep', 'professional', 'mastery']
    };

    // Subject categories for better context
    this.subjectCategories = {
      programming: ['programming', 'coding', 'development', 'software', 'web', 'mobile', 'javascript', 'python', 'react', 'node', 'html', 'css', 'database', 'api'],
      science: ['physics', 'chemistry', 'biology', 'mathematics', 'math', 'calculus', 'algebra', 'geometry', 'statistics'],
      business: ['marketing', 'business', 'finance', 'management', 'economics', 'accounting', 'sales', 'strategy'],
      creative: ['design', 'art', 'photography', 'writing', 'music', 'video', 'graphics', 'ui', 'ux'],
      technology: ['ai', 'machine learning', 'data science', 'blockchain', 'cloud', 'cybersecurity', 'devops'],
      health: ['medicine', 'health', 'fitness', 'nutrition', 'psychology', 'therapy'],
      language: ['english', 'spanish', 'french', 'chinese', 'japanese', 'grammar', 'vocabulary', 'speaking']
    };
  }

  // Main method to refine user input
  refineUserQuery(userInput) {
    const cleanInput = userInput.trim().toLowerCase();
    const analysis = this.analyzeQuery(cleanInput);
    
    return {
      originalQuery: userInput,
      refinedQuery: this.buildRefinedQuery(analysis),
      detectedLevel: analysis.level,
      detectedCategory: analysis.category,
      suggestions: this.generateSuggestions(analysis)
    };
  }

  // Analyze user query to understand intent and level
  analyzeQuery(query) {
    const words = query.split(/\s+/);
    
    return {
      originalQuery: query,
      level: this.detectLevel(query),
      category: this.detectCategory(query),
      keywords: this.extractKeywords(words),
      intent: this.detectIntent(query),
      specificity: this.assessSpecificity(query)
    };
  }

  // Detect learning level from user input
  detectLevel(query) {
    const levels = Object.keys(this.levelKeywords);
    
    for (const level of levels) {
      const keywords = this.levelKeywords[level];
      if (keywords.some(keyword => query.includes(keyword))) {
        return level;
      }
    }
    
    // Default heuristics
    if (query.includes('how to') || query.includes('learn') || query.includes('tutorial')) {
      return 'beginner';
    }
    
    if (query.includes('master') || query.includes('expert') || query.includes('advanced')) {
      return 'advanced';
    }
    
    return 'intermediate'; // Default level
  }

  // Detect subject category
  detectCategory(query) {
    const categories = Object.keys(this.subjectCategories);
    
    for (const category of categories) {
      const keywords = this.subjectCategories[category];
      if (keywords.some(keyword => query.includes(keyword))) {
        return category;
      }
    }
    
    return 'general'; // Default category
  }

  // Extract important keywords
  extractKeywords(words) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'how', 'what', 'why', 'when', 'where'];
    return words.filter(word => !stopWords.includes(word) && word.length > 2);
  }

  // Detect user intent
  detectIntent(query) {
    if (query.includes('how to') || query.includes('tutorial') || query.includes('guide')) {
      return 'tutorial';
    }
    
    if (query.includes('what is') || query.includes('define') || query.includes('explain')) {
      return 'explanation';
    }
    
    if (query.includes('example') || query.includes('practice') || query.includes('exercise')) {
      return 'practical';
    }
    
    if (query.includes('best practices') || query.includes('tips') || query.includes('advice')) {
      return 'best_practices';
    }
    
    return 'comprehensive';
  }

  // Assess how specific the query is
  assessSpecificity(query) {
    const specificIndicators = ['specific', 'particular', 'exact', 'precise'];
    const generalIndicators = ['general', 'overview', 'introduction', 'basics'];
    
    if (specificIndicators.some(indicator => query.includes(indicator))) {
      return 'high';
    }
    
    if (generalIndicators.some(indicator => query.includes(indicator))) {
      return 'low';
    }
    
    return query.length > 30 ? 'high' : 'medium';
  }

  // Build refined query for OpenAI
  buildRefinedQuery(analysis) {
    const { level, category, intent, keywords, specificity } = analysis;
    
    let refinedQuery = `Create a comprehensive ${level}-level learning guide about "${analysis.originalQuery}".`;
    
    // Add category-specific context
    if (category !== 'general') {
      refinedQuery += ` This is a ${category} topic.`;
    }
    
    // Add intent-specific instructions
    switch (intent) {
      case 'tutorial':
        refinedQuery += ' Focus on step-by-step instructions and practical implementation.';
        break;
      case 'explanation':
        refinedQuery += ' Provide clear definitions and theoretical understanding.';
        break;
      case 'practical':
        refinedQuery += ' Include plenty of hands-on examples and exercises.';
        break;
      case 'best_practices':
        refinedQuery += ' Emphasize industry standards and professional recommendations.';
        break;
      default:
        refinedQuery += ' Provide both theoretical knowledge and practical applications.';
    }
    
    // Add level-specific requirements
    switch (level) {
      case 'beginner':
        refinedQuery += ' Assume no prior knowledge and explain all concepts clearly with simple examples.';
        break;
      case 'intermediate':
        refinedQuery += ' Assume basic familiarity and focus on building deeper understanding.';
        break;
      case 'advanced':
        refinedQuery += ' Include complex concepts, edge cases, and professional-level insights.';
        break;
    }
    
    // Add specificity instructions
    if (specificity === 'high') {
      refinedQuery += ' Be very detailed and thorough in your explanations.';
    } else if (specificity === 'low') {
      refinedQuery += ' Provide a broad overview covering the main concepts.';
    }
    
    return refinedQuery;
  }

  // Generate video search refinement
  refineVideoSearch(userInput, analysis) {
    const { level, category, intent } = analysis;
    
    let videoQuery = userInput;
    
    // Add level context
    if (level === 'beginner') {
      videoQuery += ' tutorial for beginners';
    } else if (level === 'advanced') {
      videoQuery += ' advanced course';
    } else {
      videoQuery += ' complete guide';
    }
    
    // Add category-specific terms
    if (category === 'programming') {
      videoQuery += ' programming tutorial';
    } else if (category === 'business') {
      videoQuery += ' business course';
    }
    
    return videoQuery;
  }

  // Generate suggestions for better queries
  generateSuggestions(analysis) {
    const suggestions = [];
    const { level, category, specificity } = analysis;
    
    if (specificity === 'low') {
      suggestions.push('Try being more specific about what aspect you want to learn');
    }
    
    if (level === 'intermediate' && analysis.originalQuery.length < 20) {
      suggestions.push('Consider specifying your current skill level (beginner, intermediate, advanced)');
    }
    
    if (category === 'general') {
      suggestions.push('Adding context about the field or domain might help get better results');
    }
    
    // Add category-specific suggestions
    switch (category) {
      case 'programming':
        suggestions.push('Consider mentioning your preferred programming language or framework');
        break;
      case 'business':
        suggestions.push('Specify if you want theoretical knowledge or practical implementation');
        break;
      case 'creative':
        suggestions.push('Mention your tools or medium of choice for better guidance');
        break;
    }
    
    return suggestions;
  }

  // Preview what the refined query will generate
  previewRefinement(userInput) {
    const analysis = this.analyzeQuery(userInput.trim().toLowerCase());
    const refined = this.buildRefinedQuery(analysis);
    
    return {
      original: userInput,
      refined: refined,
      improvements: [
        `Detected level: ${analysis.level}`,
        `Category: ${analysis.category}`,
        `Intent: ${analysis.intent}`,
        `Specificity: ${analysis.specificity}`
      ],
      estimatedQuality: this.estimateQuality(analysis)
    };
  }

  // Estimate the quality of the refined query
  estimateQuality(analysis) {
    let score = 50; // Base score
    
    // Level detection adds clarity
    if (analysis.level !== 'intermediate') score += 15;
    
    // Category detection adds context
    if (analysis.category !== 'general') score += 20;
    
    // Specific queries are better
    if (analysis.specificity === 'high') score += 15;
    
    // Clear intent improves results
    if (analysis.intent !== 'comprehensive') score += 10;
    
    return Math.min(100, score);
  }
}

export default PromptRefinerService;