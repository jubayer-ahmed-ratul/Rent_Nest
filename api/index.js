// src/app.ts
import express from "express";
import cors from "cors";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config_default = {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  app_url: process.env.APP_URL,
  bcrypt_salt_round: process.env.BCRYPT_SALT_ROUND,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expire_in: process.env.JWT_ACCESS_EXPIRE_IN,
  jwt_refresh_expire_in: process.env.JWT_REFRESH_EXPIRE_IN,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY
};

// src/app.ts
import cookieParser from "cookie-parser";

// src/modules/tenant/tenant.route.ts
import { Router } from "express";

// prisma/generated/prisma/enums.ts
var Role = {
  TENANT: "TENANT",
  LANDLORD: "LANDLORD",
  ADMIN: "ADMIN"
};

// src/middlewares/auth.ts
import httpStatus from "http-status";

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};
var verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
var jwtHelpers = {
  generateToken,
  verifyToken
};

// src/middlewares/auth.ts
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          statusCode: httpStatus.UNAUTHORIZED,
          message: "You are not authorized"
        });
      }
      const decoded = jwtHelpers.verifyToken(
        token,
        config_default.jwt_access_secret
      );
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          statusCode: httpStatus.FORBIDDEN,
          message: "You do not have permission to access this resource"
        });
      }
      next();
    } catch {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: "Invalid or expired token"
      });
    }
  };
};
var auth_default = auth;

// src/modules/tenant/tenant.controller.ts
import httpStatus3 from "http-status";

// src/utils/catchAsync.ts
import httpStatus2 from "http-status";
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      res.status(httpStatus2.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: httpStatus2.INTERNAL_SERVER_ERROR,
        message: "failed to register user",
        error: error.message
      });
    }
  };
};

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data
  });
};
var sendResponse_default = sendResponse;

// src/modules/tenant/tenant.service.ts
import bcrypt from "bcryptjs";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// prisma/generated/prisma/client.ts
import * as path2 from "path";
import { fileURLToPath } from "url";

