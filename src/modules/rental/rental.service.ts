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

const getMyRentalRequestsFromDB = async (tenantId: string) => {
  return await prisma.rentalRequest.findMany({
    where: { tenantId },
    include: { property: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });
};

const getRentalRequestByIdFromDB = async (id: string, userId: string) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id },
    include: {
      property: { include: { category: true } },
      tenant: { omit: { password: true } },
    },
  });

  if (!request) throw new Error("Rental request not found");

  return request;
};

const getLandlordRentalRequestsFromDB = async (landlordId: string) => {
  return await prisma.rentalRequest.findMany({
    where: { property: { landlordId } },
    include: {
      property: true,
      tenant: { omit: { password: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateRentalStatusIntoDB = async (landlordId: string, requestId: string, payload: updateRentalStatusPayload) => {};

export const rentalService = {
  createRentalRequestIntoDB,
  getMyRentalRequestsFromDB,
  getRentalRequestByIdFromDB,
  getLandlordRentalRequestsFromDB,
  updateRentalStatusIntoDB,
};
