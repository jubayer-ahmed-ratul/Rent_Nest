import { Router } from "express";
import { tenantController } from "./tenant.controller";

const router = Router();

router.get("/", tenantController.getAllUsers);

export const tenantRoutes = router;
