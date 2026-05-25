import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ApiError, ApiErrorBody } from "../utils/apiError.js";
import logger from "../utils/logger.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error(err);

  if (!(err instanceof ApiError)) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: { message: "Internal server error" } satisfies ApiErrorBody,
    });
    return;
  }

  const errorBody: ApiErrorBody = { message: err.message };
  if (err.code) errorBody.code = err.code;
  if (err.details !== undefined) errorBody.details = err.details;

  res.status(err.statusCode).json({ error: errorBody });
}
