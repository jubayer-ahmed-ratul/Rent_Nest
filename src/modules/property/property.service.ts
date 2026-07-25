import { prisma } from "../../lib/prisma";
import { propertyFilterPayload } from "./property.interface";

const getAllPropertiesFromDB = async (filters: propertyFilterPayload) => {
  const { location, minPrice, maxPrice, categoryId, bedrooms } = filters;

  const properties = await prisma.property.findMany({
    where: {
      isDeleted: false,
      isAvailable: true,
      ...(location && {
        location: { contains: location, mode: "insensitive" },
      }),
      ...(categoryId && { categoryId }),
      ...(bedrooms && { bedrooms }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: Number(minPrice) }),
          ...(maxPrice && { lte: Number(maxPrice) }),
        },
      }),
    },
    include: {
      category: true,
      landlord: {
        omit: { password: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return properties;
};

const getPropertyByIdFromDB = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id, isDeleted: false },
    include: {
      category: true,
      landlord: {
        omit: { password: true },
      },
    },
  });

  if (!property) throw new Error("Property not found");

  return property;
};

export const propertyService = {
  getAllPropertiesFromDB,
  getPropertyByIdFromDB,
};
