import { Chat } from "../../models/chat.model";
import { IUser } from "../../models/user.model";
import { ApiError } from "../../utils/ApiError";
import { HttpStatus } from "../../enums";

export interface GetResourcesListParams {
  page: number;
  limit: number;
  topic?: string;
}

export interface ResourcesListResponse {
  resources: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResources: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    topic?: string;
  };
}

export class GetResourcesListService {
  static async execute(user: IUser, params: GetResourcesListParams): Promise<ResourcesListResponse> {
    try {
      const { page, limit, topic } = params;

      // Build query filter
      const filter: any = { userId: user._id };
      if (topic) {
        filter.topic = { $regex: topic, $options: 'i' }; // Case-insensitive search
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get total count for pagination
      const totalResources = await Chat.countDocuments(filter);

      // Get resources with pagination
      const resources = await Chat.find(filter)
        .select('topic response.summary response.difficulty response.estimatedTime response.learningPath createdAt')
        .sort({ createdAt: -1 }) // Most recent first
        .skip(skip)
        .limit(limit)
        .lean();

      // Calculate pagination info
      const totalPages = Math.ceil(totalResources / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Transform resources to include only essential info for list view
      const transformedResources = resources.map((resource: any) => ({
        id: resource._id,
        topic: resource.topic,
        summary: resource.response?.summary || 'No summary available',
        difficulty: resource.response?.difficulty || 'Beginner',
        estimatedTime: resource.response?.estimatedTime || '2-4 weeks',
        learningPath: resource.response?.learningPath || {
          beginner: ['Start with basics'],
          intermediate: ['Build projects'],
          advanced: ['Master the topic']
        },
        createdAt: resource.createdAt,
        resourceCounts: {
          documentation: resource.response?.resources?.documentation?.length || 0,
          youtube: resource.response?.resources?.youtube?.length || 0,
          googleLinks: resource.response?.resources?.googleLinks?.length || 0
        }
      }));

      return {
        resources: transformedResources,
        pagination: {
          currentPage: page,
          totalPages,
          totalResources,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          topic: topic || undefined
        }
      };

    } catch (error) {
      console.error('Error getting resources list:', error);
      throw new ApiError(
        HttpStatus.SERVER_ERROR,
        'Failed to retrieve learning resources list'
      );
    }
  }
}
