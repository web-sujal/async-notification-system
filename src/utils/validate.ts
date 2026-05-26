import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError, ZodType } from "zod";

import { ApiError } from "./apiError.js";

export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid request payload", {
          details: err.flatten().fieldErrors,
        });
      }

      throw err;
    }
  };
}
