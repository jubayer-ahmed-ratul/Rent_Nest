import bcrypt from "bcryptjs";
import config from "../config";
import { prisma } from "../lib/prisma";
import { jwtHelpers } from "../utils/jwt";
import { loginPayload, registerPayload } from "./auth.interface";

const registerUser = async (payload: registerPayload) => {
  const { name, email, password, role, profileImage } = payload;

  if (role === "LANDLORD") {
    const isExist = await prisma.landlord.findUnique({ where: { email } });
    if (isExist) throw new Error("User with this email already exists");

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_round));

    const landlord = await prisma.landlord.create({
      data: { name, email, password: hashedPassword, profileImage },
      omit: { password: true },
    });

    return landlord;
  }

  // TENANT or ADMIN — both go into tenant table
  const isExist = await prisma.tenant.findUnique({ where: { email } });
  if (isExist) throw new Error("User with this email already exists");

  const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_round));

  const tenant = await prisma.tenant.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role === "ADMIN" ? "ADMIN" : "TENANT",
    },
  });

  if (role !== "ADMIN") {
    await prisma.profile.create({
      data: { tenantId: tenant.id, fullName: name, profileImage },
    });
  }

  const result = await prisma.tenant.findUnique({
    where: { id: tenant.id },
    omit: { password: true },
    include: { profile: true },
  });

  return result;
};

const loginUser = async (payload: loginPayload) => {
  const { email, password } = payload;

  // find in tenant first, then landlord
  let user: any = await prisma.tenant.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.landlord.findUnique({ where: { email } });
  }

  if (!user) throw new Error("Invalid email or password");
  if (user.status === "BLOCKED") throw new Error("Your account has been blocked");
  if (user.isDeleted) throw new Error("Account not found");

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) throw new Error("Invalid email or password");

  const jwtPayload = { id: user.id, email: user.email, role: user.role };

  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expire_in as string,
  );

  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expire_in as string,
  );

  return { accessToken, refreshToken };
};

const getMe = async (id: string, role: string) => {
  const user =
    role === "LANDLORD"
      ? await prisma.landlord.findUnique({
          where: { id },
          omit: { password: true },
        })
      : await prisma.tenant.findUnique({
          where: { id },
          omit: { password: true },
          include: { profile: true },
        });

  if (!user) throw new Error("User not found");

  return user;
};

export const authService = {
  registerUser,
  loginUser,
  getMe,
};
