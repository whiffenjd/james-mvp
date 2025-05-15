// src/routes/auth.routes.ts
import { Router } from "express";
import express from "express";
import {
  login,
  logout,
  requestPasswordResetMail,
  updatePassword,
} from "../Controllers/AuthUserController";
import { verifyToken } from "../Middlewares/VerifyToken";
const authRouter = Router();

authRouter.post("/login", login); // Body must contain email, password, role
authRouter.post(
  "/logout",
  verifyToken,
  logout as unknown as express.RequestHandler
); // Body must contain email, password, role
authRouter.post(
  "/resetPasswordRequest",
  requestPasswordResetMail as unknown as express.RequestHandler
);
authRouter.post(
  "/resetPassword",
  updatePassword as unknown as express.RequestHandler
);
export default authRouter;
