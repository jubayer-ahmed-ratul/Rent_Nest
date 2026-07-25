import { Router } from "express";
import { tenantController } from "./tenant.controller";

const router = Router();

router.post("/register", tenantController.registerUser);

export const tenantRoutes = router;
