import { RequestHandler } from "express";
import { HttpStatus } from "../../enums";
import { Task } from "../../models/task.model";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { TaskMessage } from "./content";
import { getTaskByUserIdSchema } from "./validators/get.task.validator";

const getTasks: RequestHandler = asyncHandler(async (req, res) => {
    const payload = getTaskByUserIdSchema.parse({ userId: req.user._id.toString() });

    const tasks = await Task.find({ user: payload.userId });

    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, tasks, TaskMessage.TaskRetrieveSuccess));
});

export { getTasks };