// prisma/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.9.0",
  "engineVersion": "e922089b7d7502aff4249d5da3420f6fa55fc6ad",
  "activeProvider": "postgresql",
  "inlineSchema": 'model Category {\n  id          String  @id @default(cuid())\n  name        String  @unique\n  description String?\n\n  properties Property[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nenum Role {\n  TENANT\n  LANDLORD\n  ADMIN\n}\n\nenum Status {\n  ACTIVE\n  BLOCKED\n}\n\nmodel Landlord {\n  id       String @id @default(cuid())\n  name     String\n  email    String @unique\n  password String\n\n  phone        String?\n  address      String?\n  profileImage String?\n\n  role   Role   @default(LANDLORD)\n  status Status @default(ACTIVE)\n\n  isDeleted Boolean @default(false)\n\n  properties Property[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nenum PaymentStatus {\n  PENDING\n  COMPLETED\n  FAILED\n}\n\nenum PaymentProvider {\n  STRIPE\n  SSLCOMMERZ\n}\n\nmodel Payment {\n  id String @id @default(cuid())\n\n  rentalRequestId String        @unique\n  rentalRequest   RentalRequest @relation(fields: [rentalRequestId], references: [id], onDelete: Cascade)\n\n  tenantId String\n  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)\n\n  amount        Float\n  currency      String          @default("usd")\n  provider      PaymentProvider @default(STRIPE)\n  transactionId String?\n  status        PaymentStatus   @default(PENDING)\n\n  paidAt DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel Profile {\n  id String @id @default(cuid())\n\n  tenantId String @unique\n  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)\n\n  fullName     String\n  phone        String?\n  address      String?\n  profileImage String?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel Property {\n  id String @id @default(cuid())\n\n  landlordId String\n  landlord   Landlord @relation(fields: [landlordId], references: [id], onDelete: Cascade)\n\n  categoryId String\n  category   Category @relation(fields: [categoryId], references: [id])\n\n  title       String\n  description String\n  location    String\n  price       Float\n  bedrooms    Int\n  bathrooms   Int\n  area        Float?\n  images      String[]\n  amenities   String[]\n\n  isAvailable Boolean @default(true)\n  isDeleted   Boolean @default(false)\n\n  rentalRequests RentalRequest[]\n  reviews        Review[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nenum RentalStatus {\n  PENDING\n  APPROVED\n  REJECTED\n  ACTIVE\n  COMPLETED\n}\n\nmodel RentalRequest {\n  id String @id @default(cuid())\n\n  tenantId String\n  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)\n\n  propertyId String\n  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)\n\n  status  RentalStatus @default(PENDING)\n  message String?\n\n  payment Payment?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel Review {\n  id String @id @default(cuid())\n\n  tenantId String\n  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)\n\n  propertyId String\n  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)\n\n  rating  Int\n  comment String?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Tenant {\n  id       String @id @default(cuid())\n  name     String\n  email    String @unique\n  password String\n\n  phone        String?\n  address      String?\n  profileImage String?\n\n  role   Role   @default(TENANT)\n  status Status @default(ACTIVE)\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  profile        Profile?\n  rentalRequests RentalRequest[]\n  reviews        Review[]\n  payments       Payment[]\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"properties","kind":"object","type":"Property","relationName":"CategoryToProperty"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Landlord":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"profileImage","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"Status"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"properties","kind":"object","type":"Property","relationName":"LandlordToProperty"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"rentalRequestId","kind":"scalar","type":"String"},{"name":"rentalRequest","kind":"object","type":"RentalRequest","relationName":"PaymentToRentalRequest"},{"name":"tenantId","kind":"scalar","type":"String"},{"name":"tenant","kind":"object","type":"Tenant","relationName":"PaymentToTenant"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"currency","kind":"scalar","type":"String"},{"name":"provider","kind":"enum","type":"PaymentProvider"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Profile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tenantId","kind":"scalar","type":"String"},{"name":"tenant","kind":"object","type":"Tenant","relationName":"ProfileToTenant"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"profileImage","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Property":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"landlordId","kind":"scalar","type":"String"},{"name":"landlord","kind":"object","type":"Landlord","relationName":"LandlordToProperty"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToProperty"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"location","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"bedrooms","kind":"scalar","type":"Int"},{"name":"bathrooms","kind":"scalar","type":"Int"},{"name":"area","kind":"scalar","type":"Float"},{"name":"images","kind":"scalar","type":"String"},{"name":"amenities","kind":"scalar","type":"String"},{"name":"isAvailable","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"rentalRequests","kind":"object","type":"RentalRequest","relationName":"PropertyToRentalRequest"},{"name":"reviews","kind":"object","type":"Review","relationName":"PropertyToReview"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"RentalRequest":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tenantId","kind":"scalar","type":"String"},{"name":"tenant","kind":"object","type":"Tenant","relationName":"RentalRequestToTenant"},{"name":"propertyId","kind":"scalar","type":"String"},{"name":"property","kind":"object","type":"Property","relationName":"PropertyToRentalRequest"},{"name":"status","kind":"enum","type":"RentalStatus"},{"name":"message","kind":"scalar","type":"String"},{"name":"payment","kind":"object","type":"Payment","relationName":"PaymentToRentalRequest"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tenantId","kind":"scalar","type":"String"},{"name":"tenant","kind":"object","type":"Tenant","relationName":"ReviewToTenant"},{"name":"propertyId","kind":"scalar","type":"String"},{"name":"property","kind":"object","type":"Property","relationName":"PropertyToReview"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Tenant":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"profileImage","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"Status"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"profile","kind":"object","type":"Profile","relationName":"ProfileToTenant"},{"name":"rentalRequests","kind":"object","type":"RentalRequest","relationName":"RentalRequestToTenant"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToTenant"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToTenant"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","properties","_count","landlord","category","tenant","profile","rentalRequests","property","reviews","rentalRequest","payments","payment","Category.findUnique","Category.findUniqueOrThrow","Category.findFirst","Category.findFirstOrThrow","Category.findMany","data","Category.createOne","Category.createMany","Category.createManyAndReturn","Category.updateOne","Category.updateMany","Category.updateManyAndReturn","create","update","Category.upsertOne","Category.deleteOne","Category.deleteMany","having","_min","_max","Category.groupBy","Category.aggregate","Landlord.findUnique","Landlord.findUniqueOrThrow","Landlord.findFirst","Landlord.findFirstOrThrow","Landlord.findMany","Landlord.createOne","Landlord.createMany","Landlord.createManyAndReturn","Landlord.updateOne","Landlord.updateMany","Landlord.updateManyAndReturn","Landlord.upsertOne","Landlord.deleteOne","Landlord.deleteMany","Landlord.groupBy","Landlord.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","_avg","_sum","Payment.groupBy","Payment.aggregate","Profile.findUnique","Profile.findUniqueOrThrow","Profile.findFirst","Profile.findFirstOrThrow","Profile.findMany","Profile.createOne","Profile.createMany","Profile.createManyAndReturn","Profile.updateOne","Profile.updateMany","Profile.updateManyAndReturn","Profile.upsertOne","Profile.deleteOne","Profile.deleteMany","Profile.groupBy","Profile.aggregate","Property.findUnique","Property.findUniqueOrThrow","Property.findFirst","Property.findFirstOrThrow","Property.findMany","Property.createOne","Property.createMany","Property.createManyAndReturn","Property.updateOne","Property.updateMany","Property.updateManyAndReturn","Property.upsertOne","Property.deleteOne","Property.deleteMany","Property.groupBy","Property.aggregate","RentalRequest.findUnique","RentalRequest.findUniqueOrThrow","RentalRequest.findFirst","RentalRequest.findFirstOrThrow","RentalRequest.findMany","RentalRequest.createOne","RentalRequest.createMany","RentalRequest.createManyAndReturn","RentalRequest.updateOne","RentalRequest.updateMany","RentalRequest.updateManyAndReturn","RentalRequest.upsertOne","RentalRequest.deleteOne","RentalRequest.deleteMany","RentalRequest.groupBy","RentalRequest.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","Tenant.findUnique","Tenant.findUniqueOrThrow","Tenant.findFirst","Tenant.findFirstOrThrow","Tenant.findMany","Tenant.createOne","Tenant.createMany","Tenant.createManyAndReturn","Tenant.updateOne","Tenant.updateMany","Tenant.updateManyAndReturn","Tenant.upsertOne","Tenant.deleteOne","Tenant.deleteMany","Tenant.groupBy","Tenant.aggregate","AND","OR","NOT","id","name","email","password","phone","address","profileImage","Role","role","Status","status","isDeleted","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","every","some","none","tenantId","propertyId","rating","comment","RentalStatus","message","landlordId","categoryId","title","description","location","price","bedrooms","bathrooms","area","images","amenities","isAvailable","has","hasEvery","hasSome","fullName","rentalRequestId","amount","currency","PaymentProvider","provider","transactionId","PaymentStatus","paidAt","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","push","increment","decrement","multiply","divide"]'),
  graph: "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_AQEArwIAIQIAAAABACAUAAArACAFmgEBAK4CACGbAQEArgIAIaYBQACzAgAhpwFAALMCACG_AQEArwIAIQIAAAAhACAUAAAtACACAAAAIQAgFAAALQAgAwAAAAEAIBsAACYAIBwAACsAIAEAAAABACABAAAAIQAgBAQAAMsDACAhAADNAwAgIgAAzAMAIL8BAACqAgAgCJcBAACYAgAwmAEAADQAEJkBAACYAgAwmgEBANoBACGbAQEA2gEAIaYBQADfAQAhpwFAAN8BACG_AQEA2wEAIQMAAAAhACABAAAzADAgAAA0ACADAAAAIQAgAQAAIgAwAgAAAQAgEAMAAJcCACCXAQAAlgIAMJgBAAA6ABCZAQAAlgIAMJoBAQAAAAGbAQEA7wEAIZwBAQAAAAGdAQEA7wEAIZ4BAQDwAQAhnwEBAPABACGgAQEA8AEAIaIBAADxAaIBIqQBAADyAaQBIqUBIADzAQAhpgFAAPQBACGnAUAA9AEAIQEAAAA3ACABAAAANwAgEAMAAJcCACCXAQAAlgIAMJgBAAA6ABCZAQAAlgIAMJoBAQDvAQAhmwEBAO8BACGcAQEA7wEAIZ0BAQDvAQAhngEBAPABACGfAQEA8AEAIaABAQDwAQAhogEAAPEBogEipAEAAPIBpAEipQEgAPMBACGmAUAA9AEAIacBQAD0AQAhBAMAAMoDACCeAQAAqgIAIJ8BAACqAgAgoAEAAKoCACADAAAAOgAgAQAAOwAwAgAANwAgAwAAADoAIAEAADsAMAIAADcAIAMAAAA6ACABAAA7ADACAAA3ACANAwAAyQMAIJoBAQAAAAGbAQEAAAABnAEBAAAAAZ0BAQAAAAGeAQEAAAABnwEBAAAAAaABAQAAAAGiAQAAAKIBAqQBAAAApAECpQEgAAAAAaYBQAAAAAGnAUAAAAABARQAAD8AIAyaAQEAAAABmwEBAAAAAZwBAQAAAAGdAQEAAAABngEBAAAAAZ8BAQAAAAGgAQEAAAABogEAAACiAQKkAQAAAKQBAqUBIAAAAAGmAUAAAAABpwFAAAAAAQEUAABBADABFAAAQQAwDQMAALwDACCaAQEArgIAIZsBAQCuAgAhnAEBAK4CACGdAQEArgIAIZ4BAQCvAgAhnwEBAK8CACGgAQEArwIAIaIBAACwAqIBIqQBAACxAqQBIqUBIACyAgAhpgFAALMCACGnAUAAswIAIQIAAAA3ACAUAABEACAMmgEBAK4CACGbAQEArgIAIZwBAQCuAgAhnQEBAK4CACGeAQEArwIAIZ8BAQCvAgAhoAEBAK8CACGiAQAAsAKiASKkAQAAsQKkASKlASAAsgIAIaYBQACzAgAhpwFAALMCACECAAAAOgAgFAAARgAgAgAAADoAIBQAAEYAIAMAAAA3ACAbAAA_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_AQEArgIAIcABAQCuAgAhwQEIAMICACHCAQIA1AIAIcMBAgDUAgAhxAEIAI8DACHFAQAAkAMAIMYBAACRAwAgxwEgALICACECAAAABQAgFAAAiAEAIBCaAQEArgIAIaUBIACyAgAhpgFAALMCACGnAUAAswIAIbwBAQCuAgAhvQEBAK4CACG-AQEArgIAIb8BAQCuAgAhwAEBAK4CACHBAQgAwgIAIcIBAgDUAgAhwwECANQCACHEAQgAjwMAIcUBAACQAwAgxgEAAJEDACDHASAAsgIAIQIAAAADACAUAACKAQAgAgAAAAMAIBQAAIoBACADAAAABQAgGwAAgwEAIBwAAIgBACABAAAABQAgAQAAAAMAIAYEAACKAwAgIQAAjQMAICIAAIwDACBDAACLAwAgRAAAjgMAIMQBAACqAgAgE5cBAACBAgAwmAEAAJEBABCZAQAAgQIAMJoBAQDaAQAhpQEgAN4BACGmAUAA3wEAIacBQADfAQAhvAEBANoBACG9AQEA2gEAIb4BAQDaAQAhvwEBANoBACHAAQEA2gEAIcEBCACCAgAhwgECAPoBACHDAQIA-gEAIcQBCACDAgAhxQEAAIQCACDGAQAAhAIAIMcBIADeAQAhAwAAAAMAIAEAAJABADAgAACRAQAgAwAAAAMAIAEAAAQAMAIAAAUAIAEAAAALACABAAAACwAgAwAAAAkAIAEAAAoAMAIAAAsAIAMAAAAJACABAAAKADACAAALACADAAAACQAgAQAACgAwAgAACwAgCgcAAIkDACAKAADvAgAgDgAA8AIAIJoBAQAAAAGkAQAAALsBAqYBQAAAAAGnAUAAAAABtgEBAAAAAbcBAQAAAAG7AQEAAAABARQAAJkBACAHmgEBAAAAAaQBAAAAuwECpgFAAAAAAacBQAAAAAG2AQEAAAABtwEBAAAAAbsBAQAAAAEBFAAAmwEAMAEUAACbAQAwCgcAAIgDACAKAADlAgAgDgAA5gIAIJoBAQCuAgAhpAEAAOMCuwEipgFAALMCACGnAUAAswIAIbYBAQCuAgAhtwEBAK4CACG7AQEArwIAIQIAAAALACAUAACeAQAgB5oBAQCuAgAhpAEAAOMCuwEipgFAALMCACGnAUAAswIAIbYBAQCuAgAhtwEBAK4CACG7AQEArwIAIQIAAAAJACAUAACgAQAgAgAAAAkAIBQAAKABACADAAAACwAgGwAAmQEAIBwAAJ4BACABAAAACwAgAQAAAAkAIAQEAACFAwAgIQAAhwMAICIAAIYDACC7AQAAqgIAIAqXAQAA_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_AEAIEQAAOEBACCoAQIAAAABqQECAAAABKoBAgAAAASrAQIAAAABrAECAAAAAa0BAgAAAAGuAQIAAAABrwECAPsBACENBAAA4QEAICEAAOEBACAiAADhAQAgQwAA_AEAIEQAAOEBACCoAQIAAAABqQECAAAABKoBAgAAAASrAQIAAAABrAECAAAAAa0BAgAAAAGuAQIAAAABrwECAPsBACEIqAEIAAAAAakBCAAAAASqAQgAAAAEqwEIAAAAAawBCAAAAAGtAQgAAAABrgEIAAAAAa8BCAD8AQAhCpcBAAD9AQAwmAEAAKcBABCZAQAA_QEAMJoBAQDaAQAhpAEAAP4BuwEipgFAAN8BACGnAUAA3wEAIbYBAQDaAQAhtwEBANoBACG7AQEA2wEAIQcEAADhAQAgIQAAgAIAICIAAIACACCoAQAAALsBAqkBAAAAuwEIqgEAAAC7AQivAQAA_wG7ASIHBAAA4QEAICEAAIACACAiAACAAgAgqAEAAAC7AQKpAQAAALsBCKoBAAAAuwEIrwEAAP8BuwEiBKgBAAAAuwECqQEAAAC7AQiqAQAAALsBCK8BAACAArsBIhOXAQAAgQIAMJgBAACRAQAQmQEAAIECADCaAQEA2gEAIaUBIADeAQAhpgFAAN8BACGnAUAA3wEAIbwBAQDaAQAhvQEBANoBACG-AQEA2gEAIb8BAQDaAQAhwAEBANoBACHBAQgAggIAIcIBAgD6AQAhwwECAPoBACHEAQgAgwIAIcUBAACEAgAgxgEAAIQCACDHASAA3gEAIQ0EAADhAQAgIQAA_AEAICIAAPwBACBDAAD8AQAgRAAA_AEAIKgBCAAAAAGpAQgAAAAEqgEIAAAABKsBCAAAAAGsAQgAAAABrQEIAAAAAa4BCAAAAAGvAQgAhwIAIQ0EAADqAQAgIQAAhgIAICIAAIYCACBDAACGAgAgRAAAhgIAIKgBCAAAAAGpAQgAAAAFqgEIAAAABasBCAAAAAGsAQgAAAABrQEIAAAAAa4BCAAAAAGvAQgAhQIAIQSoAQEAAAAFyAEBAAAAAckBAQAAAATKAQEAAAAEDQQAAOoBACAhAACGAgAgIgAAhgIAIEMAAIYCACBEAACGAgAgqAEIAAAAAakBCAAAAAWqAQgAAAAFqwEIAAAAAawBCAAAAAGtAQgAAAABrgEIAAAAAa8BCACFAgAhCKgBCAAAAAGpAQgAAAAFqgEIAAAABasBCAAAAAGsAQgAAAABrQEIAAAAAa4BCAAAAAGvAQgAhgIAIQ0EAADhAQAgIQAA_AEAICIAAPwBACBDAAD8AQAgRAAA_AEAIKgBCAAAAAGpAQgAAAAEqgEIAAAABKsBCAAAAAGsAQgAAAABrQEIAAAAAa4BCAAAAAGvAQgAhwIAIQuXAQAAiAIAMJgBAAB7ABCZAQAAiAIAMJoBAQDaAQAhngEBANsBACGfAQEA2wEAIaABAQDbAQAhpgFAAN8BACGnAUAA3wEAIbYBAQDaAQAhywEBANoBACEMBwAAigIAIJcBAACJAgAwmAEAAA0AEJkBAACJAgAwmgEBAO8BACGeAQEA8AEAIZ8BAQDwAQAhoAEBAPABACGmAUAA9AEAIacBQAD0AQAhtgEBAO8BACHLAQEA7wEAIRUIAAD1AQAgCQAA9gEAIAsAAPcBACANAAD4AQAglwEAAO4BADCYAQAAwwEAEJkBAADuAQAwmgEBAO8BACGbAQEA7wEAIZwBAQDvAQAhnQEBAO8BACGeAQEA8AEAIZ8BAQDwAQAhoAEBAPABACGiAQAA8QGiASKkAQAA8gGkASKlASAA8wEAIaYBQAD0AQAhpwFAAPQBACHUAQAAwwEAINUBAADDAQAgDpcBAACLAgAwmAEAAGMAEJkBAACLAgAwmgEBANoBACGkAQAAjQLTASKmAUAA3wEAIacBQADfAQAhtgEBANoBACHMAQEA2gEAIc0BCACCAgAhzgEBANoBACHQAQAAjALQASLRAQEA2wEAIdMBQACOAgAhBwQAAOEBACAhAACUAgAgIgAAlAIAIKgBAAAA0AECqQEAAADQAQiqAQAAANABCK8BAACTAtABIgcEAADhAQAgIQAAkgIAICIAAJICACCoAQAAANMBAqkBAAAA0wEIqgEAAADTAQivAQAAkQLTASILBAAA6gEAICEAAJACACAiAACQAgAgqAFAAAAAAakBQAAAAAWqAUAAAAAFqwFAAAAAAawBQAAAAAGtAUAAAAABrgFAAAAAAa8BQACPAgAhCwQAAOoBACAhAACQAgAgIgAAkAIAIKgBQAAAAAGpAUAAAAAFqgFAAAAABasBQAAAAAGsAUAAAAABrQFAAAAAAa4BQAAAAAGvAUAAjwIAIQioAUAAAAABqQFAAAAABaoBQAAAAAWrAUAAAAABrAFAAAAAAa0BQAAAAAGuAUAAAAABrwFAAJACACEHBAAA4QEAICEAAJICACAiAACSAgAgqAEAAADTAQKpAQAAANMBCKoBAAAA0wEIrwEAAJEC0wEiBKgBAAAA0wECqQEAAADTAQiqAQAAANMBCK8BAACSAtMBIgcEAADhAQAgIQAAlAIAICIAAJQCACCoAQAAANABAqkBAAAA0AEIqgEAAADQAQivAQAAkwLQASIEqAEAAADQAQKpAQAAANABCKoBAAAA0AEIrwEAAJQC0AEiD5cBAACVAgAwmAEAAE0AEJkBAACVAgAwmgEBANoBACGbAQEA2gEAIZwBAQDaAQAhnQEBANoBACGeAQEA2wEAIZ8BAQDbAQAhoAEBANsBACGiAQAA3AGiASKkAQAA3QGkASKlASAA3gEAIaYBQADfAQAhpwFAAN8BACEQAwAAlwIAIJcBAACWAgAwmAEAADoAEJkBAACWAgAwmgEBAO8BACGbAQEA7wEAIZwBAQDvAQAhnQEBAO8BACGeAQEA8AEAIZ8BAQDwAQAhoAEBAPABACGiAQAA8QGiASKkAQAA8gGkASKlASAA8wEAIaYBQAD0AQAhpwFAAPQBACEDswEAAAMAILQBAAADACC1AQAAAwAgCJcBAACYAgAwmAEAADQAEJkBAACYAgAwmgEBANoBACGbAQEA2gEAIaYBQADfAQAhpwFAAN8BACG_AQEA2wEAIQkDAACXAgAglwEAAJkCADCYAQAAIQAQmQEAAJkCADCaAQEA7wEAIZsBAQDvAQAhpgFAAPQBACGnAUAA9AEAIb8BAQDwAQAhEAcAAIoCACAMAACfAgAglwEAAJoCADCYAQAAFAAQmQEAAJoCADCaAQEA7wEAIaQBAACdAtMBIqYBQAD0AQAhpwFAAPQBACG2AQEA7wEAIcwBAQDvAQAhzQEIAJsCACHOAQEA7wEAIdABAACcAtABItEBAQDwAQAh0wFAAJ4CACEIqAEIAAAAAakBCAAAAASqAQgAAAAEqwEIAAAAAawBCAAAAAGtAQgAAAABrgEIAAAAAa8BCAD8AQAhBKgBAAAA0AECqQEAAADQAQiqAQAAANABCK8BAACUAtABIgSoAQAAANMBAqkBAAAA0wEIqgEAAADTAQivAQAAkgLTASIIqAFAAAAAAakBQAAAAAWqAUAAAAAFqwFAAAAAAawBQAAAAAGtAUAAAAABrgFAAAAAAa8BQACQAgAhDwcAAIoCACAKAACiAgAgDgAApQIAIJcBAACjAgAwmAEAAAkAEJkBAACjAgAwmgEBAO8BACGkAQAApAK7ASKmAUAA9AEAIacBQAD0AQAhtgEBAO8BACG3AQEA7wEAIbsBAQDwAQAh1AEAAAkAINUBAAAJACAMBwAAigIAIAoAAKICACCXAQAAoAIAMJgBAAAQABCZAQAAoAIAMJoBAQDvAQAhpgFAAPQBACGnAUAA9AEAIbYBAQDvAQAhtwEBAO8BACG4AQIAoQIAIbkBAQDwAQAhCKgBAgAAAAGpAQIAAAAEqgECAAAABKsBAgAAAAGsAQIAAAABrQECAAAAAa4BAgAAAAGvAQIA4QEAIRkFAACoAgAgBgAAqQIAIAkAAPYBACALAAD3AQAglwEAAKYCADCYAQAAAwAQmQEAAKYCADCaAQEA7wEAIaUBIADzAQAhpgFAAPQBACGnAUAA9AEAIbwBAQDvAQAhvQEBAO8BACG-AQEA7wEAIb8BAQDvAQAhwAEBAO8BACHBAQgAmwIAIcIBAgChAgAhwwECAKECACHEAQgApwIAIcUBAACEAgAgxgEAAIQCACDHASAA8wEAIdQBAAADACDVAQAAAwAgDQcAAIoCACAKAACiAgAgDgAApQIAIJcBAACjAgAwmAEAAAkAEJkBAACjAgAwmgEBAO8BACGkAQAApAK7ASKmAUAA9AEAIacBQAD0AQAhtgEBAO8BACG3AQEA7wEAIbsBAQDwAQAhBKgBAAAAuwECqQEAAAC7AQiqAQAAALsBCK8BAACAArsBIhIHAACKAgAgDAAAnwIAIJcBAACaAgAwmAEAABQAEJkBAACaAgAwmgEBAO8BACGkAQAAnQLTASKmAUAA9AEAIacBQAD0AQAhtgEBAO8BACHMAQEA7wEAIc0BCACbAgAhzgEBAO8BACHQAQAAnALQASLRAQEA8AEAIdMBQACeAgAh1AEAABQAINUBAAAUACAXBQAAqAIAIAYAAKkCACAJAAD2AQAgCwAA9wEAIJcBAACmAgAwmAEAAAMAEJkBAACmAgAwmgEBAO8BACGlASAA8wEAIaYBQAD0AQAhpwFAAPQBACG8AQEA7wEAIb0BAQDvAQAhvgEBAO8BACG_AQEA7wEAIcABAQDvAQAhwQEIAJsCACHCAQIAoQIAIcMBAgChAgAhxAEIAKcCACHFAQAAhAIAIMYBAACEAgAgxwEgAPMBACEIqAEIAAAAAakBCAAAAAWqAQgAAAAFqwEIAAAAAawBCAAAAAGtAQgAAAABrgEIAAAAAa8BCACGAgAhEgMAAJcCACCXAQAAlgIAMJgBAAA6ABCZAQAAlgIAMJoBAQDvAQAhmwEBAO8BACGcAQEA7wEAIZ0BAQDvAQAhngEBAPABACGfAQEA8AEAIaABAQDwAQAhogEAAPEBogEipAEAAPIBpAEipQEgAPMBACGmAUAA9AEAIacBQAD0AQAh1AEAADoAINUBAAA6ACALAwAAlwIAIJcBAACZAgAwmAEAACEAEJkBAACZAgAwmgEBAO8BACGbAQEA7wEAIaYBQAD0AQAhpwFAAPQBACG_AQEA8AEAIdQBAAAhACDVAQAAIQAgAAAAAAHZAQEAAAABAdkBAQAAAAEB2QEAAACiAQIB2QEAAACkAQIB2QEgAAAAAQHZAUAAAAABBxsAAPECACAcAAD0AgAg1gEAAPICACDXAQAA8wIAINoBAAANACDbAQAADQAg3AEAAGYAIAsbAADZAgAwHAAA3gIAMNYBAADaAgAw1wEAANsCADDYAQAA3AIAINkBAADdAgAw2gEAAN0CADDbAQAA3QIAMNwBAADdAgAw3QEAAN8CADDeAQAA4AIAMAsbAADKAgAwHAAAzwIAMNYBAADLAgAw1wEAAMwCADDYAQAAzQIAINkBAADOAgAw2gEAAM4CADDbAQAAzgIAMNwBAADOAgAw3QEAANACADDeAQAA0QIAMAsbAAC4AgAwHAAAvQIAMNYBAAC5AgAw1wEAALoCADDYAQAAuwIAINkBAAC8AgAw2gEAALwCADDbAQAAvAIAMNwBAAC8AgAw3QEAAL4CADDeAQAAvwIAMAsMAADJAgAgmgEBAAAAAaQBAAAA0wECpgFAAAAAAacBQAAAAAHMAQEAAAABzQEIAAAAAc4BAQAAAAHQAQAAANABAtEBAQAAAAHTAUAAAAABAgAAABYAIBsAAMgCACADAAAAFgAgGwAAyAIAIBwAAMYCACABFAAAkQQAMBAHAACKAgAgDAAAnwIAIJcBAACaAgAwmAEAABQAEJkBAACaAgAwmgEBAAAAAaQBAACdAtMBIqYBQAD0AQAhpwFAAPQBACG2AQEA7wEAIcwBAQAAAAHNAQgAmwIAIc4BAQDvAQAh0AEAAJwC0AEi0QEBAPABACHTAUAAngIAIQIAAAAWACAUAADGAgAgAgAAAMACACAUAADBAgAgDpcBAAC_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_wMAINwBAADAAQAgAxsAAP0DACDWAQAA_gMAINwBAADAAQAgCAoAAO8CACAOAADwAgAgmgEBAAAAAaQBAAAAuwECpgFAAAAAAacBQAAAAAG3AQEAAAABuwEBAAAAAQMbAAD7AwAg1gEAAPwDACDcAQAABQAgAxsAAOcCACDWAQAA6AIAINwBAAAWACAHmgEBAAAAAZ4BAQAAAAGfAQEAAAABoAEBAAAAAaYBQAAAAAGnAUAAAAABywEBAAAAAQIAAABmACAbAADxAgAgAwAAAA0AIBsAAPECACAcAAD1AgAgCQAAAA0AIBQAAPUCACCaAQEArgIAIZ4BAQCvAgAhnwEBAK8CACGgAQEArwIAIaYBQACzAgAhpwFAALMCACHLAQEArgIAIQeaAQEArgIAIZ4BAQCvAgAhnwEBAK8CACGgAQEArwIAIaYBQACzAgAhpwFAALMCACHLAQEArgIAIQMbAADxAgAg1gEAAPICACDcAQAAZgAgBBsAANkCADDWAQAA2gIAMNgBAADcAgAg3AEAAN0CADAEGwAAygIAMNYBAADLAgAw2AEAAM0CACDcAQAAzgIAMAQbAAC4AgAw1gEAALkCADDYAQAAuwIAINwBAAC8AgAwBAcAALMDACCeAQAAqgIAIJ8BAACqAgAgoAEAAKoCACAAAAAAAAAAAAUbAAD2AwAgHAAA-QMAINYBAAD3AwAg1wEAAPgDACDcAQAAwAEAIAMbAAD2AwAg1gEAAPcDACDcAQAAwAEAIAAAAAUbAADxAwAgHAAA9AMAINYBAADyAwAg1wEAAPMDACDcAQAAwAEAIAMbAADxAwAg1gEAAPIDACDcAQAAwAEAIAAAAAAABdkBCAAAAAHgAQgAAAAB4QEIAAAAAeIBCAAAAAHjAQgAAAABAtkBAQAAAATfAQEAAAAFAtkBAQAAAATfAQEAAAAFBRsAAOcDACAcAADvAwAg1gEAAOgDACDXAQAA7gMAINwBAAA3ACAFGwAA5QMAIBwAAOwDACDWAQAA5gMAINcBAADrAwAg3AEAAAEAIAsbAACfAwAwHAAAowMAMNYBAACgAwAw1wEAAKEDADDYAQAAogMAINkBAADdAgAw2gEAAN0CADDbAQAA3QIAMNwBAADdAgAw3QEAAKQDADDeAQAA4AIAMAsbAACWAwAwHAAAmgMAMNYBAACXAwAw1wEAAJgDADDYAQAAmQMAINkBAADOAgAw2gEAAM4CADDbAQAAzgIAMNwBAADOAgAw3QEAAJsDADDeAQAA0QIAMAcHAACEAwAgmgEBAAAAAaYBQAAAAAGnAUAAAAABtgEBAAAAAbgBAgAAAAG5AQEAAAABAgAAABIAIBsAAJ4DACADAAAAEgAgGwAAngMAIBwAAJ0DACABFAAA6gMAMAIAAAASACAUAACdAwAgAgAAANICACAUAACcAwAgBpoBAQCuAgAhpgFAALMCACGnAUAAswIAIbYBAQCuAgAhuAECANQCACG5AQEArwIAIQcHAACDAwAgmgEBAK4CACGmAUAAswIAIacBQACzAgAhtgEBAK4CACG4AQIA1AIAIbkBAQCvAgAhBwcAAIQDACCaAQEAAAABpgFAAAAAAacBQAAAAAG2AQEAAAABuAECAAAAAbkBAQAAAAEIBwAAiQMAIA4AAPACACCaAQEAAAABpAEAAAC7AQKmAUAAAAABpwFAAAAAAbYBAQAAAAG7AQEAAAABAgAAAAsAIBsAAKcDACADAAAACwAgGwAApwMAIBwAAKYDACABFAAA6QMAMAIAAAALACAUAACmAwAgAgAAAOECACAUAAClAwAgBpoBAQCuAgAhpAEAAOMCuwEipgFAALMCACGnAUAAswIAIbYBAQCuAgAhuwEBAK8CACEIBwAAiAMAIA4AAOYCACCaAQEArgIAIaQBAADjArsBIqYBQACzAgAhpwFAALMCACG2AQEArgIAIbsBAQCvAgAhCAcAAIkDACAOAADwAgAgmgEBAAAAAaQBAAAAuwECpgFAAAAAAacBQAAAAAG2AQEAAAABuwEBAAAAAQHZAQEAAAAEAdkBAQAAAAQDGwAA5wMAINYBAADoAwAg3AEAADcAIAMbAADlAwAg1gEAAOYDACDcAQAAAQAgBBsAAJ8DADDWAQAAoAMAMNgBAACiAwAg3AEAAN0CADAEGwAAlgMAMNYBAACXAwAw2AEAAJkDACDcAQAAzgIAMAAAAAUbAADgAwAgHAAA4wMAINYBAADhAwAg1wEAAOIDACDcAQAAwAEAIAMbAADgAwAg1gEAAOEDACDcAQAAwAEAIAcIAAD6AgAgCQAA-wIAIAsAAPwCACANAAD9AgAgngEAAKoCACCfAQAAqgIAIKABAACqAgAgAAAAAAAAAAALGwAAvQMAMBwAAMIDADDWAQAAvgMAMNcBAAC_AwAw2AEAAMADACDZAQAAwQMAMNoBAADBAwAw2wEAAMEDADDcAQAAwQMAMN0BAADDAwAw3gEAAMQDADASBgAAqwMAIAkAAKwDACALAACtAwAgmgEBAAAAAaUBIAAAAAGmAUAAAAABpwFAAAAAAb0BAQAAAAG-AQEAAAABvwEBAAAAAcABAQAAAAHBAQgAAAABwgECAAAAAcMBAgAAAAHEAQgAAAABxQEAAKgDACDGAQAAqQMAIMcBIAAAAAECAAAABQAgGwAAyAMAIAMAAAAFACAbAADIAwAgHAAAxwMAIAEUAADfAwAwFwUAAKgCACAGAACpAgAgCQAA9gEAIAsAAPcBACCXAQAApgIAMJgBAAADABCZAQAApgIAMJoBAQAAAAGlASAA8wEAIaYBQAD0AQAhpwFAAPQBACG8AQEA7wEAIb0BAQDvAQAhvgEBAO8BACG_AQEA7wEAIcABAQDvAQAhwQEIAJsCACHCAQIAoQIAIcMBAgChAgAhxAEIAKcCACHFAQAAhAIAIMYBAACEAgAgxwEgAPMBACECAAAABQAgFAAAxwMAIAIAAADFAwAgFAAAxgMAIBOXAQAAxAMAMJgBAADFAwAQmQEAAMQDADCaAQEA7wEAIaUBIADzAQAhpgFAAPQBACGnAUAA9AEAIbwBAQDvAQAhvQEBAO8BACG-AQEA7wEAIb8BAQDvAQAhwAEBAO8BACHBAQgAmwIAIcIBAgChAgAhwwECAKECACHEAQgApwIAIcUBAACEAgAgxgEAAIQCACDHASAA8wEAIROXAQAAxAMAMJgBAADFAwAQmQEAAMQDADCaAQEA7wEAIaUBIADzAQAhpgFAAPQBACGnAUAA9AEAIbwBAQDvAQAhvQEBAO8BACG-AQEA7wEAIb8BAQDvAQAhwAEBAO8BACHBAQgAmwIAIcIBAgChAgAhwwECAKECACHEAQgApwIAIcUBAACEAgAgxgEAAIQCACDHASAA8wEAIQ-aAQEArgIAIaUBIACyAgAhpgFAALMCACGnAUAAswIAIb0BAQCuAgAhvgEBAK4CACG_AQEArgIAIcABAQCuAgAhwQEIAMICACHCAQIA1AIAIcMBAgDUAgAhxAEIAI8DACHFAQAAkAMAIMYBAACRAwAgxwEgALICACESBgAAkwMAIAkAAJQDACALAACVAwAgmgEBAK4CACGlASAAsgIAIaYBQACzAgAhpwFAALMCACG9AQEArgIAIb4BAQCuAgAhvwEBAK4CACHAAQEArgIAIcEBCADCAgAhwgECANQCACHDAQIA1AIAIcQBCACPAwAhxQEAAJADACDGAQAAkQMAIMcBIACyAgAhEgYAAKsDACAJAACsAwAgCwAArQMAIJoBAQAAAAGlASAAAAABpgFAAAAAAacBQAAAAAG9AQEAAAABvgEBAAAAAb8BAQAAAAHAAQEAAAABwQEIAAAAAcIBAgAAAAHDAQIAAAABxAEIAAAAAcUBAACoAwAgxgEAAKkDACDHASAAAAABBBsAAL0DADDWAQAAvgMAMNgBAADAAwAg3AEAAMEDADAAAAAACxsAAM8DADAcAADTAwAw1gEAANADADDXAQAA0QMAMNgBAADSAwAg2QEAAMEDADDaAQAAwQMAMNsBAADBAwAw3AEAAMEDADDdAQAA1AMAMN4BAADEAwAwEgUAAKoDACAJAACsAwAgCwAArQMAIJoBAQAAAAGlASAAAAABpgFAAAAAAacBQAAAAAG8AQEAAAABvgEBAAAAAb8BAQAAAAHAAQEAAAABwQEIAAAAAcIBAgAAAAHDAQIAAAABxAEIAAAAAcUBAACoAwAgxgEAAKkDACDHASAAAAABAgAAAAUAIBsAANcDACADAAAABQAgGwAA1wMAIBwAANYDACABFAAA3gMAMAIAAAAFACAUAADWAwAgAgAAAMUDACAUAADVAwAgD5oBAQCuAgAhpQEgALICACGmAUAAswIAIacBQACzAgAhvAEBAK4CACG-AQEArgIAIb8BAQCuAgAhwAEBAK4CACHBAQgAwgIAIcIBAgDUAgAhwwECANQCACHEAQgAjwMAIcUBAACQAwAgxgEAAJEDACDHASAAsgIAIRIFAACSAwAgCQAAlAMAIAsAAJUDACCaAQEArgIAIaUBIACyAgAhpgFAALMCACGnAUAAswIAIbwBAQCuAgAhvgEBAK4CACG_AQEArgIAIcABAQCuAgAhwQEIAMICACHCAQIA1AIAIcMBAgDUAgAhxAEIAI8DACHFAQAAkAMAIMYBAACRAwAgxwEgALICACESBQAAqgMAIAkAAKwDACALAACtAwAgmgEBAAAAAaUBIAAAAAGmAUAAAAABpwFAAAAAAbwBAQAAAAG-AQEAAAABvwEBAAAAAcABAQAAAAHBAQgAAAABwgECAAAAAcMBAgAAAAHEAQgAAAABxQEAAKgDACDGAQAAqQMAIMcBIAAAAAEEGwAAzwMAMNYBAADQAwAw2AEAANIDACDcAQAAwQMAMAQHAACzAwAgCgAA2gMAIA4AANsDACC7AQAAqgIAIAUFAADcAwAgBgAA3QMAIAkAAPsCACALAAD8AgAgxAEAAKoCACAEBwAAswMAIAwAANkDACDRAQAAqgIAINMBAACqAgAgBAMAAMoDACCeAQAAqgIAIJ8BAACqAgAgoAEAAKoCACACAwAAygMAIL8BAACqAgAgD5oBAQAAAAGlASAAAAABpgFAAAAAAacBQAAAAAG8AQEAAAABvgEBAAAAAb8BAQAAAAHAAQEAAAABwQEIAAAAAcIBAgAAAAHDAQIAAAABxAEIAAAAAcUBAACoAwAgxgEAAKkDACDHASAAAAABD5oBAQAAAAGlASAAAAABpgFAAAAAAacBQAAAAAG9AQEAAAABvgEBAAAAAb8BAQAAAAHAAQEAAAABwQEIAAAAAcIBAgAAAAHDAQIAAAABxAEIAAAAAcUBAACoAwAgxgEAAKkDACDHASAAAAABDwkAAPcCACALAAD4AgAgDQAA-QIAIJoBAQAAAAGbAQEAAAABnAEBAAAAAZ0BAQAAAAGeAQEAAAABnwEBAAAAAaABAQAAAAGiAQAAAKIBAqQBAAAApAECpQEgAAAAAaYBQAAAAAGnAUAAAAABAgAAAMABACAbAADgAwAgAwAAAMMBACAbAADgAwAgHAAA5AMAIBEAAADDAQAgCQAAtQIAIAsAALYCACANAAC3AgAgFAAA5AMAIJoBAQCuAgAhmwEBAK4CACGcAQEArgIAIZ0BAQCuAgAhngEBAK8CACGfAQEArwIAIaABAQCvAgAhogEAALACogEipAEAALECpAEipQEgALICACGmAUAAswIAIacBQACzAgAhDwkAALUCACALAAC2AgAgDQAAtwIAIJoBAQCuAgAhmwEBAK4CACGcAQEArgIAIZ0BAQCuAgAhngEBAK8CACGfAQEArwIAIaABAQCvAgAhogEAALACogEipAEAALECpAEipQEgALICACGmAUAAswIAIacBQACzAgAhBZoBAQAAAAGbAQEAAAABpgFAAAAAAacBQAAAAAG_AQEAAAABAgAAAAEAIBsAAOUDACAMmgEBAAAAAZsBAQAAAAGcAQEAAAABnQEBAAAAAZ4BAQAAAAGfAQEAAAABoAEBAAAAAaIBAAAAogECpAEAAACkAQKlASAAAAABpgFAAAAAAacBQAAAAAECAAAANwAgGwAA5wMAIAaaAQEAAAABpAEAAAC7AQKmAUAAAAABpwFAAAAAAbYBAQAAAAG7AQEAAAABBpoBAQAAAAGmAUAAAAABpwFAAAAAAbYBAQAAAAG4AQIAAAABuQEBAAAAAQMAAAAhACAbAADlAwAgHAAA7QMAIAcAAAAhACAUAADtAwAgmgEBAK4CACGbAQEArgIAIaYBQACzAgAhpwFAALMCACG_AQEArwIAIQWaAQEArgIAIZsBAQCuAgAhpgFAALMCACGnAUAAswIAIb8BAQCvAgAhAwAAADoAIBsAAOcDACAcAADwAwAgDgAAADoAIBQAAPADACCaAQEArgIAIZsBAQCuAgAhnAEBAK4CACGdAQEArgIAIZ4BAQCvAgAhnwEBAK8CACGgAQEArwIAIaIBAACwAqIBIqQBAACxAqQBIqUBIACyAgAhpgFAALMCACGnAUAAswIAIQyaAQEArgIAIZsBAQCuAgAhnAEBAK4CACGdAQEArgIAIZ4BAQCvAgAhnwEBAK8CACGgAQEArwIAIaIBAACwAqIBIqQBAACxAqQBIqUBIACyAgAhpgFAALMCACGnAUAAswIAIQ8IAAD2AgAgCwAA-AIAIA0AAPkCACCaAQEAAAABmwEBAAAAAZwBAQAAAAGdAQEAAAABngEBAAAAAZ8BAQAAAAGgAQEAAAABogEAAACiAQKkAQAAAKQBAqUBIAAAAAGmAUAAAAABpwFAAAAAAQIAAADAAQAgGwAA8QMAIAMAAADDAQAgGwAA8QMAIBwAAPUDACARAAAAwwEAIAgAALQCACALAAC2AgAgDQAAtwIAIBQAAPUDACCaAQEArgIAIZsBAQCuAgAhnAEBAK4CACGdAQEArgIAIZ4BAQCvAgAhnwEBAK8CACGgAQEArwIAIaIBAACwAqIBIqQBAACxAqQBIqUBIACyAgAhpgFAALMCACGnAUAAswIAIQ8IAAC0AgAgCwAAtgIAIA0AALcCACCaAQEArgIAIZsBAQCuAgAhnAEBAK4CACGdAQEArgIAIZ4BAQCvAgAhnwEBAK8CACGgAQEArwIAIaIBAACwAqIBIqQBAACxAqQBIqUBIACyAgAhpgFAALMCACGnAUAAswIAIQ8IAAD2AgAgCQAA9wIAIA0AAPkCACCaAQEAAAABmwEBAAAAAZwBAQAAAAGdAQEAAAABngEBAAAAAZ8BAQAAAAGgAQEAAAABogEAAACiAQKkAQAAAKQBAqUBIAAAAAGmAUAAAAABpwFAAAAAAQIAAADAAQAgGwAA9gMAIAMAAADDAQAgGwAA9gMAIBwAAPoDACARAAAAwwEAIAgAALQCACAJAAC1AgAgDQAAtwIAIBQAAPoDACCaAQEArgIAIZsBAQCuAgAhnAEBAK4CACGdAQEArgIAIZ4BAQCvAgAhnwEBAK8CACGgAQEArwIAIaIBAACwAqIBIqQBAACxAqQBIqUBIACyAgAhpgFAALMCACGnAUAAswIAIQ8IAAC0AgAgCQAAtQIAIA0AALcCACCaAQEArgIAIZsBAQCuAgAhnAEBAK4CACGdAQEArgIAIZ4BAQCvAgAhnwEBAK8CACGgAQEArwIAIaIBAACwAqIBIqQBAACxAqQBIqUBIACyAgAhpgFAALMCACGnAUAAswIAIRMFAACqAwAgBgAAqwMAIAsAAK0DACCaAQEAAAABpQEgAAAAAaYBQAAAAAGnAUAAAAABvAEBAAAAAb0BAQAAAAG-AQEAAAABvwEBAAAAAcABAQAAAAHBAQgAAAABwgECAAAAAcMBAgAAAAHEAQgAAAABxQEAAKgDACDGAQAAqQMAIMcBIAAAAAECAAAABQAgGwAA-wMAIA8IAAD2AgAgCQAA9wIAIAsAAPgCACCaAQEAAAABmwEBAAAAAZwBAQAAAAGdAQEAAAABngEBAAAAAZ8BAQAAAAGgAQEAAAABogEAAACiAQKkAQAAAKQBAqUBIAAAAAGmAUAAAAABpwFAAAAAAQIAAADAAQAgGwAA_QMAIAMAAADDAQAgGwAA_QMAIBwAAIEEACARAAAAwwEAIAgAALQCACAJAAC1AgAgCwAAtgIAIBQAAIEEACCaAQEArgIAIZsBAQCuAgAhnAEBAK4CACGdAQEArgIAIZ4BAQCvAgAhnwEBAK8CACGgAQEArwIAIaIBAACwAqIBIqQBAACxAqQBIqUBIACyAgAhpgFAALMCACGnAUAAswIAIQ8IAAC0AgAgCQAAtQIAIAsAALYCACCaAQEArgIAIZsBAQCuAgAhnAEBAK4CACGdAQEArgIAIZ4BAQCvAgAhnwEBAK8CACGgAQEArwIAIaIBAACwAqIBIqQBAACxAqQBIqUBIACyAgAhpgFAALMCACGnAUAAswIAIQMAAAADACAbAAD7AwAgHAAAhAQAIBUAAAADACAFAACSAwAgBgAAkwMAIAsAAJUDACAUAACEBAAgmgEBAK4CACGlASAAsgIAIaYBQACzAgAhpwFAALMCACG8AQEArgIAIb0BAQCuAgAhvgEBAK4CACG_AQEArgIAIcABAQCuAgAhwQEIAMICACHCAQIA1AIAIcMBAgDUAgAhxAEIAI8DACHFAQAAkAMAIMYBAACRAwAgxwEgALICACETBQAAkgMAIAYAAJMDACALAACVAwAgmgEBAK4CACGlASAAsgIAIaYBQACzAgAhpwFAALMCACG8AQEArgIAIb0BAQCuAgAhvgEBAK4CACG_AQEArgIAIcABAQCuAgAhwQEIAMICACHCAQIA1AIAIcMBAgDUAgAhxAEIAI8DACHFAQAAkAMAIMYBAACRAwAgxwEgALICACEGmgEBAAAAAaQBAAAAuwECpgFAAAAAAacBQAAAAAG3AQEAAAABuwEBAAAAARMFAACqAwAgBgAAqwMAIAkAAKwDACCaAQEAAAABpQEgAAAAAaYBQAAAAAGnAUAAAAABvAEBAAAAAb0BAQAAAAG-AQEAAAABvwEBAAAAAcABAQAAAAHBAQgAAAABwgECAAAAAcMBAgAAAAHEAQgAAAABxQEAAKgDACDGAQAAqQMAIMcBIAAAAAECAAAABQAgGwAAhgQAIAMAAAADACAbAACGBAAgHAAAigQAIBUAAAADACAFAACSAwAgBgAAkwMAIAkAAJQDACAUAACKBAAgmgEBAK4CACGlASAAsgIAIaYBQACzAgAhpwFAALMCACG8AQEArgIAIb0BAQCuAgAhvgEBAK4CACG_AQEArgIAIcABAQCuAgAhwQEIAMICACHCAQIA1AIAIcMBAgDUAgAhxAEIAI8DACHFAQAAkAMAIMYBAACRAwAgxwEgALICACETBQAAkgMAIAYAAJMDACAJAACUAwAgmgEBAK4CACGlASAAsgIAIaYBQACzAgAhpwFAALMCACG8AQEArgIAIb0BAQCuAgAhvgEBAK4CACG_AQEArgIAIcABAQCuAgAhwQEIAMICACHCAQIA1AIAIcMBAgDUAgAhxAEIAI8DACHFAQAAkAMAIMYBAACRAwAgxwEgALICACEGmgEBAAAAAaYBQAAAAAGnAUAAAAABtwEBAAAAAbgBAgAAAAG5AQEAAAABCQcAAIkDACAKAADvAgAgmgEBAAAAAaQBAAAAuwECpgFAAAAAAacBQAAAAAG2AQEAAAABtwEBAAAAAbsBAQAAAAECAAAACwAgGwAAjAQAIAMAAAAJACAbAACMBAAgHAAAkAQAIAsAAAAJACAHAACIAwAgCgAA5QIAIBQAAJAEACCaAQEArgIAIaQBAADjArsBIqYBQACzAgAhpwFAALMCACG2AQEArgIAIbcBAQCuAgAhuwEBAK8CACEJBwAAiAMAIAoAAOUCACCaAQEArgIAIaQBAADjArsBIqYBQACzAgAhpwFAALMCACG2AQEArgIAIbcBAQCuAgAhuwEBAK8CACEKmgEBAAAAAaQBAAAA0wECpgFAAAAAAacBQAAAAAHMAQEAAAABzQEIAAAAAc4BAQAAAAHQAQAAANABAtEBAQAAAAHTAUAAAAABAgMGAgQADAUEAAsFAAMGAAEJDAULHAgCAwcCBAAEAQMIAAMHAAYKAAIOGwkFBAAKCA4HCQ8FCxMIDRcJAQcABgIHAAYKAAICBwAGDAAFAwkYAAsZAA0aAAIJHQALHgABAx8AAAAAAwQAESEAEiIAEwAAAAMEABEhABIiABMAAAMEABghABkiABoAAAADBAAYIQAZIgAaAgcABgwABQIHAAYMAAUFBAAfIQAiIgAjQwAgRAAhAAAAAAAFBAAfIQAiIgAjQwAgRAAhAQcABgEHAAYDBAAoIQApIgAqAAAAAwQAKCEAKSIAKgIFAAMGAAECBQADBgABBQQALyEAMiIAM0MAMEQAMQAAAAAABQQALyEAMiIAM0MAMEQAMQIHAAYKAAICBwAGCgACAwQAOCEAOSIAOgAAAAMEADghADkiADoCBwAGCgACAgcABgoAAgUEAD8hAEIiAENDAEBEAEEAAAAAAAUEAD8hAEIiAENDAEBEAEEAAAMEAEghAEkiAEoAAAADBABIIQBJIgBKDwIBECABESMBEiQBEyUBFScBFikNFyoOGCwBGS4NGi8PHTABHjEBHzINIzUQJDYUJTgDJjkDJzwDKD0DKT4DKkADK0INLEMVLUUDLkcNL0gWMEkDMUoDMksNM04XNE8bNVAJNlEJN1IJOFMJOVQJOlYJO1gNPFkcPVsJPl0NP14dQF8JQWAJQmENRWQeRmUkR2cHSGgHSWoHSmsHS2wHTG4HTXANTnElT3MHUHUNUXYmUncHU3gHVHkNVXwnVn0rV34CWH8CWYABAlqBAQJbggECXIQBAl2GAQ1ehwEsX4kBAmCLAQ1hjAEtYo0BAmOOAQJkjwENZZIBLmaTATRnlAEFaJUBBWmWAQVqlwEFa5gBBWyaAQVtnAENbp0BNW-fAQVwoQENcaIBNnKjAQVzpAEFdKUBDXWoATd2qQE7d6oBCHirAQh5rAEIeq0BCHuuAQh8sAEIfbIBDX6zATx_tQEIgAG3AQ2BAbgBPYIBuQEIgwG6AQiEAbsBDYUBvgE-hgG_AUSHAcEBBogBwgEGiQHFAQaKAcYBBosBxwEGjAHJAQaNAcsBDY4BzAFFjwHOAQaQAdABDZEB0QFGkgHSAQaTAdMBBpQB1AENlQHXAUeWAdgBSw"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// prisma/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// prisma/generated/prisma/client.ts
