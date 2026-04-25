import { Request, Response, NextFunction } from "express";
import { BaseError } from "../config/errors";
import { ZodError } from "zod";
import { RC } from "../config/rc";
import { MSG } from "../config/message";

export const errorMiddleware = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof ZodError) {
    res.status(RC.BAD_REQUEST).json({
      status: false,
      message: MSG.ERR_VALIDATION,
      data: error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  } else if (error instanceof BaseError) {
    res.status(error.statusCode).json({
      status: false,
      message: error.message,
    });
    return;
  }
  res.status(RC.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message,
  });
};
