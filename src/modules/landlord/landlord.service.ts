import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { createLandlordPayload, updateLandlordPayload } from "./landlord.interface";

const createLandlordIntoDB = async (payload: createLandlordPayload) => {
  const { name, email, password, profileImage } = payload;

  const isExist = await prisma.landlord.findUnique({ where: { email } });
  if (isExist) throw new Error("Landlord with this email already exists");

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_round),
  );

  const landlord = await prisma.landlord.create({
    data: { name, email, password: hashedPassword, profileImage },
    omit: { password: true },
  });

  return landlord;
};

const getLandlordProfileFromDB = async (id: string) => {
  const landlord = await prisma.landlord.findUnique({
    where: { id, isDeleted: false },
    omit: { password: true },
  });

  if (!landlord) throw new Error("Landlord not found");

  return landlord;
};

const updateLandlordProfileIntoDB = async (
  id: string,
  payload: updateLandlordPayload,
) => {
  const isExist = await prisma.landlord.findUnique({
    where: { id, isDeleted: false },
  });

  if (!isExist) throw new Error("Landlord not found");

  const landlord = await prisma.landlord.update({
    where: { id },
    data: payload,
    omit: { password: true },
  });

  return landlord;
};

export const landlordService = {
  createLandlordIntoDB,
  getLandlordProfileFromDB,
  updateLandlordProfileIntoDB,
};