globalThis["__dirname"] = path2.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/modules/tenant/tenant.service.ts
var registerUserIntoDB = async (payload) => {
  const { name, email, password, profileImage } = payload;
  const isUserExist = await prisma.tenant.findUnique({ where: { email } });
  if (isUserExist) throw new Error("User with this email already exists");
  const hashedPassword = await bcrypt.hash(password, Number(config_default.bcrypt_salt_round));
  const createdUser = await prisma.tenant.create({
    data: { name, email, password: hashedPassword }
  });
  await prisma.profile.create({
    data: { tenantId: createdUser.id, fullName: name, profileImage }
  });
  return await prisma.tenant.findUnique({
    where: { id: createdUser.id },
    omit: { password: true },
    include: { profile: true }
  });
};
var getAllUsersFromDB = async () => {
  return await prisma.tenant.findMany({
    where: { isDeleted: false },
    omit: { password: true },
    include: { profile: true }
  });
};
var updateMyProfileIntoDB = async (tenantId, payload) => {
  const profile = await prisma.profile.findUnique({ where: { tenantId } });
  if (!profile) throw new Error("Profile not found");
  return await prisma.profile.update({
    where: { tenantId },
    data: payload
  });
};
var tenantService = {
  registerUserIntoDB,
  getAllUsersFromDB,
  updateMyProfileIntoDB
};

