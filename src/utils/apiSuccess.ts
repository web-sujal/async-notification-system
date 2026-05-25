import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

/** JSON body shape for successful responses: always `{ data: ... }`. */
export type ApiSuccessBody<T = unknown> = { data: T };

export function sendData<T>(
  res: Response,
  data: T,
  statusCode = StatusCodes.OK,
): Response {
  return res.status(statusCode).json({ data } satisfies ApiSuccessBody<T>);
}
