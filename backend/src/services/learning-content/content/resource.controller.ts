import { Request, Response } from "express";
import { CreateResourceService } from "../create-resource.service";
import { GetResourcesListService } from "../get-resources-list.service";
import { createResourceValidator } from "../validators/resource.validator";
import { ApiResponse } from "../../../utils/ApiResponse";
import { HttpStatus } from "../../../enums";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ApiError } from "../../../utils/ApiError";

export const createResource = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validatedData = createResourceValidator.parse(req.body);

    // Get user from auth middleware
    const user = req.user;

    if (!user) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, "User not authenticated");
    }

    // Create learning resource
    const learningResource = await CreateResourceService.execute(user, validatedData);

    // Send response
    const response = new ApiResponse(
        HttpStatus.CREATED,
        learningResource,
        "Learning resources generated successfully"
    );

    res.status(HttpStatus.CREATED).json(response);
});

export const getResourcesList = asyncHandler(async (req: Request, res: Response) => {
    // Get user from auth middleware
    const user = req.user;

    if (!user) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, "User not authenticated");
    }

    // Get query parameters for pagination and filtering
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const topic = req.query.topic as string;

    // Get learning resources list
    const resourcesList = await GetResourcesListService.execute(user, { page, limit, topic });

    // Send response
    const response = new ApiResponse(
        HttpStatus.OK,
        resourcesList,
        "Learning resources retrieved successfully"
    );

    res.status(HttpStatus.OK).json(response);
});
