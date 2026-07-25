import { Router } from "express";
import { Role } from "../../../prisma/generated/prisma/enums";
import auth from "../../middlewares/auth";
import { rentalController } from "./rental.controller";

const router = Router();

router.post("/", auth(Role.TENANT), rentalController.createRentalRequest);
router.get("/", auth(Role.TENANT, Role.LANDLORD), rentalController.getMyRentalRequests);
router.get("/:id", auth(Role.TENANT, Role.LANDLORD), rentalController.getRentalRequestById);

export const rentalRoutes = router;
