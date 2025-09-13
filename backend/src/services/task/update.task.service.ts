import { RequestHandler } from "express";
import { HttpStatus } from "../../enums";
import { Task } from "../../models/task.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { TaskMessage } from "./content";
import { updateTaskSchema } from "./validators/update.task.validator";
import { getTaskByUserIdSchema } from "./validators/get.task.validator";

const updateTask: RequestHandler = asyncHandler(async (req, res, _next) => {
    const payload = updateTaskSchema.parse(req.body);
    const userId = getTaskByUserIdSchema.parse({ userId: req.user._id.toString() });
    const task = await Task.findByIdAndUpdate({ _id: payload.taskId, user: userId }, { title: payload.title, description: payload.description, status: payload.status }, { new: true });

    if (!task) {
        throw new ApiError(HttpStatus.NOT_FOUND, TaskMessage.TaskNotFound);
    }

    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, task, TaskMessage.TaskUpdateSuccess));
});

export { updateTask };

