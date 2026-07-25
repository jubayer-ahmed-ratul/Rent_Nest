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

export const landlordController = {
  createLandlord,
};
