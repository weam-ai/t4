import { RequestHandler } from "express";
import { HttpStatus } from "../../enums";
import { Task } from "../../models/task.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { TaskMessage } from "./content";
import { getTaskByIdSchema, getTaskByUserIdSchema } from "./validators/get.task.validator";

const getTaskById: RequestHandler = asyncHandler(async (req, res) => {
    const payload = getTaskByIdSchema.parse(req.params);
    const request = getTaskByUserIdSchema.parse({ userId: req.user._id.toString() });

    const task = await Task.findOne({ _id: payload.id, user: request.userId }).populate("user");

    if (!task) {
        throw new ApiError(HttpStatus.NOT_FOUND, TaskMessage.TaskNotFound);
    }

    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, task, TaskMessage.TaskRetrieveSuccess));
});

export { getTaskById };

