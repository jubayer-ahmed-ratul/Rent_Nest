import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { tenantService } from "./tenant.service";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await tenantService.registerUserIntoDB(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await tenantService.getAllUsersFromDB();

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    data: result,
  });
});

export const tenantController = {
  registerUser,
  getAllUsers,
};
