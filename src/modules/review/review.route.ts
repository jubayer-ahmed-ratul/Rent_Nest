import { Router } from "express";
import { Role } from "../../../prisma/generated/prisma/enums";
import auth from "../../middlewares/auth";
import { reviewController } from "./review.controller";

const router = Router();

router.post("/", auth(Role.TENANT), reviewController.createReview);

export const reviewRoutes = router;
