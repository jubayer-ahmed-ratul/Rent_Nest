import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { rentalService } from "./rental.service";

const createRentalRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await rentalService.createRentalRequestIntoDB(req.user!.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental request submitted successfully",
    data: result,
  });
});

const getMyRentalRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await rentalService.getMyRentalRequestsFromDB(req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental requests retrieved successfully",
    data: result,
  });
});

const getRentalRequestById = catchAsync(async (req: Request, res: Response) => {
  const result = await rentalService.getRentalRequestByIdFromDB(req.params.id as string, req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental request retrieved successfully",
    data: result,
  });
});

const getLandlordRentalRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await rentalService.getLandlordRentalRequestsFromDB(req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental requests retrieved successfully",
    data: result,
  });
});

const updateRentalStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await rentalService.updateRentalStatusIntoDB(req.user!.id, req.params.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental request updated successfully",
    data: result,
  });
});

export const rentalController = {
  createRentalRequest,
  getMyRentalRequests,
  getRentalRequestById,
  getLandlordRentalRequests,
  updateRentalStatus,
};
