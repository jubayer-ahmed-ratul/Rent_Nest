import { prisma } from "../../lib/prisma";
import { createReviewPayload } from "./review.interface";

const createReviewIntoDB = async (tenantId: string, payload: createReviewPayload) => {
  const { propertyId, rating, comment } = payload;

  // check property exists
  const property = await prisma.property.findUnique({
    where: { id: propertyId, isDeleted: false },
  });
  if (!property) throw new Error("Property not found");

  // check tenant has an approved or completed rental for this property
  const validRental = await prisma.rentalRequest.findFirst({
    where: { tenantId, propertyId, status: { in: ["APPROVED", "COMPLETED"] } },
  });
  if (!validRental) throw new Error("You can only review a property after an approved or completed rental");

  // check already reviewed
  const existing = await prisma.review.findFirst({
    where: { tenantId, propertyId },
  });
  if (existing) throw new Error("You have already reviewed this property");

  // rating validation
  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");

  return await prisma.review.create({
    data: { tenantId, propertyId, rating, comment },
    include: {
      tenant: { omit: { password: true } },
      property: true,
    },
  });
};

export const reviewService = {
  createReviewIntoDB,
};
