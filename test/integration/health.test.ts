import request from "supertest";
import { describe, expect, it } from "vitest";

import express from "express";
import { StatusCodes } from "http-status-codes";

import { sendData } from "../../src/utils/apiSuccess.js";

const app = express();

app.get("/health", (_req, res) => {
  return sendData(res, { status: "ok" });
});

describe("health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual({ data: { status: "ok" } });
  });
});
