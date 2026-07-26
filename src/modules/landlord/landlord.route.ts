import { Router } from "express";
import { Role } from "../../../prisma/generated/prisma/enums";
import auth from "../../middlewares/auth";
import { landlordController } from "./landlord.controller";
import { rentalController } from "../rental/rental.controller";

const router = Router();


router.post("/properties", auth(Role.LANDLORD), landlordController.createProperty);
router.put("/properties/:id", auth(Role.LANDLORD), landlordController.updateProperty);
router.delete("/properties/:id", auth(Role.LANDLORD), landlordController.deleteProperty);
router.patch("/properties/:id/availability", auth(Role.LANDLORD), landlordController.togglePropertyAvailability);


router.get("/requests", auth(Role.LANDLORD), rentalController.getLandlordRentalRequests);
router.patch("/requests/:id", auth(Role.LANDLORD), rentalController.updateRentalStatus);


router.post("/register", landlordController.createLandlord);
router.get("/:id", landlordController.getLandlordProfile);
router.patch("/:id", auth(Role.LANDLORD, Role.ADMIN), landlordController.updateLandlordProfile);

export const landlordRoutes = router;
