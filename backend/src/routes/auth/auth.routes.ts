import { Router } from "express";
import { register } from "../../services/auth/register.service";
import { login } from "../../services/auth/login.service";

const authRouter: Router = Router();

authRouter.route("/register").post(register);
authRouter.route("/login").post(login);

export default authRouter;
