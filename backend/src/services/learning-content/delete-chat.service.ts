import { Chat } from "../../models/chat.model";
import { IUser } from "../../models/user.model";
import { ApiError } from "../../utils/ApiError";
import { HttpStatus } from "../../enums";

export interface DeleteChatParams {
  chatId: string;
}

export class DeleteChatService {
  static async execute(user: IUser, params: DeleteChatParams): Promise<{ message: string }> {
    try {
      const { chatId } = params;

      // Find the chat and verify ownership
      const chat = await Chat.findOne({ 
        _id: chatId, 
        userId: user._id 
      });

      if (!chat) {
        throw new ApiError(
          HttpStatus.NOT_FOUND,
          'Chat not found or you do not have permission to delete it'
        );
      }

      // Delete the chat
      await Chat.findByIdAndDelete(chatId);

      return {
        message: 'Chat deleted successfully'
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      console.error('Error deleting chat:', error);
      throw new ApiError(
        HttpStatus.SERVER_ERROR,
        'Failed to delete chat'
      );
    }
  }
}
