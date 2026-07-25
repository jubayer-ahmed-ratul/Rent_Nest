import { createRentalRequestPayload, updateRentalStatusPayload } from "./rental.interface";

const createRentalRequestIntoDB = async (tenantId: string, payload: createRentalRequestPayload) => {};

const getMyRentalRequestsFromDB = async (tenantId: string) => {};

const getRentalRequestByIdFromDB = async (id: string, userId: string) => {};

const getLandlordRentalRequestsFromDB = async (landlordId: string) => {};

const updateRentalStatusIntoDB = async (landlordId: string, requestId: string, payload: updateRentalStatusPayload) => {};

export const rentalService = {
  createRentalRequestIntoDB,
  getMyRentalRequestsFromDB,
  getRentalRequestByIdFromDB,
  getLandlordRentalRequestsFromDB,
  updateRentalStatusIntoDB,
};