// src/modules/tenant/tenant.controller.ts
var registerUser = catchAsync(async (req, res) => {
  const result = await tenantService.registerUserIntoDB(req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus3.CREATED,
    message: "User registered successfully",
    data: result
  });
});
var getAllUsers = catchAsync(async (req, res) => {
  const result = await tenantService.getAllUsersFromDB();
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus3.OK,
    message: "Users retrieved successfully",
    data: result
  });
});
var updateMyProfile = catchAsync(async (req, res) => {
  const result = await tenantService.updateMyProfileIntoDB(req.user.id, req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus3.OK,
    message: "Profile updated successfully",
    data: result
  });
});
var tenantController = {
  registerUser,
  getAllUsers,
  updateMyProfile
};

// src/modules/tenant/tenant.route.ts
var router = Router();
router.get("/", tenantController.getAllUsers);
router.patch("/profile", auth_default(Role.TENANT), tenantController.updateMyProfile);
var tenantRoutes = router;

// src/modules/landlord/landlord.route.ts
import { Router as Router2 } from "express";

// src/modules/landlord/landlord.controller.ts
import httpStatus4 from "http-status";

// src/modules/landlord/landlord.service.ts
import bcrypt2 from "bcryptjs";
var createLandlordIntoDB = async (payload) => {
  const { name, email, password, profileImage } = payload;
  const isExist = await prisma.landlord.findUnique({ where: { email } });
  if (isExist) throw new Error("Landlord with this email already exists");
  const hashedPassword = await bcrypt2.hash(
    password,
    Number(config_default.bcrypt_salt_round)
  );
  const landlord = await prisma.landlord.create({
    data: { name, email, password: hashedPassword, profileImage },
    omit: { password: true }
  });
  return landlord;
};
var getLandlordProfileFromDB = async (id) => {
  const landlord = await prisma.landlord.findUnique({
    where: { id, isDeleted: false },
    omit: { password: true }
  });
  if (!landlord) throw new Error("Landlord not found");
  return landlord;
};
var updateLandlordProfileIntoDB = async (id, payload) => {
  const isExist = await prisma.landlord.findUnique({
    where: { id, isDeleted: false }
  });
  if (!isExist) throw new Error("Landlord not found");
  const landlord = await prisma.landlord.update({
    where: { id },
    data: payload,
    omit: { password: true }
  });
  return landlord;
};
var createPropertyIntoDB = async (landlordId, payload) => {
  const property = await prisma.property.create({
    data: { ...payload, landlordId },
    include: { category: true }
  });
  return property;
};
var updatePropertyIntoDB = async (landlordId, propertyId, payload) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, isDeleted: false }
  });
  if (!property) throw new Error("Property not found");
  if (property.landlordId !== landlordId) throw new Error("You are not authorized to update this property");
  return await prisma.property.update({
    where: { id: propertyId },
    data: payload,
    include: { category: true }
  });
};
var deletePropertyFromDB = async (landlordId, propertyId) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, isDeleted: false }
  });
  if (!property) throw new Error("Property not found");
  if (property.landlordId !== landlordId) throw new Error("You are not authorized to delete this property");
  return await prisma.property.update({
    where: { id: propertyId },
    data: { isDeleted: true }
  });
};
var togglePropertyAvailabilityIntoDB = async (landlordId, propertyId) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, isDeleted: false }
  });
  if (!property) throw new Error("Property not found");
  if (property.landlordId !== landlordId) throw new Error("You are not authorized to update this property");
  return await prisma.property.update({
    where: { id: propertyId },
    data: { isAvailable: !property.isAvailable },
    include: { category: true }
  });
};
var landlordService = {
  createLandlordIntoDB,
  getLandlordProfileFromDB,
  updateLandlordProfileIntoDB,
  createPropertyIntoDB,
  updatePropertyIntoDB,
  deletePropertyFromDB,
  togglePropertyAvailabilityIntoDB
};

