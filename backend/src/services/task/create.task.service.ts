import { RequestHandler } from "express";
import { HttpStatus } from "../../enums";
import { Task } from "../../models/task.model";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { TaskMessage } from "./content";
import { createTaskSchema } from "./validators/create.task.validator";
import { getTaskByUserIdSchema } from "./validators/get.task.validator";

const createTask: RequestHandler = asyncHandler(async (req, res) => {
    const payload = createTaskSchema.parse(req.body);
    const userId = getTaskByUserIdSchema.parse({ userId: req.user._id.toString() });

    const newTask = new Task({ title: payload.title, description: payload.description, status: payload.status, user: userId });

    await newTask.save();

    res.status(HttpStatus.CREATED).json(new ApiResponse(HttpStatus.CREATED, newTask, TaskMessage.TaskCreateSuccess));

});

export { createTask };

