import { NextFunction, Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";

export const catchAsync = (fn: RequestHandler) => {

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);

        } catch (error) {
            const message = (error as Error).message || "Something went wrong";

            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message,
                errorDetails: message,
            });
        }

    }

}