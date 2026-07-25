import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { loginPayload } from "./auth.interface";

const loginUser = async (payload: loginPayload) => {
  const { email, password } = payload;

  // check user exists
  const user = await prisma.tenant.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // check account status
  if (user.status === "BLOCKED") {
    throw new Error("Your account has been blocked");
  }

  if (user.isDeleted) {
    throw new Error("Account not found");
  }

  // verify password
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const authService = {
  loginUser,
};
