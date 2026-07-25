import { Router } from "express";
import { landlordController } from "./landlord.controller";

const router = Router();

router.post("/register", landlordController.createLandlord);

export const landlordRoutes = router;
