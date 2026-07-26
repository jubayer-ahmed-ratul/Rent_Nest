import { prisma } from "../../lib/prisma";
import { createRentalRequestPayload, updateRentalStatusPayload } from "./rental.interface";

const createRentalRequestIntoDB = async (tenantId: string, payload: createRentalRequestPayload) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId, isDeleted: false, isAvailable: true },
  });

  if (!property) throw new Error("Property not found or not available");

  const existing = await prisma.rentalRequest.findFirst({
    where: { tenantId, propertyId: payload.propertyId, status: "PENDING" },
  });

  if (existing) throw new Error("You already have a pending request for this property");

  return await prisma.rentalRequest.create({
    data: { tenantId, ...payload },
    include: {
      property: { include: { category: true } },
      tenant: { omit: { password: true } },
    },
  });
};

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
