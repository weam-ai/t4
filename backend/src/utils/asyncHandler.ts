import { NextFunction, Request, RequestHandler, Response } from "express";

function asyncHandler(requestHandler: RequestHandler) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
}

export { asyncHandler };