// src/modules/landlord/landlord.controller.ts
var createLandlord = catchAsync(async (req, res) => {
  const result = await landlordService.createLandlordIntoDB(req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus4.CREATED,
    message: "Landlord created successfully",
    data: result
  });
});
var getLandlordProfile = catchAsync(async (req, res) => {
  const result = await landlordService.getLandlordProfileFromDB(req.params.id);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus4.OK,
    message: "Landlord profile retrieved successfully",
    data: result
  });
});
var updateLandlordProfile = catchAsync(async (req, res) => {
  const result = await landlordService.updateLandlordProfileIntoDB(
    req.params.id,
    req.body
  );
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus4.OK,
    message: "Landlord profile updated successfully",
    data: result
  });
});
var createProperty = catchAsync(async (req, res) => {
  const result = await landlordService.createPropertyIntoDB(
    req.user.id,
    req.body
  );
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus4.CREATED,
    message: "Property created successfully",
    data: result
  });
});
var updateProperty = catchAsync(async (req, res) => {
  const result = await landlordService.updatePropertyIntoDB(
    req.user.id,
    req.params.id,
    req.body
  );
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus4.OK,
    message: "Property updated successfully",
    data: result
  });
});
var deleteProperty = catchAsync(async (req, res) => {
  const result = await landlordService.deletePropertyFromDB(
    req.user.id,
    req.params.id
  );
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus4.OK,
    message: "Property deleted successfully",
    data: result
  });
});
var togglePropertyAvailability = catchAsync(async (req, res) => {
  const result = await landlordService.togglePropertyAvailabilityIntoDB(
    req.user.id,
    req.params.id
  );
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus4.OK,
    message: `Property availability updated to ${result.isAvailable ? "available" : "unavailable"}`,
    data: result
  });
});
var landlordController = {
  createLandlord,
  getLandlordProfile,
  updateLandlordProfile,
  createProperty,
  updateProperty,
  deleteProperty,
  togglePropertyAvailability
};

