import { Document, model, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

const modelName = "chats";
type ChatModel = Model<IChat>;

interface IChat extends Document {
    userId: IUser["_id"];
    topic: string;
    response: {
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
    };
    createdAt: Date;
    updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        topic: {
            type: Schema.Types.String,
            required: true,
        },
        response: {
            topic: {
                type: Schema.Types.String,
                required: true,
            },
            summary: {
                type: Schema.Types.String,
                required: true,
            },
            resources: {
                documentation: [{
                    title: { type: Schema.Types.String, required: true },
                    url: { type: Schema.Types.String, required: true },
                    description: { type: Schema.Types.String, required: true },
                    source: { type: Schema.Types.String, required: true },
                }],
            youtube: [{
                title: { type: Schema.Types.String, required: true },
                url: { type: Schema.Types.String, required: true },
                description: { type: Schema.Types.String, required: true },
                channel: { type: Schema.Types.String, required: true },
                duration: { type: Schema.Types.String, required: false },
                viewCount: { type: Schema.Types.String, required: false },
                publishedAt: { type: Schema.Types.String, required: false },
                thumbnail: { type: Schema.Types.String, required: false },
            }],
                googleLinks: [{
                    title: { type: Schema.Types.String, required: true },
                    url: { type: Schema.Types.String, required: true },
                    description: { type: Schema.Types.String, required: true },
                    searchQuery: { type: Schema.Types.String, required: true },
                }],
            },
            learningPath: {
                beginner: [{ type: Schema.Types.String }],
                intermediate: [{ type: Schema.Types.String }],
                advanced: [{ type: Schema.Types.String }],
            },
            estimatedTime: {
                type: Schema.Types.String,
                required: false,
            },
            difficulty: {
                type: Schema.Types.String,
                enum: ['Beginner', 'Intermediate', 'Advanced'],
                required: false,
            },
        },
    },
    {
        collection: modelName,
        timestamps: true,
        strict: true,
        versionKey: false,
    }
);

const Chat = model<IChat, ChatModel>(
    modelName,
    ChatSchema
);

export { IChat, Chat, ChatModel };
