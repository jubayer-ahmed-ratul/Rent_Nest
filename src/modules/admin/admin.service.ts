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

const updateUserStatusIntoDB = async (id: string, role: string, payload: updateUserStatusPayload) => {};

const getAllPropertiesFromDB = async () => {};

const getAllRentalRequestsFromDB = async () => {};

export const adminService = {
  getAllUsersFromDB,
  updateUserStatusIntoDB,
  getAllPropertiesFromDB,
  getAllRentalRequestsFromDB,
};
