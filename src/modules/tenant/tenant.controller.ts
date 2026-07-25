import { Request, Response } from "express";
import httpStatus from "http-status";
import { tenantService } from "./tenant.service";

const registerUser = async (req: Request, res: Response) => {
  const result = await tenantService.registerUserIntoDB(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: result,
  });
};

export const tenantController = {
  registerUser,
};
