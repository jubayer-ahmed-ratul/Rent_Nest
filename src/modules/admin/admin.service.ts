import { updateUserStatusPayload } from "./admin.interface";

const getAllUsersFromDB = async () => {};

const updateUserStatusIntoDB = async (id: string, role: string, payload: updateUserStatusPayload) => {};

const getAllPropertiesFromDB = async () => {};

const getAllRentalRequestsFromDB = async () => {};

export const adminService = {
  getAllUsersFromDB,
  updateUserStatusIntoDB,
  getAllPropertiesFromDB,
  getAllRentalRequestsFromDB,
};
