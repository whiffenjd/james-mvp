// src/routes/auth.routes.ts
import { Router } from "express";
import { getProfile, login } from "../Controllers/AuthController";
import { verifyToken } from "../Middlewares/VerifyToken";
import express from "express";
const authRouter = Router();

authRouter.post("/login", login); // Body must contain email, password, role
authRouter.get("/profile", verifyToken, getProfile as express.RequestHandler);
export default authRouter;
