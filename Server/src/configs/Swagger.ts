// src/swagger.ts
import swaggerJSDoc from "swagger-jsdoc";
import { Express } from "express";
import swaggerUi from "swagger-ui-express";
const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description:
        "API documentation for my Node + TypeScript + Drizzle project",
    },
    servers: [
      {
        url: "http://localhost:5000", // Change this to production URL in future
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/Routes/**/*.ts", "./src/Controllers/**/*.ts", "./src/**/*.ts"], // Adjust based on your actual route/controller path
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
