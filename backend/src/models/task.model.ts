import { Document, model, Model, Schema } from "mongoose";
import { TaskStatus } from "../enums";

const modelName = "tasks";
type TaskModel = Model<ITask>;

interface ITask extends Document {
    title: string;
    description: string;
    status: TaskStatus;
    user: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
    {
        title: {
            type: Schema.Types.String,
            required: true,
        },
        description: {
            type: Schema.Types.String,
            required: true,
        },
        status: {
            type: Schema.Types.String,
            enum: Object.values(TaskStatus),
            default: TaskStatus.OPEN,
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        }
    },
    {
        collection: modelName,
        timestamps: true,
        strict: true,
        versionKey: false,
    }
);

const Task = model<ITask, TaskModel>(
    modelName,
    TaskSchema
);

export { ITask, Task, TaskModel };

