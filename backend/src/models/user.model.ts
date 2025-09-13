import { Document, model, Model, Schema } from "mongoose";

const modelName = "users";
type UserModel = Model<IUser>;

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: Schema.Types.String,
            required: true,
        },
        email: {
            type: Schema.Types.String,
            required: true,
            unique: true,
        },
        password: {
            type: Schema.Types.String,
            required: true,
            select: false,
        }
    },
    {
        collection: modelName,
        timestamps: true,
        strict: true,
        versionKey: false,
    }
);

const User = model<IUser, UserModel>(
    modelName,
    UserSchema
);

export { IUser, User, UserModel };

