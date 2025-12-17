import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { validateRequest } from "@/middleware/validate.js";
import { errorHandler } from "@/middleware/error-handler.js";
import { analyticsExportQuerySchema, analyticsQuerySchema, codeParamSchema, createLinkSchema } from "@/modules/links/link.schemas.js";

function validationApp() {
  const app = express();
  app.use(express.json());
  app.get("/analytics", validateRequest("query", analyticsQuerySchema), (req, res) => res.json(req.query));
  app.get("/export", validateRequest("query", analyticsExportQuerySchema), (req, res) => res.json(req.query));
  app.post("/:code", validateRequest("params", codeParamSchema), validateRequest("body", createLinkSchema), (req, res) => res.json({ code: req.params.code, body: req.body }));
  app.use(errorHandler);
  return app;
}

describe("validated Express requests", () => {
  it("makes coerced analytics query values available to the handler", async () => {
    const response = await request(validationApp()).get("/analytics?limit=7");
    expect(response.status).toBe(200);
    expect(response.body.limit).toBe(7);
  });

  it("applies export defaults to an empty query", async () => {
    const response = await request(validationApp()).get("/export");
    expect(response.status).toBe(200);
    expect(response.body.limit).toBe(1000);
  });

  it("rejects invalid query values with a validation error", async () => {
    const response = await request(validationApp()).get("/analytics?limit=-1");
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("continues validating bodies and route parameters", async () => {
    const response = await request(validationApp()).post("/launch").send({ targetUrl: "https://example.com/menu", tags: ["printshop"] });
    expect(response.status).toBe(200);
    expect(response.body.code).toBe("launch");
    expect(response.body.body.tags).toEqual(["printshop"]);
  });
});
