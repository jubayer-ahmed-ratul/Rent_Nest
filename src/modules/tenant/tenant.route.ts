import { Router } from "express";
import { Role } from "../../../prisma/generated/prisma/enums";
import auth from "../../middlewares/auth";
import { tenantController } from "./tenant.controller";

const router = Router();

router.get("/", tenantController.getAllUsers);
router.patch("/profile", auth(Role.TENANT), tenantController.updateMyProfile);

export const tenantRoutes = router;
