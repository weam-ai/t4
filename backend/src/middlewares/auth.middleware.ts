import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { HttpStatus } from "../enums";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

interface JwtPayload {
    id: string;
}

const authMiddleware: RequestHandler = asyncHandler(async (req, _res, next) => {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, "Unauthorized Request: No token provided");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
        const user = await User.findById(decodedToken.id);

        if (!user) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "Unauthorized Request: User not found");
        }
        req.user = user;
        next();
    } catch (error) {
        throw error;
    }

});

export { authMiddleware };

