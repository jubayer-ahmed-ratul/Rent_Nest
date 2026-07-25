import bcrypt from "bcryptjs";
import config from "../config";
import { prisma } from "../lib/prisma";
import { jwtHelpers } from "../utils/jwt";
import { loginPayload } from "./auth.interface";

const loginUser = async (payload: loginPayload) => {
  const { email, password } = payload;

  const user = await prisma.tenant.findUnique({ where: { email } });

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

export const authService = { loginUser };
