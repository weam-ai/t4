import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createTask } from "../../services/task/create.task.service";
import { getTasks } from "../../services/task/get-all.task.service";
import { getTaskById } from "../../services/task/get-by-id.task.service";
import { deleteTask } from "../../services/task/delete.task.service";
import { updateTask } from "../../services/task/update.task.service";

const taskRouter: Router = Router();

taskRouter.use(authMiddleware);

taskRouter.route("/create").post(createTask);
taskRouter.route("/get-all").get(getTasks);
taskRouter.route("/get-by-id/:id").get(getTaskById);
taskRouter.route("/delete/:id").delete(deleteTask);
taskRouter.route("/update").patch(updateTask);

export default taskRouter;
