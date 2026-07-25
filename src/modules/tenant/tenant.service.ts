import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { registerUserPayload } from "./tenant.interface";

const registerUserIntoDB = async (payload: registerUserPayload) => {
  const { name, email, password, profileImage } = payload;

  const isUserExist = await prisma.tenant.findUnique({
    where: { email },
  });

  if (isUserExist) {
    throw new Error("User with this email already exists");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_round),
  );

  // create user
  const createdUser = await prisma.tenant.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // create profile
  await prisma.profile.create({
    data: {
      tenantId: createdUser.id,
      fullName: name,
      profileImage,
    },
  });

  const user = await prisma.tenant.findUnique({
    where: { id: createdUser.id },
    omit: { password: true },
    include: { profile: true },
  });

  return user;
};

export const tenantService = {
  registerUserIntoDB,
};
