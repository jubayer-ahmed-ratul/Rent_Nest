import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { propertyService } from "./property.service";

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    location: req.query.location as string,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    categoryId: req.query.categoryId as string,
    bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : undefined,
  };

  const result = await propertyService.getAllPropertiesFromDB(filters);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Properties retrieved successfully",
    data: result,
  });
});

const getPropertyById = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.getPropertyByIdFromDB(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property retrieved successfully",
    data: result,
  });
});

export const propertyController = {
  getAllProperties,
  getPropertyById,
};
