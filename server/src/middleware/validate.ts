import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

type RequestPart = "body" | "params" | "query";

export function validateRequest<TSchema extends ZodSchema>(
  part: RequestPart,
  schema: TSchema
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[part]);
    if (part === "query") {
      // Express 5 exposes query as a getter; retain parsed defaults and coercions.
      Object.defineProperty(req, "query", {
        value: parsed,
        configurable: true,
        enumerable: true,
        writable: true
      });
    } else {
      req[part] = parsed;
    }
    next();
  };
}
