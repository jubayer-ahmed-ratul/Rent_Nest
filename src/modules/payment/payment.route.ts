import { Router } from "express";
import { Role } from "../../../prisma/generated/prisma/enums";
import auth from "../../middlewares/auth";
import { paymentController } from "./payment.controller";

const router = Router();

router.post("/create", auth(Role.TENANT), paymentController.createPayment);
router.post("/confirm", paymentController.confirmPayment);
router.get("/", auth(Role.TENANT), paymentController.getMyPayments);
router.get("/:id", auth(Role.TENANT), paymentController.getPaymentById);

export const paymentRoutes = router;
