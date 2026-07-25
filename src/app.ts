import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
import httpStatus  from "http-status";

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

app.get("/", (req, res) => {
  res.send("hello world!");
});



//USER REGISTRATION
app.post("/api/tenants/register",async(req:Request,res:Response)=>{
  const payload=req.body;
  console.log((payload));

  res.status(httpStatus.CREATED).json({
    message:"User registered successfully"
  });
})
export default app;
