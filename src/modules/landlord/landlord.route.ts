import { Router } from "express";
import { Role } from "../../../prisma/generated/prisma/enums";
import auth from "../../middlewares/auth";
import { landlordController } from "./landlord.controller";
import { rentalController } from "../rental/rental.controller";

const router = Router();

// property management routes (must be before /:id)
router.post("/properties", auth(Role.LANDLORD), landlordController.createProperty);
router.put("/properties/:id", auth(Role.LANDLORD), landlordController.updateProperty);
router.delete("/properties/:id", auth(Role.LANDLORD), landlordController.deleteProperty);

// rental request routes
router.get("/requests", auth(Role.LANDLORD), rentalController.getLandlordRentalRequests);
router.patch("/requests/:id", auth(Role.LANDLORD), rentalController.updateRentalStatus);

// profile routes
router.post("/register", landlordController.createLandlord);
router.get("/:id", landlordController.getLandlordProfile);
router.patch("/:id", auth(Role.LANDLORD, Role.ADMIN), landlordController.updateLandlordProfile);

export const landlordRoutes = router;
