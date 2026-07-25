import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
import httpStatus from "http-status";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("hello world!");
});

//USER REGISTRATION
app.post("/api/tenants/register", async (req: Request, res: Response) => {
  const { name, email, password, profileImage } = req.body;

  const isUserExist = await prisma.tenant.findUnique({
    where: { email },
  });

  if (isUserExist) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_round),
  );

  //USER CREATE
  const createdUser = await prisma.tenant.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  //profile create
  await prisma.profile.create({
    data: {
      tenantId: createdUser.id,
      fullName: name,
      profileImage,
    },
  });

  const user = await prisma.tenant.findUnique({
    where: {
      id: createdUser.id,
    },
    omit:{
      password:true
    },
    include:{
      profile:true
    }
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    statusCode: httpStatus.CREATED,
    message: "user registered successfully",
    data: {
      user,
    },
  });
});
export default app;
