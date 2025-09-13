import { RequestHandler } from "express";
import { HttpStatus } from "../../enums";
import { Task } from "../../models/task.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { TaskMessage } from "./content";
import { getTaskByIdSchema, getTaskByUserIdSchema } from "./validators/get.task.validator";

const deleteTask: RequestHandler = asyncHandler(async (req, res) => {
    const payload = getTaskByIdSchema.parse(req.params);
    const userId = getTaskByUserIdSchema.parse({ userId: req.user._id.toString() });

    const task = await Task.findOneAndDelete({ _id: payload.id, user: userId });

    if (!task) {
        throw new ApiError(HttpStatus.NOT_FOUND, TaskMessage.TaskNotFound);
    }

    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, {}, TaskMessage.TaskDeleteSuccess));
});

export { deleteTask };

