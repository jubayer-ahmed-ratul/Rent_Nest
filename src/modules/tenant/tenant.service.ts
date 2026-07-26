import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { registerUserPayload, updateTenantProfilePayload } from "./tenant.interface";

const registerUserIntoDB = async (payload: registerUserPayload) => {
  const { name, email, password, profileImage } = payload;

  const isUserExist = await prisma.tenant.findUnique({ where: { email } });
  if (isUserExist) throw new Error("User with this email already exists");

  const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_round));

  const createdUser = await prisma.tenant.create({
    data: { name, email, password: hashedPassword },
  });

  await prisma.profile.create({
    data: { tenantId: createdUser.id, fullName: name, profileImage },
  });

  return await prisma.tenant.findUnique({
    where: { id: createdUser.id },
    omit: { password: true },
    include: { profile: true },
  });
};

const getAllUsersFromDB = async () => {
  return await prisma.tenant.findMany({
    where: { isDeleted: false },
    omit: { password: true },
    include: { profile: true },
  });
};

const updateMyProfileIntoDB = async (tenantId: string, payload: updateTenantProfilePayload) => {
  const profile = await prisma.profile.findUnique({ where: { tenantId } });
  if (!profile) throw new Error("Profile not found");

  return await prisma.profile.update({
    where: { tenantId },
    data: payload,
  });
};

export const tenantService = {
  registerUserIntoDB,
  getAllUsersFromDB,
  updateMyProfileIntoDB,
};
