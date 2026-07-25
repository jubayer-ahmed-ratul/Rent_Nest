import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "../config";
import { Role } from "../../prisma/generated/prisma/enums";
import { jwtHelpers } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
      };
    }
  }
}

const auth = (...roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          statusCode: httpStatus.UNAUTHORIZED,
          message: "You are not authorized",
        });
      }

      const decoded = jwtHelpers.verifyToken(
        token,
        config.jwt_access_secret as string,
      );

      req.user = {
        id: decoded.id as string,
        email: decoded.email as string,
        role: decoded.role as Role,
      };

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          statusCode: httpStatus.FORBIDDEN,
          message: "You do not have permission to access this resource",
        });
      }

      next();
    } catch {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: "Invalid or expired token",
      });
    }
  };
};

export default auth;
