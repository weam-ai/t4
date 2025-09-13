import dotenv from "dotenv";
import { app } from "./app";
import connectDB from "./db";
import { IUser } from "./models/user.model";

declare global {
    namespace Express {
        export interface Request {
            user?: IUser;
        }
    }
}

dotenv.config({
    path: "./.env",
});

const startServer = () => {
    const port = process.env.PORT;
    app.listen(port, () => {
        console.log("⚙️  Server is running on port: " + port);
    });
};

try {
    connectDB().then(() => {
        startServer();
    });
} catch (err) {
    console.log("DB connect error: ", err);
}
