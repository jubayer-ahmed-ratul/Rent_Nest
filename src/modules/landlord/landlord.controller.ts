import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { landlordService } from "./landlord.service";

const createLandlord = catchAsync(async (req: Request, res: Response) => {
  const result = await landlordService.createLandlordIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Landlord created successfully",
    data: result,
  });
});

const getLandlordProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await landlordService.getLandlordProfileFromDB(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Landlord profile retrieved successfully",
    data: result,
  });
});

const updateLandlordProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await landlordService.updateLandlordProfileIntoDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Landlord profile updated successfully",
    data: result,
  });
});

export const landlordController = {
  createLandlord,
  getLandlordProfile,
  updateLandlordProfile,
};
