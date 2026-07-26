import { prisma } from "../../lib/prisma";
import { updateUserStatusPayload } from "./admin.interface";

const getAllUsersFromDB = async () => {
  const tenants = await prisma.tenant.findMany({
    omit: { password: true },
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  });

  const landlords = await prisma.landlord.findMany({
    omit: { password: true },
    orderBy: { createdAt: "desc" },
  });

  return { tenants, landlords };
};

const updateUserStatusIntoDB = async (id: string, role: string, payload: updateUserStatusPayload) => {
  if (role === "LANDLORD") {
    const landlord = await prisma.landlord.findUnique({ where: { id } });
    if (!landlord) throw new Error("Landlord not found");

    return await prisma.landlord.update({
      where: { id },
      data: { status: payload.status },
      omit: { password: true },
    });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) throw new Error("User not found");

  return await prisma.tenant.update({
    where: { id },
    data: { status: payload.status },
    omit: { password: true },
  });
};

const getAllPropertiesFromDB = async () => {
  return await prisma.property.findMany({
    where: { isDeleted: false },
    include: {
      category: true,
      landlord: { omit: { password: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getAllRentalRequestsFromDB = async () => {
  return await prisma.rentalRequest.findMany({
    include: {
      tenant: { omit: { password: true } },
      property: { include: { category: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const adminService = {
  getAllUsersFromDB,
  updateUserStatusIntoDB,
  getAllPropertiesFromDB,
  getAllRentalRequestsFromDB,
};
