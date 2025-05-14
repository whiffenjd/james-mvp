import { Request, Response, NextFunction } from "express";

export const xssSanitizer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body) {
      Object.keys(req.body).forEach((key) => {
        (req.body as Record<string, any>)[key] = sanitizeObject(req.body)[key];
      });
    }
    if (req.query) {
      // Modern approach - create a new sanitized object instead of modifying directly
      const sanitizedQuery = sanitizeObject(req.query as Record<string, any>);
      // We can safely assign this to req.query since we're not modifying the getter
      Object.keys(sanitizedQuery).forEach((key) => {
        (req.query as Record<string, any>)[key] = sanitizedQuery[key];
      });
    }
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Simple sanitization function that escapes HTML
function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    if (typeof value === "string") {
      // Basic HTML escaping
      result[key] = value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
    } else if (typeof value === "object" && value !== null) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  });

  return result;
}
