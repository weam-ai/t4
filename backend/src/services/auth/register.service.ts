import bcrypt from "bcryptjs";
import { RequestHandler } from "express";
import { HttpStatus } from "../../enums";
import { User } from "../../models/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthMessage } from "./content";
import { registerSchema } from "./validators/register.validator";

const register: RequestHandler = asyncHandler(async (req, res, _next) => {
    const payload = registerSchema.parse(req.body);

    const user = await User.findOne({ email: payload.email }, { _id: 1 });

    if (user) {
        throw new ApiError(HttpStatus.CONFLICT, AuthMessage.UserAlreadyExists);
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const newUser = new User({ name: payload.name, email: payload.email, password: hashedPassword });
    await newUser.save();

    const userWithoutPassword = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
    };

    res.status(HttpStatus.CREATED).json(new ApiResponse(HttpStatus.CREATED, userWithoutPassword, AuthMessage.RegisterSuccess));
});

export { register };

