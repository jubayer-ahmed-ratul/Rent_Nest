import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
import { tenantRoutes } from "./modules/tenant/tenant.route";
import { landlordRoutes } from "./modules/landlord/landlord.route";
import { propertyRoutes } from "./modules/property/property.route";
import { categoryRoutes } from "./modules/category/category.route";
import { rentalRoutes } from "./modules/rental/rental.route";
import { reviewRoutes } from "./modules/review/review.route";
import { adminRoutes } from "./modules/admin/admin.route";
import { paymentRoutes } from "./modules/payment/payment.route";
import { authRoutes } from "./auth/auth.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
  res.send("hello world!");
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/landlords", landlordRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

export default app;
