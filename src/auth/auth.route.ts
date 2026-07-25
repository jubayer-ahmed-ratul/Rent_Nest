import { Router } from "express";
import { Role } from "../../prisma/generated/prisma/enums";
import auth from "../middlewares/auth";
import { authController } from "./auth.controller";

const router = Router();

router.post("/login", authController.loginUser);
router.get("/me", auth(Role.TENANT, Role.LANDLORD, Role.ADMIN), authController.getMe);

export const authRoutes = router;