// src/modules/rental/rental.controller.ts
import httpStatus5 from "http-status";

// src/modules/rental/rental.service.ts
var createRentalRequestIntoDB = async (tenantId, payload) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId, isDeleted: false, isAvailable: true }
  });
  if (!property) throw new Error("Property not found or not available");
  const existing = await prisma.rentalRequest.findFirst({
    where: { tenantId, propertyId: payload.propertyId, status: "PENDING" }
  });
  if (existing) throw new Error("You already have a pending request for this property");
  return await prisma.rentalRequest.create({
    data: { tenantId, ...payload },
    include: {
      property: { include: { category: true } },
      tenant: { omit: { password: true } }
    }
  });
};
var getMyRentalRequestsFromDB = async (tenantId) => {
  return await prisma.rentalRequest.findMany({
    where: { tenantId },
    include: { property: { include: { category: true } } },
    orderBy: { createdAt: "desc" }
  });
};
var getRentalRequestByIdFromDB = async (id, userId) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id },
    include: {
      property: { include: { category: true } },
      tenant: { omit: { password: true } }
    }
  });
  if (!request) throw new Error("Rental request not found");
  return request;
};
var getLandlordRentalRequestsFromDB = async (landlordId) => {
  return await prisma.rentalRequest.findMany({
    where: { property: { landlordId } },
    include: {
      property: true,
      tenant: { omit: { password: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};
var updateRentalStatusIntoDB = async (landlordId, requestId, payload) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: { property: true }
  });
  if (!request) throw new Error("Rental request not found");
  if (request.property.landlordId !== landlordId) throw new Error("You are not authorized to update this request");
  if (request.status !== "PENDING") throw new Error("Only pending requests can be approved or rejected");
  return await prisma.rentalRequest.update({
    where: { id: requestId },
    data: { status: payload.status },
    include: { property: true, tenant: { omit: { password: true } } }
  });
};
var rentalService = {
  createRentalRequestIntoDB,
  getMyRentalRequestsFromDB,
  getRentalRequestByIdFromDB,
  getLandlordRentalRequestsFromDB,
  updateRentalStatusIntoDB
};

// src/modules/rental/rental.controller.ts
var createRentalRequest = catchAsync(async (req, res) => {
  const result = await rentalService.createRentalRequestIntoDB(req.user.id, req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus5.CREATED,
    message: "Rental request submitted successfully",
    data: result
  });
});
var getMyRentalRequests = catchAsync(async (req, res) => {
  const result = await rentalService.getMyRentalRequestsFromDB(req.user.id);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus5.OK,
    message: "Rental requests retrieved successfully",
    data: result
  });
});
var getRentalRequestById = catchAsync(async (req, res) => {
  const result = await rentalService.getRentalRequestByIdFromDB(req.params.id, req.user.id);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus5.OK,
    message: "Rental request retrieved successfully",
    data: result
  });
});
var getLandlordRentalRequests = catchAsync(async (req, res) => {
  const result = await rentalService.getLandlordRentalRequestsFromDB(req.user.id);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus5.OK,
    message: "Rental requests retrieved successfully",
    data: result
  });
});
var updateRentalStatus = catchAsync(async (req, res) => {
  const result = await rentalService.updateRentalStatusIntoDB(req.user.id, req.params.id, req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus5.OK,
    message: "Rental request updated successfully",
    data: result
  });
});
var rentalController = {
  createRentalRequest,
  getMyRentalRequests,
  getRentalRequestById,
  getLandlordRentalRequests,
  updateRentalStatus
};

