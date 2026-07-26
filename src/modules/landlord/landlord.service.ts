import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { createLandlordPayload, updateLandlordPayload } from "./landlord.interface";
import { createPropertyPayload, updatePropertyPayload } from "../property/property.interface";

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

// property management
const createPropertyIntoDB = async (landlordId: string, payload: createPropertyPayload) => {
  const property = await prisma.property.create({
    data: { ...payload, landlordId },
    include: { category: true },
  });

  return property;
};

const updatePropertyIntoDB = async (
  landlordId: string,
  propertyId: string,
  payload: updatePropertyPayload,
) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, isDeleted: false },
  });

  if (!property) throw new Error("Property not found");
  if (property.landlordId !== landlordId) throw new Error("You are not authorized to update this property");

  return await prisma.property.update({
    where: { id: propertyId },
    data: payload,
    include: { category: true },
  });
};

const deletePropertyFromDB = async (landlordId: string, propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, isDeleted: false },
  });

  if (!property) throw new Error("Property not found");
  if (property.landlordId !== landlordId) throw new Error("You are not authorized to delete this property");

  return await prisma.property.update({
    where: { id: propertyId },
    data: { isDeleted: true },
  });
};

const togglePropertyAvailabilityIntoDB = async (landlordId: string, propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, isDeleted: false },
  });

  if (!property) throw new Error("Property not found");
  if (property.landlordId !== landlordId) throw new Error("You are not authorized to update this property");

  return await prisma.property.update({
    where: { id: propertyId },
    data: { isAvailable: !property.isAvailable },
    include: { category: true },
  });
};

export const landlordService = {
  createLandlordIntoDB,
  getLandlordProfileFromDB,
  updateLandlordProfileIntoDB,
  createPropertyIntoDB,
  updatePropertyIntoDB,
  deletePropertyFromDB,
  togglePropertyAvailabilityIntoDB,
};
