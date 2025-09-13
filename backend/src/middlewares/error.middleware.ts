import { NextFunction, Request, Response } from "express";
import { MongooseError } from "mongoose";
import { ZodError } from "zod";
import { HttpStatus } from "../enums";
import { ApiError } from "../utils/ApiError";

function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    let apiError: ApiError;

    if (err instanceof ZodError) {
        apiError = new ApiError(
            HttpStatus.BAD_REQUEST,
            `${err.errors[0].path}: ${err.errors[0].message}`,
            err.errors.map((el) => `${el.path}: ${el.message}`),
            err.stack
        );
    } else if (err instanceof MongooseError) {
        const errorMap: Record<string, number> = {
            ValidationError: HttpStatus.BAD_REQUEST,
            CastError: HttpStatus.BAD_REQUEST,
            DocumentNotFoundError: HttpStatus.NOT_FOUND,
            MongoServerError: HttpStatus.SERVER_ERROR,
        };

        apiError = new ApiError(
            errorMap[err.name] || HttpStatus.SERVER_ERROR,
            err.message,
            [err.message],
            err.stack
        );
    } else if (err instanceof ApiError) {
        apiError = err;
    } else if (err instanceof Error) {
        apiError = new ApiError(
            HttpStatus.SERVER_ERROR,
            "Something went wrong",
            [err.message],
            err.stack
        );
    } else {
        apiError = new ApiError(HttpStatus.SERVER_ERROR, "Something went wrong", []);
    }

    const response = {
        success: false,
        statusCode: apiError.statusCode,
        message: apiError.message,
        errors: apiError.errors,
        ...(process.env.NODE_ENV === "development" && apiError.stack ? { stack: apiError.stack } : {}),
    };

    res.status(apiError.statusCode).json(response);
}

export { errorHandler };

