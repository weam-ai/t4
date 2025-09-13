import { IUser } from "../../models/user.model";
import { Chat } from "../../models/chat.model";
import { LearningContentService, LearningResource } from "./content";
import { CreateResourceRequest } from "./validators/resource.validator";
import { ApiError } from "../../utils/ApiError";
import { HttpStatus } from "../../enums";

export class CreateResourceService {
    static async execute(user: IUser, data: CreateResourceRequest): Promise<LearningResource> {
        try {
            // Generate learning resources using the content service
            const learningResource = await LearningContentService.generateLearningResources(data.topic);

            // Save the chat history to database
            const chatRecord = new Chat({
                userId: user._id,
                topic: data.topic,
                response: learningResource,
            });

            await chatRecord.save();

            return learningResource;
        } catch (error) {
            throw new ApiError(
                HttpStatus.SERVER_ERROR,
                "Failed to generate learning resources",
                [error instanceof Error ? error.message : "Unknown error"]
            );
        }
    }
}