// src/modules/landlord/landlord.route.ts
var router2 = Router2();
router2.post("/properties", auth_default(Role.LANDLORD), landlordController.createProperty);
router2.put("/properties/:id", auth_default(Role.LANDLORD), landlordController.updateProperty);
router2.delete("/properties/:id", auth_default(Role.LANDLORD), landlordController.deleteProperty);
router2.patch("/properties/:id/availability", auth_default(Role.LANDLORD), landlordController.togglePropertyAvailability);
router2.get("/requests", auth_default(Role.LANDLORD), rentalController.getLandlordRentalRequests);
router2.patch("/requests/:id", auth_default(Role.LANDLORD), rentalController.updateRentalStatus);
router2.post("/register", landlordController.createLandlord);
router2.get("/:id", landlordController.getLandlordProfile);
router2.patch("/:id", auth_default(Role.LANDLORD, Role.ADMIN), landlordController.updateLandlordProfile);
var landlordRoutes = router2;

// src/modules/property/property.route.ts
import { Router as Router3 } from "express";

// src/modules/property/property.controller.ts
import httpStatus6 from "http-status";

// src/modules/property/property.service.ts
var getAllPropertiesFromDB = async (filters) => {
  const { location, minPrice, maxPrice, categoryId, bedrooms } = filters;
  const properties = await prisma.property.findMany({
    where: {
      isDeleted: false,
      isAvailable: true,
      ...location && {
        location: { contains: location, mode: "insensitive" }
      },
      ...categoryId && { categoryId },
      ...bedrooms && { bedrooms },
      ...(minPrice || maxPrice) && {
        price: {
          ...minPrice && { gte: Number(minPrice) },
          ...maxPrice && { lte: Number(maxPrice) }
        }
      }
    },
    include: {
      category: true,
      landlord: {
        omit: { password: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return properties;
};
var getPropertyByIdFromDB = async (id) => {
  const property = await prisma.property.findUnique({
    where: { id, isDeleted: false },
    include: {
      category: true,
      landlord: {
        omit: { password: true }
      }
    }
  });
  if (!property) throw new Error("Property not found");
  return property;
};
var propertyService = {
  getAllPropertiesFromDB,
  getPropertyByIdFromDB
};

// src/modules/property/property.controller.ts
var getAllProperties = catchAsync(async (req, res) => {
  const filters = {
    location: req.query.location,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : void 0,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : void 0,
    categoryId: req.query.categoryId,
    bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : void 0
  };
  const result = await propertyService.getAllPropertiesFromDB(filters);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus6.OK,
    message: "Properties retrieved successfully",
    data: result
  });
});
var getPropertyById = catchAsync(async (req, res) => {
  const result = await propertyService.getPropertyByIdFromDB(req.params.id);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus6.OK,
    message: "Property retrieved successfully",
    data: result
  });
});
var propertyController = {
  getAllProperties,
  getPropertyById
};

// src/modules/property/property.route.ts
var router3 = Router3();
router3.get("/", propertyController.getAllProperties);
router3.get("/:id", propertyController.getPropertyById);
var propertyRoutes = router3;

// src/modules/category/category.route.ts
import { Router as Router4 } from "express";

// src/modules/category/category.controller.ts
import httpStatus7 from "http-status";

// src/modules/category/category.service.ts
var getAllCategoriesFromDB = async () => {
  return await prisma.category.findMany({
    orderBy: { name: "asc" }
  });
};
var createCategoryIntoDB = async (payload) => {
  const isExist = await prisma.category.findUnique({
    where: { name: payload.name }
  });
  if (isExist) throw new Error("Category already exists");
  return await prisma.category.create({ data: payload });
};
var categoryService = {
  getAllCategoriesFromDB,
  createCategoryIntoDB
};

// src/modules/category/category.controller.ts
var getAllCategories = catchAsync(async (req, res) => {
  const result = await categoryService.getAllCategoriesFromDB();
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus7.OK,
    message: "Categories retrieved successfully",
    data: result
  });
});
var createCategory = catchAsync(async (req, res) => {
  const result = await categoryService.createCategoryIntoDB(req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus7.CREATED,
    message: "Category created successfully",
    data: result
  });
});
var categoryController = {
  getAllCategories,
  createCategory
};

// src/modules/category/category.route.ts
var router4 = Router4();
router4.get("/", categoryController.getAllCategories);
router4.post("/", auth_default(Role.ADMIN), categoryController.createCategory);
var categoryRoutes = router4;

// src/modules/rental/rental.route.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.post("/", auth_default(Role.TENANT), rentalController.createRentalRequest);
router5.get("/", auth_default(Role.TENANT, Role.LANDLORD), rentalController.getMyRentalRequests);
router5.get("/:id", auth_default(Role.TENANT, Role.LANDLORD), rentalController.getRentalRequestById);
var rentalRoutes = router5;

// src/modules/review/review.route.ts
import { Router as Router6 } from "express";

// src/modules/review/review.controller.ts
import httpStatus8 from "http-status";

// src/modules/review/review.service.ts
var createReviewIntoDB = async (tenantId, payload) => {
  const { propertyId, rating, comment } = payload;
  const property = await prisma.property.findUnique({
    where: { id: propertyId, isDeleted: false }
  });
  if (!property) throw new Error("Property not found");
  const validRental = await prisma.rentalRequest.findFirst({
    where: { tenantId, propertyId, status: { in: ["APPROVED", "COMPLETED"] } }
  });
  if (!validRental) throw new Error("You can only review a property after an approved or completed rental");
  const existing = await prisma.review.findFirst({
    where: { tenantId, propertyId }
  });
  if (existing) throw new Error("You have already reviewed this property");
  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
  return await prisma.review.create({
    data: { tenantId, propertyId, rating, comment },
    include: {
      tenant: { omit: { password: true } },
      property: true
    }
  });
};
var reviewService = {
  createReviewIntoDB
};

// src/modules/review/review.controller.ts
var createReview = catchAsync(async (req, res) => {
  const result = await reviewService.createReviewIntoDB(req.user.id, req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus8.CREATED,
    message: "Review submitted successfully",
    data: result
  });
});
var reviewController = {
  createReview
};

// src/modules/review/review.route.ts
var router6 = Router6();
router6.post("/", auth_default(Role.TENANT), reviewController.createReview);
var reviewRoutes = router6;

// src/modules/admin/admin.route.ts
import { Router as Router7 } from "express";

// src/modules/admin/admin.controller.ts
import httpStatus9 from "http-status";

