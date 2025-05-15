import { Request, Response, NextFunction } from "express";

export const xssSanitizer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body) {
      req.body = sanitizeData(req.body);
    }
    if (req.query) {
      // Create a sanitized copy of the query
      const sanitizedQuery = sanitizeData(req.query as Record<string, any>);
      // Clear the query object

      // Assign sanitized values
      Object.assign(req.query, sanitizedQuery);
    }
    if (req.params) {
      const sanitizedParams = sanitizeData(req.params);
      // Clear and reassign to maintain the same object reference
      Object.keys(req.params).forEach((key) => delete req.params[key]);
      Object.assign(req.params, sanitizedParams);
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Enhanced sanitization function that handles all data types
function sanitizeData(data: any): any {
  if (typeof data === "string") {
    // Basic HTML escaping
    return data
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  } else if (Array.isArray(data)) {
    // Handle arrays
    return data.map((item) => sanitizeData(item));
  } else if (typeof data === "object" && data !== null) {
    // Handle objects
    const result: Record<string, any> = {};
    Object.keys(data).forEach((key) => {
      result[key] = sanitizeData(data[key]);
    });
    return result;
  }
  // Return non-string primitives as is
  return data;
}
