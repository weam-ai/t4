import cors from "cors";
import express, { Express } from "express";
import rateLimit from "express-rate-limit";
import requestIp from "request-ip";
import { errorHandler } from "./middlewares/error.middleware";
import authRouter from "./routes/auth/auth.routes";
import { ApiError } from "./utils/ApiError";
import resourceRouter from "./routes/learning-content/resource.routes";
import chatRouter from "./routes/learning-content/chat.routes";

const app: Express = express();

app.use(cors());
app.use(requestIp.mw());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 8888, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
        return req.clientIp ?? "[IP ADDRESS]";
    },
    handler: (_, __, ___, options) => {
        throw new ApiError(
            options.statusCode || 500,
            `There are too many requests. You are only allowed ${options.max
            } requests per ${options.windowMs / 60000} minutes`
        );
    },
});

app.use(limiter);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use("/api/auth", authRouter);
app.use("/api/resources", resourceRouter);
app.use("/api/chats", chatRouter);

app.use(errorHandler);

export { app };

