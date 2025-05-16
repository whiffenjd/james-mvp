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

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Password Management APIs
 */

/**
 * @swagger
 * /auth/user/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     description: Logs in a user by providing their email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c85"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "user@example.com"
 *                         role:
 *                           type: string
 *                           example: "user"
 *                         isEmailVerified:
 *                           type: boolean
 *                           example: true
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *       400:
 *         description: Invalid credentials or missing required fields
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
authRouter.post("/login", login);

/**
 * @swagger
 * /auth/user/logout:
 *   post:
 *     summary: Logout the currently logged-in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     description: Requires a valid Bearer token in the Authorization header
 *     responses:
 *       200:
 *         description: Logged out successfully
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
 *                   example: Logged out successfully.
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
 *       500:
 *         description: Server error
 */
authRouter.post(
  "/logout",
  verifyToken,
  logout as unknown as express.RequestHandler
);

/**
 * @swagger
 * /auth/user/resetPasswordRequest:
 *   post:
 *     summary: Send password reset email
 *     tags: [Auth]
 *     description: Sends a password reset email to the user with the provided email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reset link sent
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
 *                   example: Reset link sent
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     message:
 *                       type: string
 *                       example: Password reset email sent successfully
 *       400:
 *         description: Email required or invalid format
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
authRouter.post(
  "/resetPasswordRequest",
  requestPasswordResetMail as unknown as express.RequestHandler
);

/**
 * @swagger
 * /auth/user/resetPassword:
 *   post:
 *     summary: Reset user password with token
 *     tags: [Auth]
 *     description: Resets the password for the user with the provided email address using the provided token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: newSecurePassword123
 *     responses:
 *       200:
 *         description: Password updated
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
 *                   example: Password updated
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Password updated successfully
 *       400:
 *         description: Missing required fields or invalid password format
 *       401:
 *         description: Invalid or expired token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
authRouter.post(
  "/resetPassword",
  updatePassword as unknown as express.RequestHandler
);

export default authRouter;