// src/modules/admin/admin.service.ts
var getAllUsersFromDB2 = async () => {
  const tenants = await prisma.tenant.findMany({
    omit: { password: true },
    include: { profile: true },
    orderBy: { createdAt: "desc" }
  });
  const landlords = await prisma.landlord.findMany({
    omit: { password: true },
    orderBy: { createdAt: "desc" }
  });
  return { tenants, landlords };
};
var updateUserStatusIntoDB = async (id, role, payload) => {
  if (role === "LANDLORD") {
    const landlord = await prisma.landlord.findUnique({ where: { id } });
    if (!landlord) throw new Error("Landlord not found");
    return await prisma.landlord.update({
      where: { id },
      data: { status: payload.status },
      omit: { password: true }
    });
  }
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) throw new Error("User not found");
  return await prisma.tenant.update({
    where: { id },
    data: { status: payload.status },
    omit: { password: true }
  });
};
var getAllPropertiesFromDB2 = async () => {
  return await prisma.property.findMany({
    where: { isDeleted: false },
    include: {
      category: true,
      landlord: { omit: { password: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};
var getAllRentalRequestsFromDB = async () => {
  return await prisma.rentalRequest.findMany({
    include: {
      tenant: { omit: { password: true } },
      property: { include: { category: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};
var adminService = {
  getAllUsersFromDB: getAllUsersFromDB2,
  updateUserStatusIntoDB,
  getAllPropertiesFromDB: getAllPropertiesFromDB2,
  getAllRentalRequestsFromDB
};

// src/modules/admin/admin.controller.ts
var getAllUsers2 = catchAsync(async (req, res) => {
  const result = await adminService.getAllUsersFromDB();
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus9.OK,
    message: "Users retrieved successfully",
    data: result
  });
});
var updateUserStatus = catchAsync(async (req, res) => {
  const result = await adminService.updateUserStatusIntoDB(
    req.params.id,
    req.query.role,
    req.body
  );
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus9.OK,
    message: "User status updated successfully",
    data: result
  });
});
var getAllProperties2 = catchAsync(async (req, res) => {
  const result = await adminService.getAllPropertiesFromDB();
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus9.OK,
    message: "Properties retrieved successfully",
    data: result
  });
});
var getAllRentalRequests = catchAsync(async (req, res) => {
  const result = await adminService.getAllRentalRequestsFromDB();
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus9.OK,
    message: "Rental requests retrieved successfully",
    data: result
  });
});
var adminController = {
  getAllUsers: getAllUsers2,
  updateUserStatus,
  getAllProperties: getAllProperties2,
  getAllRentalRequests
};

// src/modules/admin/admin.route.ts
var router7 = Router7();
router7.get("/users", auth_default(Role.ADMIN), adminController.getAllUsers);
router7.patch("/users/:id", auth_default(Role.ADMIN), adminController.updateUserStatus);
router7.get("/properties", auth_default(Role.ADMIN), adminController.getAllProperties);
router7.get("/rentals", auth_default(Role.ADMIN), adminController.getAllRentalRequests);
var adminRoutes = router7;

// src/modules/payment/payment.route.ts
import { Router as Router8 } from "express";

// src/modules/payment/payment.controller.ts
import httpStatus10 from "http-status";

// src/modules/payment/payment.service.ts
import Stripe from "stripe";
var stripe = new Stripe(config_default.stripe_secret_key);
var createPaymentIntoDB = async (tenantId, payload) => {
  const { rentalRequestId } = payload;
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: true }
  });
  if (!rentalRequest) throw new Error("Rental request not found");
  if (rentalRequest.tenantId !== tenantId) throw new Error("Unauthorized");
  if (rentalRequest.status !== "APPROVED") throw new Error("Rental request is not approved yet");
  const existingPayment = await prisma.payment.findUnique({
    where: { rentalRequestId }
  });
  if (existingPayment) throw new Error("Payment already initiated for this rental");
  const amount = rentalRequest.property.price;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    // stripe needs amount in cents
    currency: "usd",
    metadata: { rentalRequestId, tenantId }
  });
  const payment = await prisma.payment.create({
    data: {
      rentalRequestId,
      tenantId,
      amount,
      transactionId: paymentIntent.id,
      status: "PENDING",
      provider: "STRIPE"
    }
  });
  return {
    payment,
    clientSecret: paymentIntent.client_secret
  };
};
var confirmPaymentIntoDB = async (payload) => {
  const { transactionId } = payload;
  const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
  const rentalRequestId = paymentIntent.metadata.rentalRequestId;
  const payment = await prisma.payment.update({
    where: { rentalRequestId },
    data: {
      status: paymentIntent.status === "succeeded" ? "COMPLETED" : "PENDING",
      paidAt: paymentIntent.status === "succeeded" ? /* @__PURE__ */ new Date() : null
    }
  });
  if (paymentIntent.status === "succeeded") {
    await prisma.rentalRequest.update({
      where: { id: rentalRequestId },
      data: { status: "ACTIVE" }
    });
  }
  return {
    payment,
    stripeStatus: paymentIntent.status
  };
};
var getMyPaymentsFromDB = async (tenantId) => {
  return await prisma.payment.findMany({
    where: { tenantId },
    include: {
      rentalRequest: { include: { property: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};
var getPaymentByIdFromDB = async (id) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      rentalRequest: { include: { property: true } },
      tenant: { omit: { password: true } }
    }
  });
  if (!payment) throw new Error("Payment not found");
  return payment;
};
var paymentService = {
  createPaymentIntoDB,
  confirmPaymentIntoDB,
  getMyPaymentsFromDB,
  getPaymentByIdFromDB
};

// src/modules/payment/payment.controller.ts
var createPayment = catchAsync(async (req, res) => {
  const result = await paymentService.createPaymentIntoDB(req.user.id, req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus10.CREATED,
    message: "Payment initiated successfully",
    data: result
  });
});
var confirmPayment = catchAsync(async (req, res) => {
  const result = await paymentService.confirmPaymentIntoDB(req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus10.OK,
    message: "Payment confirmed successfully",
    data: result
  });
});
var getMyPayments = catchAsync(async (req, res) => {
  const result = await paymentService.getMyPaymentsFromDB(req.user.id);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus10.OK,
    message: "Payments retrieved successfully",
    data: result
  });
});
var getPaymentById = catchAsync(async (req, res) => {
  const result = await paymentService.getPaymentByIdFromDB(req.params.id);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus10.OK,
    message: "Payment retrieved successfully",
    data: result
  });
});
var paymentController = {
  createPayment,
  confirmPayment,
  getMyPayments,
  getPaymentById
};

// src/modules/payment/payment.route.ts
var router8 = Router8();
router8.post("/create", auth_default(Role.TENANT), paymentController.createPayment);
router8.post("/confirm", paymentController.confirmPayment);
router8.get("/", auth_default(Role.TENANT), paymentController.getMyPayments);
router8.get("/:id", auth_default(Role.TENANT), paymentController.getPaymentById);
var paymentRoutes = router8;

// src/auth/auth.route.ts
import { Router as Router9 } from "express";

// src/auth/auth.controller.ts
import httpStatus11 from "http-status";

// src/auth/auth.service.ts
import bcrypt3 from "bcryptjs";
var registerUser2 = async (payload) => {
  const { name, email, password, role, profileImage } = payload;
  if (role === "LANDLORD") {
    const isExist2 = await prisma.landlord.findUnique({ where: { email } });
    if (isExist2) throw new Error("User with this email already exists");
    const hashedPassword2 = await bcrypt3.hash(password, Number(config_default.bcrypt_salt_round));
    const landlord = await prisma.landlord.create({
      data: { name, email, password: hashedPassword2, profileImage },
      omit: { password: true }
    });
    return landlord;
  }
  const isExist = await prisma.tenant.findUnique({ where: { email } });
  if (isExist) throw new Error("User with this email already exists");
  const hashedPassword = await bcrypt3.hash(password, Number(config_default.bcrypt_salt_round));
  const tenant = await prisma.tenant.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role === "ADMIN" ? "ADMIN" : "TENANT"
    }
  });
  if (role !== "ADMIN") {
    await prisma.profile.create({
      data: { tenantId: tenant.id, fullName: name, profileImage }
    });
  }
  const result = await prisma.tenant.findUnique({
    where: { id: tenant.id },
    omit: { password: true },
    include: { profile: true }
  });
  return result;
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  let user = await prisma.tenant.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.landlord.findUnique({ where: { email } });
  }
  if (!user) throw new Error("Invalid email or password");
  if (user.status === "BLOCKED") throw new Error("Your account has been blocked");
  if (user.isDeleted) throw new Error("Account not found");
  const isPasswordMatch = await bcrypt3.compare(password, user.password);
  if (!isPasswordMatch) throw new Error("Invalid email or password");
  const jwtPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config_default.jwt_access_secret,
    config_default.jwt_access_expire_in
  );
  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config_default.jwt_refresh_secret,
    config_default.jwt_refresh_expire_in
  );
  return { accessToken, refreshToken };
};
var getMe = async (id, role) => {
  const user = role === "LANDLORD" ? await prisma.landlord.findUnique({
    where: { id },
    omit: { password: true }
  }) : await prisma.tenant.findUnique({
    where: { id },
    omit: { password: true },
    include: { profile: true }
  });
  if (!user) throw new Error("User not found");
  return user;
};
var authService = {
  registerUser: registerUser2,
  loginUser,
  getMe
};

// src/auth/auth.controller.ts
var registerUser3 = catchAsync(async (req, res) => {
  const result = await authService.registerUser(req.body);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus11.CREATED,
    message: "User registered successfully",
    data: result
  });
});
var loginUser2 = catchAsync(async (req, res) => {
  const { accessToken, refreshToken } = await authService.loginUser(req.body);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  });
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus11.OK,
    message: "User logged in successfully",
    data: { accessToken, refreshToken }
  });
});
var getMe2 = catchAsync(async (req, res) => {
  const result = await authService.getMe(req.user.id, req.user.role);
  sendResponse_default(res, {
    success: true,
    statusCode: httpStatus11.OK,
    message: "Profile retrieved successfully",
    data: result
  });
});
var authController = {
  registerUser: registerUser3,
  loginUser: loginUser2,
  getMe: getMe2
};

// src/auth/auth.route.ts
var router9 = Router9();
router9.post("/register", authController.registerUser);
router9.post("/login", authController.loginUser);
router9.get("/me", auth_default(Role.TENANT, Role.LANDLORD, Role.ADMIN), authController.getMe);
var authRoutes = router9;

// src/app.ts
var app = express();
app.use(
  cors({
    origin: config_default.app_url,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (_req, res) => {
  res.send("hello world!");
});
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/landlords", landlordRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
