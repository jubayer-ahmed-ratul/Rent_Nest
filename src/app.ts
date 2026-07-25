import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
import { tenantRoutes } from "./modules/tenant/tenant.route";
import { landlordRoutes } from "./modules/landlord/landlord.route";
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
app.use("/api/tenants", tenantRoutes);
app.use("/api/landlords", landlordRoutes);
app.use("/api/auth", authRoutes);

export default app;
