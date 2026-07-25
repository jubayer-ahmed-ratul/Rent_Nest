import { Router } from "express";
import { Role } from "../../../prisma/generated/prisma/enums";
import auth from "../../middlewares/auth";
import { landlordController } from "./landlord.controller";

const router = Router();

router.post("/register", landlordController.createLandlord);
router.get("/:id", landlordController.getLandlordProfile);
router.patch(
  "/:id",
  auth(Role.LANDLORD, Role.ADMIN),
  landlordController.updateLandlordProfile,
);

export const landlordRoutes = router;
