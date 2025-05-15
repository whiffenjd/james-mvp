// src/routes/auth.routes.ts
import { Router } from "express";
import { verifyToken } from "../Middlewares/VerifyToken";
import express from "express";
import {
  getAllUsersController,
  getUserProfile,
} from "../Controllers/UserProfileControllers";
const UserRouter = Router();

function asyncHandler(fn: express.RequestHandler): express.RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

UserRouter.get(
  "/Userprofile",
  asyncHandler(verifyToken as express.RequestHandler),
  getUserProfile as unknown as express.RequestHandler
);
UserRouter.get(
  "/getAllUsers",
  asyncHandler(verifyToken as express.RequestHandler),
  getAllUsersController as unknown as express.RequestHandler
);
export default UserRouter;
