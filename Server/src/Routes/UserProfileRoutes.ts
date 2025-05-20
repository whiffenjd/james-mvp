// src/routes/user.routes.ts
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

/**
 * @swagger
 * tags:
 *   name: User Profile
 *   description: User profile management APIs
 */

/**
 * @swagger
 * /profile/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves the profile of the currently authenticated user
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile fetched from cache
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "7c43683f-82d0-4098-9362-4802142dbc09"
 *                     name:
 *                       type: string
 *                       example: "Eren Yeager"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "zebihaider123@gmail.com"
 *                     password:
 *                       type: string
 *                       example: "$2b$10$yjjH9Y3MzRIqtcwOsOZVAO.iK3K4quX4y0/IfQkXNBnXU1k1VgtwW"
 *                     role:
 *                       type: string
 *                       example: "investor"
 *                     isEmailVerified:
 *                       type: boolean
 *                       example: true
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     metadata:
 *                       type: object
 *                       example: {}
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-16T06:25:34.836Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-16T06:25:34.836Z"
 *       401:
 *         description: Unauthorized - Token missing, invalid, expired, or not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Access denied. No token provided.
 *       404:
 *         description: User profile not found
 *       500:
 *         description: Server error
 */
UserRouter.get(
  "/Userprofile",
  asyncHandler(verifyToken as express.RequestHandler),
  getUserProfile as unknown as express.RequestHandler
);

/**
 * @swagger
 * /profile/user/getAllUsers:
 *   get:
 *     summary: Get all users
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves the list of all users. Requires admin privileges.
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Users fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "996afe44-7754-42c7-b8b4-bb6c7fe99102"
 *                       name:
 *                         type: string
 *                         example: "Nagumo Miyabi"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "nagumo@gmail.com"
 *                       password:
 *                         type: string
 *                         example: "$2b$10$h8DaR8.ryfbyIA/UxJ9zcuuf0ggBrGIwLA4ZEt.uvxx5mmjiEF5/C"
 *                       role:
 *                         type: string
 *                         example: "admin"
 *                       isEmailVerified:
 *                         type: boolean
 *                         example: true
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       metadata:
 *                         type: object
 *                         example: {}
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-13T04:04:22.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-13T04:04:22.000Z"
 *       401:
 *         description: Unauthorized - Token missing, invalid, expired, or not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Access denied. No token provided.
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Access denied. Admin privileges required.
 *       500:
 *         description: Server error
 */
UserRouter.get(
  "/getAllUsers",
  asyncHandler(verifyToken as express.RequestHandler),
  getAllUsersController as unknown as express.RequestHandler
);

export default UserRouter;
