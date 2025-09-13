import { Request, Response } from "express";
import { CreateResourceService } from "../create-resource.service";
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
